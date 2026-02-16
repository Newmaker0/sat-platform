package com.pedrowilson.sat.mobile.ui.inventory

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pedrowilson.sat.mobile.domain.AuthResult
import com.pedrowilson.sat.mobile.domain.ConsumeResult
import com.pedrowilson.sat.mobile.domain.InventoryRepository
import com.pedrowilson.sat.mobile.domain.RefreshStockResult
import com.pedrowilson.sat.mobile.domain.StockItem
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class InventoryViewModel(
    private val inventoryRepository: InventoryRepository,
) : ViewModel() {

    private val authState = MutableStateFlow(inventoryRepository.hasActiveSession())
    private val screenLoading = MutableStateFlow(false)
    private val backendOfflineSimulationState =
        MutableStateFlow(inventoryRepository.isBackendOfflineSimulationEnabled())
    private val lastBackendContactState =
        MutableStateFlow(inventoryRepository.getLastSuccessfulBackendContactAt())
    private val message = MutableStateFlow<String?>(null)
    private var autoRefreshJob: Job? = null

    private val baseState: StateFlow<InventoryUiState> =
        combine(
            inventoryRepository.observeStockItems(),
            inventoryRepository.observePendingConsumptionsCount(),
            authState,
            screenLoading,
        ) { items, pendingCount, isAuthenticated, isLoading ->
            InventoryUiState(
                items = items,
                pendingCount = pendingCount,
                isAuthenticated = isAuthenticated,
                isLoading = isLoading,
                message = null,
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = InventoryUiState(),
        )

    val uiState: StateFlow<InventoryUiState> =
        combine(
            baseState,
            backendOfflineSimulationState,
            lastBackendContactState,
            message,
        ) { base, backendOfflineSimulationEnabled, lastBackendContactAt, feedback ->
            base.copy(
                backendOfflineSimulationEnabled = backendOfflineSimulationEnabled,
                lastBackendContactAt = lastBackendContactAt,
                message = feedback,
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = InventoryUiState(),
        )

    init {
        if (!authState.value && backendOfflineSimulationState.value) {
            inventoryRepository.setBackendOfflineSimulationEnabled(false)
            backendOfflineSimulationState.value = false
        }

        if (authState.value) {
            refreshStockItems()
            startAutoRefresh()
        }
    }

    fun login(username: String, password: String) {
        viewModelScope.launch {
            screenLoading.value = true
            when (val loginResult = inventoryRepository.login(username.trim(), password.trim())) {
                AuthResult.Success -> {
                    refreshLastBackendContact()
                    authState.value = true
                    message.value = "Login realizado"
                    refreshStockItemsInternal(showSuccessMessage = true)
                    startAutoRefresh()
                }

                is AuthResult.Failure -> {
                    refreshLastBackendContact()
                    message.value = "Falha no login: ${loginResult.message}"
                }
            }
            screenLoading.value = false
        }
    }

    fun logout() {
        inventoryRepository.logout()
        backendOfflineSimulationState.value = false
        authState.value = false
        stopAutoRefresh()
        message.value = "Sessao encerrada"
    }

    fun refreshStockItems() {
        viewModelScope.launch {
            screenLoading.value = true
            refreshStockItemsInternal(showSuccessMessage = true)
            screenLoading.value = false
        }
    }

    fun toggleBackendOfflineSimulation(enabled: Boolean) {
        inventoryRepository.setBackendOfflineSimulationEnabled(enabled)
        backendOfflineSimulationState.value = enabled
        message.value =
            if (enabled) {
                "Modo offline do backend ativado"
            } else {
                "Modo offline do backend desativado"
            }
    }

    fun consume(itemId: Long, quantity: Int) {
        viewModelScope.launch {
            val result = inventoryRepository.consume(itemId, quantity)
            message.value =
                when (result) {
                    ConsumeResult.Success ->
                        "Consumo registrado offline. Sincronizacao automatica agendada."
                    ConsumeResult.InvalidQuantity -> "Quantidade invalida"
                    ConsumeResult.ItemNotFound -> "Item nao encontrado"
                    is ConsumeResult.InsufficientStock ->
                        "Estoque insuficiente. Disponivel: ${result.available}"
                }
        }
    }

    fun clearMessage() {
        message.value = null
    }

    private suspend fun refreshStockItemsInternal() {
        refreshStockItemsInternal(showSuccessMessage = false)
    }

    private suspend fun refreshStockItemsInternal(showSuccessMessage: Boolean) {
        when (val refreshResult = inventoryRepository.refreshStockItems()) {
            is RefreshStockResult.Success -> {
                refreshLastBackendContact()
                if (showSuccessMessage) {
                    message.value = "Estoque atualizado. Itens recebidos: ${refreshResult.count}"
                }
            }

            is RefreshStockResult.Failure -> {
                refreshLastBackendContact()
                message.value = "Falha ao carregar estoque: ${refreshResult.message}"
            }
        }
    }

    private fun refreshLastBackendContact() {
        lastBackendContactState.value = inventoryRepository.getLastSuccessfulBackendContactAt()
    }

    private fun startAutoRefresh() {
        autoRefreshJob?.cancel()
        autoRefreshJob = viewModelScope.launch {
            while (isActive) {
                refreshStockItemsInternal(showSuccessMessage = false)
                delay(AUTO_REFRESH_INTERVAL_MS)
            }
        }
    }

    private fun stopAutoRefresh() {
        autoRefreshJob?.cancel()
        autoRefreshJob = null
    }

    override fun onCleared() {
        stopAutoRefresh()
        super.onCleared()
    }
}

data class InventoryUiState(
    val items: List<StockItem> = emptyList(),
    val pendingCount: Int = 0,
    val isAuthenticated: Boolean = false,
    val isLoading: Boolean = false,
    val backendOfflineSimulationEnabled: Boolean = false,
    val lastBackendContactAt: String? = null,
    val message: String? = null,
)

private const val AUTO_REFRESH_INTERVAL_MS = 20_000L
