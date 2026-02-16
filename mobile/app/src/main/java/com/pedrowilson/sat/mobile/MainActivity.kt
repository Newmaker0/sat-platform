package com.pedrowilson.sat.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import com.pedrowilson.sat.mobile.ui.inventory.InventoryScreen
import com.pedrowilson.sat.mobile.ui.inventory.InventoryViewModel
import com.pedrowilson.sat.mobile.ui.inventory.LoginScreen
import com.pedrowilson.sat.mobile.ui.theme.SatmobileTheme
import org.koin.androidx.viewmodel.ext.android.viewModel

class MainActivity : ComponentActivity() {

    private val inventoryViewModel: InventoryViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val uiState by inventoryViewModel.uiState.collectAsState()

            SatmobileTheme {
                if (!uiState.isAuthenticated) {
                    LoginScreen(
                        isLoading = uiState.isLoading,
                        message = uiState.message,
                        onLogin = inventoryViewModel::login,
                    )
                } else {
                    InventoryScreen(
                        uiState = uiState,
                        onConsume = inventoryViewModel::consume,
                        onRefreshStock = inventoryViewModel::refreshStockItems,
                        onLogout = inventoryViewModel::logout,
                        onBackendOfflineSimulationChange = inventoryViewModel::toggleBackendOfflineSimulation,
                        onMessageShown = inventoryViewModel::clearMessage,
                    )
                }
            }
        }
    }
}
