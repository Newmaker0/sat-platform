package com.pedrowilson.sat.mobile.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.pedrowilson.sat.mobile.data.local.entity.ConsumptionEventEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ConsumptionEventDao {

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(event: ConsumptionEventEntity)

    @Query("SELECT * FROM consumption_events WHERE sync_status = 'PENDING' ORDER BY created_at ASC LIMIT :limit")
    suspend fun findPending(limit: Int): List<ConsumptionEventEntity>

    @Query("SELECT * FROM consumption_events WHERE external_event_id = :externalEventId LIMIT 1")
    suspend fun findByExternalEventId(externalEventId: String): ConsumptionEventEntity?

    @Query("SELECT COUNT(*) FROM consumption_events WHERE sync_status = 'PENDING'")
    fun observePendingCount(): Flow<Int>

    @Query(
        "UPDATE consumption_events SET sync_status = 'SYNCED', reason = NULL, synced_at = :syncedAt, sync_error = NULL WHERE local_id = :localId"
    )
    suspend fun markSynced(localId: Long, syncedAt: String)

    @Query(
        "UPDATE consumption_events SET sync_status = 'REJECTED', reason = :reason, synced_at = :syncedAt, sync_error = NULL WHERE local_id = :localId"
    )
    suspend fun markRejected(localId: Long, reason: String?, syncedAt: String)

    @Query("UPDATE consumption_events SET sync_error = :error WHERE local_id = :localId")
    suspend fun markSyncError(localId: Long, error: String?)
}
