package com.pedrowilson.sat.mobile.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "consumption_events",
    indices = [Index(value = ["external_event_id"], unique = true)],
)
data class ConsumptionEventEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "local_id")
    val localId: Long = 0,
    @ColumnInfo(name = "external_event_id") val externalEventId: String,
    @ColumnInfo(name = "item_id") val itemId: Long,
    val quantity: Int,
    @ColumnInfo(name = "occurred_at") val occurredAt: String,
    @ColumnInfo(name = "sync_status") val syncStatus: String,
    val reason: String?,
    @ColumnInfo(name = "created_at") val createdAt: String,
    @ColumnInfo(name = "synced_at") val syncedAt: String?,
    @ColumnInfo(name = "sync_error") val syncError: String?,
)

object SyncStatus {
    const val PENDING = "PENDING"
    const val SYNCED = "SYNCED"
    const val REJECTED = "REJECTED"
}
