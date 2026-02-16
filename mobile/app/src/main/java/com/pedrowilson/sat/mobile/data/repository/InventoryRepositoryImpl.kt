package com.pedrowilson.sat.mobile.data.repository

import android.content.Context
import androidx.room.withTransaction
import com.pedrowilson.sat.mobile.data.local.AppDatabase
import com.pedrowilson.sat.mobile.data.local.dao.ConsumptionEventDao
import com.pedrowilson.sat.mobile.data.local.dao.StockItemDao
import com.pedrowilson.sat.mobile.data.local.entity.ConsumptionEventEntity
import com.pedrowilson.sat.mobile.data.local.entity.StockItemEntity
import com.pedrowilson.sat.mobile.data.local.entity.SyncStatus
import com.pedrowilson.sat.mobile.data.remote.BackendApiClient
import com.pedrowilson.sat.mobile.data.remote.LoginApiResult
import com.pedrowilson.sat.mobile.domain.AuthResult
import com.pedrowilson.sat.mobile.domain.ConsumeResult
import com.pedrowilson.sat.mobile.domain.ConsumptionRules
import com.pedrowilson.sat.mobile.domain.InventoryRepository
import com.pedrowilson.sat.mobile.domain.RefreshStockResult
import com.pedrowilson.sat.mobile.domain.StockItem
import com.pedrowilson.sat.mobile.domain.SyncExecutionResult
import com.pedrowilson.sat.mobile.work.SyncWorkScheduler
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class InventoryRepositoryImpl(
    private val context: Context,
    private val database: AppDatabase,
    private val stockItemDao: StockItemDao,
    private val consumptionEventDao: ConsumptionEventDao,
    private val backendApiClient: BackendApiClient,
) : InventoryRepository {

    override fun hasActiveSession(): Boolean = backendApiClient.hasSavedSession()
    override fun getLastSuccessfulBackendContactAt(): String? =
        backendApiClient.getLastSuccessfulBackendContactAt()

    override fun isBackendOfflineSimulationEnabled(): Boolean =
        backendApiClient.isBackendOfflineSimulationEnabled()

    override fun setBackendOfflineSimulationEnabled(enabled: Boolean) {
        backendApiClient.setBackendOfflineSimulationEnabled(enabled)
    }

    override suspend fun login(username: String, password: String): AuthResult =
        when (val result = backendApiClient.login(username, password)) {
            LoginApiResult.Success -> AuthResult.Success
            is LoginApiResult.Failure -> AuthResult.Failure(result.message)
        }

    override fun logout() {
        backendApiClient.clearSession()
        backendApiClient.setBackendOfflineSimulationEnabled(false)
    }

    override fun observeStockItems(): Flow<List<StockItem>> =
        stockItemDao.observeAll().map { entities -> entities.map { it.toDomain() } }

    override fun observePendingConsumptionsCount(): Flow<Int> =
        consumptionEventDao.observePendingCount()

    override suspend fun refreshStockItems(): RefreshStockResult {
        return try {
            val remoteItems = backendApiClient.fetchStockItems()
            val now = nowIsoLocalDateTime()
            val localItems = remoteItems.map { item ->
                StockItemEntity(
                    id = item.id,
                    sku = item.sku,
                    name = item.name,
                    quantityAvailable = item.quantityAvailable,
                    minimumThreshold = item.minimumThreshold,
                    updatedAt = now,
                )
            }
            stockItemDao.upsertAll(localItems)
            RefreshStockResult.Success(localItems.size)
        } catch (exception: Exception) {
            RefreshStockResult.Failure(exception.message ?: "Falha ao carregar estoque")
        }
    }

    override suspend fun consume(itemId: Long, quantity: Int): ConsumeResult {
        if (!ConsumptionRules.isValidQuantity(quantity)) {
            return ConsumeResult.InvalidQuantity
        }

        var consumeResult: ConsumeResult = ConsumeResult.ItemNotFound

        database.withTransaction {
            val item = stockItemDao.findById(itemId)
            if (item == null) {
                consumeResult = ConsumeResult.ItemNotFound
                return@withTransaction
            }

            if (!ConsumptionRules.hasAvailableStock(item.quantityAvailable, quantity)) {
                consumeResult = ConsumeResult.InsufficientStock(item.quantityAvailable)
                return@withTransaction
            }

            val now = nowIsoLocalDateTime()
            stockItemDao.updateQuantity(
                itemId = item.id,
                quantity = item.quantityAvailable - quantity,
                updatedAt = now,
            )

            consumptionEventDao.insert(
                ConsumptionEventEntity(
                    externalEventId = UUID.randomUUID().toString(),
                    itemId = item.id,
                    quantity = quantity,
                    occurredAt = now,
                    syncStatus = SyncStatus.PENDING,
                    reason = null,
                    createdAt = now,
                    syncedAt = null,
                    syncError = null,
                )
            )

            consumeResult = ConsumeResult.Success
        }

        if (consumeResult == ConsumeResult.Success) {
            triggerImmediateSync()
        }

        return consumeResult
    }

    override suspend fun syncPendingConsumptions(): SyncExecutionResult {
        val pendingEvents = consumptionEventDao.findPending(limit = SYNC_BATCH_SIZE)
        if (pendingEvents.isEmpty()) {
            return SyncExecutionResult(processedEvents = 0, retryableFailure = false)
        }

        return try {
            val results = backendApiClient.syncConsumptionBatch(pendingEvents)
            val now = nowIsoLocalDateTime()

            database.withTransaction {
                val resultsByExternalId = results.associateBy { it.externalEventId }
                pendingEvents.forEach { pendingEvent ->
                    val syncResult = resultsByExternalId[pendingEvent.externalEventId]
                    when (syncResult?.status?.uppercase()) {
                        "APPLIED" -> {
                            consumptionEventDao.markSynced(pendingEvent.localId, now)
                        }

                        "REJECTED" -> {
                            val item = stockItemDao.findById(pendingEvent.itemId)
                            if (item != null) {
                                stockItemDao.updateQuantity(
                                    itemId = item.id,
                                    quantity = item.quantityAvailable + pendingEvent.quantity,
                                    updatedAt = now,
                                )
                            }
                            consumptionEventDao.markRejected(
                                localId = pendingEvent.localId,
                                reason = syncResult.reason,
                                syncedAt = now,
                            )
                        }

                        else -> {
                            consumptionEventDao.markSyncError(
                                localId = pendingEvent.localId,
                                error = "Resposta sem status para ${pendingEvent.externalEventId}",
                            )
                        }
                    }
                }
            }

            SyncExecutionResult(processedEvents = pendingEvents.size, retryableFailure = false)
        } catch (exception: Exception) {
            val message = exception.message ?: exception.javaClass.simpleName
            pendingEvents.forEach { pendingEvent ->
                consumptionEventDao.markSyncError(
                    localId = pendingEvent.localId,
                    error = message,
                )
            }
            SyncExecutionResult(processedEvents = 0, retryableFailure = true)
        }
    }

    override fun triggerImmediateSync() {
        SyncWorkScheduler.enqueueImmediate(context)
    }

    private fun StockItemEntity.toDomain(): StockItem =
        StockItem(
            id = id,
            sku = sku,
            name = name,
            quantityAvailable = quantityAvailable,
            minimumThreshold = minimumThreshold,
        )

    private fun nowIsoLocalDateTime(): String =
        LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).toString()

    companion object {
        private const val SYNC_BATCH_SIZE = 30
    }
}
