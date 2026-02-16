package com.pedrowilson.sat.mobile.data.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.pedrowilson.sat.mobile.domain.InventoryRepository
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

/**
 * Backward-compatible worker kept to execute old WorkManager rows
 * created with the previous class name.
 */
class SyncConsumptionsWorker(
    appContext: Context,
    workerParameters: WorkerParameters,
) : CoroutineWorker(appContext, workerParameters), KoinComponent {

    private val inventoryRepository: InventoryRepository by inject()

    override suspend fun doWork(): Result {
        val syncResult = inventoryRepository.syncPendingConsumptions()
        return if (syncResult.retryableFailure) Result.retry() else Result.success()
    }
}
