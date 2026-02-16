package com.pedrowilson.sat.mobile.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "stock_items")
data class StockItemEntity(
    @PrimaryKey val id: Long,
    val sku: String,
    val name: String,
    @ColumnInfo(name = "quantity_available") val quantityAvailable: Int,
    @ColumnInfo(name = "minimum_threshold") val minimumThreshold: Int,
    @ColumnInfo(name = "updated_at") val updatedAt: String,
)
