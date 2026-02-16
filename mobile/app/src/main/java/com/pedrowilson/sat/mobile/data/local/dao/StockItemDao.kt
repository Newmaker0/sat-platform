package com.pedrowilson.sat.mobile.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.pedrowilson.sat.mobile.data.local.entity.StockItemEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StockItemDao {

    @Query("SELECT * FROM stock_items ORDER BY name ASC")
    fun observeAll(): Flow<List<StockItemEntity>>

    @Query("SELECT * FROM stock_items WHERE id = :itemId LIMIT 1")
    suspend fun findById(itemId: Long): StockItemEntity?

    @Query("SELECT COUNT(*) FROM stock_items")
    suspend fun count(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(items: List<StockItemEntity>)

    @Query("UPDATE stock_items SET quantity_available = :quantity, updated_at = :updatedAt WHERE id = :itemId")
    suspend fun updateQuantity(itemId: Long, quantity: Int, updatedAt: String)
}
