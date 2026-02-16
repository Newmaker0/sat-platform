package com.pedrowilson.sat.mobile.work

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.pedrowilson.sat.mobile.domain.InventoryRepository
import com.pedrowilson.sat.mobile.domain.RefreshStockResult
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class SyncConsumptionWorker(
    appContext: Context,
    workerParameters: WorkerParameters,
) : CoroutineWorker(appContext, workerParameters), KoinComponent {

    private val inventoryRepository: InventoryRepository by inject()

    override suspend fun doWork(): Result {
        val refreshResult = inventoryRepository.refreshStockItems()
        val syncResult = inventoryRepository.syncPendingConsumptions()

        val refreshFailed = refreshResult is RefreshStockResult.Failure
        return if (syncResult.retryableFailure || refreshFailed) {
            Result.retry()
        } else {
            Result.success()
        }
    }
}
