package com.pedrowilson.sat.mobile.ui.inventory

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.pedrowilson.sat.mobile.domain.StockItem
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    uiState: InventoryUiState,
    onConsume: (Long, Int) -> Unit,
    onRefreshStock: () -> Unit,
    onLogout: () -> Unit,
    onBackendOfflineSimulationChange: (Boolean) -> Unit,
    onMessageShown: () -> Unit,
) {
    val snackbarHostState = remember { SnackbarHostState() }
    var selectedItem by remember { mutableStateOf<StockItem?>(null) }
    var quantityInput by remember { mutableStateOf("1") }

    LaunchedEffect(uiState.message) {
        val message = uiState.message ?: return@LaunchedEffect
        snackbarHostState.showSnackbar(message)
        onMessageShown()
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "Estoque do tecnico") })
        },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onRefreshStock, enabled = !uiState.isLoading) {
                    Text("Atualizar estoque")
                }
                Button(onClick = onLogout) {
                    Text("Sair")
                }
            }

            BackendOfflineToggle(
                enabled = uiState.backendOfflineSimulationEnabled,
                onCheckedChange = onBackendOfflineSimulationChange,
            )

            SyncSummaryCard(
                pendingCount = uiState.pendingCount,
                lastBackendContactAt = uiState.lastBackendContactAt,
            )

            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(uiState.items, key = { it.id }) { item ->
                    StockItemCard(
                        item = item,
                        onConsumeClick = {
                            selectedItem = item
                            quantityInput = "1"
                        },
                    )
                }
            }
        }
    }

    if (selectedItem != null) {
        AlertDialog(
            onDismissRequest = { selectedItem = null },
            title = { Text("Registrar consumo") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = selectedItem?.name.orEmpty())
                    OutlinedTextField(
                        value = quantityInput,
                        onValueChange = { quantityInput = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Quantidade") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val quantity = quantityInput.toIntOrNull() ?: 0
                        val item = selectedItem
                        if (item != null) {
                            onConsume(item.id, quantity)
                        }
                        selectedItem = null
                    }
                ) {
                    Text("Salvar")
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedItem = null }) {
                    Text("Cancelar")
                }
            },
        )
    }
}

@Composable
private fun BackendOfflineToggle(
    enabled: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text("Simular backend offline", style = MaterialTheme.typography.titleSmall)
                Text(
                    "Forca falha nas chamadas para testar fila e sincronizacao automatica.",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
            Switch(checked = enabled, onCheckedChange = onCheckedChange)
        }
    }
}

@Composable
private fun SyncSummaryCard(
    pendingCount: Int,
    lastBackendContactAt: String?,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(text = "Eventos pendentes", style = MaterialTheme.typography.titleMedium)
                Text(text = pendingCount.toString(), style = MaterialTheme.typography.headlineSmall)
                Text(
                    text =
                        if (pendingCount > 0) {
                            "Sincronizacao automatica em background (aguardando worker/rede)."
                        } else {
                            "Sincronizado com backend."
                        },
                    style = MaterialTheme.typography.bodySmall,
                )
                Text(
                    text = "Ultima comunicacao: ${formatDateTime(lastBackendContactAt)}",
                    style = MaterialTheme.typography.bodySmall,
                )
            }

            if (pendingCount > 0) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }
        }
    }
}

private fun formatDateTime(value: String?): String {
    if (value.isNullOrBlank()) return "ainda nao registrada"
    return try {
        val parsed = LocalDateTime.parse(value)
        parsed.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
    } catch (_: Exception) {
        value
    }
}

@Composable
private fun StockItemCard(
    item: StockItem,
    onConsumeClick: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(text = item.name, style = MaterialTheme.typography.titleMedium)
            Text(text = "SKU: ${item.sku}")
            Text(text = "Disponivel: ${item.quantityAvailable}")
            Text(text = "Minimo: ${item.minimumThreshold}")
            Button(onClick = onConsumeClick) {
                Text(text = "Registrar consumo")
            }
        }
    }
}
