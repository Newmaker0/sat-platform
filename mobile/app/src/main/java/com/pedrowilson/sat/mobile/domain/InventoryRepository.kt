package com.pedrowilson.sat.mobile.domain

import kotlinx.coroutines.flow.Flow

interface InventoryRepository {
    fun hasActiveSession(): Boolean
    fun getLastSuccessfulBackendContactAt(): String?
    fun isBackendOfflineSimulationEnabled(): Boolean
    fun setBackendOfflineSimulationEnabled(enabled: Boolean)
    suspend fun login(username: String, password: String): AuthResult
    fun logout()
    fun observeStockItems(): Flow<List<StockItem>>
    fun observePendingConsumptionsCount(): Flow<Int>
    suspend fun refreshStockItems(): RefreshStockResult
    suspend fun consume(itemId: Long, quantity: Int): ConsumeResult
    suspend fun syncPendingConsumptions(): SyncExecutionResult
    fun triggerImmediateSync()
}

sealed interface AuthResult {
    data object Success : AuthResult
    data class Failure(val message: String) : AuthResult
}

sealed interface RefreshStockResult {
    data class Success(val count: Int) : RefreshStockResult
    data class Failure(val message: String) : RefreshStockResult
}

sealed interface ConsumeResult {
    data object Success : ConsumeResult
    data object InvalidQuantity : ConsumeResult
    data object ItemNotFound : ConsumeResult
    data class InsufficientStock(val available: Int) : ConsumeResult
}

data class SyncExecutionResult(
    val processedEvents: Int,
    val retryableFailure: Boolean,
)
