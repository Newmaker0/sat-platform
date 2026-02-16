package com.pedrowilson.satbackend.inventory.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.pedrowilson.satbackend.inventory.api.dto.ApplyAdjustmentRequest;
import com.pedrowilson.satbackend.inventory.api.dto.StockEventResponse;
import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionBatchRequest;
import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionItemRequest;
import com.pedrowilson.satbackend.inventory.application.command.ApplyAdjustmentCommand;
import com.pedrowilson.satbackend.inventory.application.command.ApplyAdjustmentCommandHandler;
import com.pedrowilson.satbackend.inventory.application.command.SyncConsumptionBatchCommand;
import com.pedrowilson.satbackend.inventory.application.command.SyncConsumptionBatchCommandHandler;
import com.pedrowilson.satbackend.inventory.application.query.GetStockEventsQuery;
import com.pedrowilson.satbackend.inventory.application.query.GetStockEventsQueryHandler;
import com.pedrowilson.satbackend.inventory.application.query.GetTechnicianStockItemsQuery;
import com.pedrowilson.satbackend.inventory.application.query.GetTechnicianStockItemsQueryHandler;
import com.pedrowilson.satbackend.inventory.domain.StockItem;
import com.pedrowilson.satbackend.inventory.repository.StockEventRepository;
import com.pedrowilson.satbackend.inventory.repository.StockItemRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class InventoryServiceTest {

  @Autowired private SyncConsumptionBatchCommandHandler syncConsumptionBatchCommandHandler;

  @Autowired private ApplyAdjustmentCommandHandler applyAdjustmentCommandHandler;

  @Autowired private GetStockEventsQueryHandler getStockEventsQueryHandler;

  @Autowired private GetTechnicianStockItemsQueryHandler getTechnicianStockItemsQueryHandler;

  @Autowired private StockItemRepository stockItemRepository;

  @Autowired private StockEventRepository stockEventRepository;

  @BeforeEach
  void setUp() {
    stockEventRepository.deleteAll();
    stockItemRepository.deleteAll();
  }

  @Test
  void shouldRegisterConflictAndAllowAdjustmentWithoutReplacingHistory() {
    StockItem item = stockItemRepository.save(new StockItem("VALV-O2", "Valvula de oxigenio", 5, 2));

    UUID eventA = UUID.randomUUID();
    UUID eventB = UUID.randomUUID();

    var syncResponse =
        syncConsumptionBatchCommandHandler.handle(
            new SyncConsumptionBatchCommand(
                new SyncConsumptionBatchRequest(
                    List.of(
                        new SyncConsumptionItemRequest(eventA, item.getId(), 4, null),
                        new SyncConsumptionItemRequest(eventB, item.getId(), 3, null))),
                "tech-01"));

    assertThat(syncResponse.results()).hasSize(2);
    assertThat(syncResponse.results().get(0).status()).isEqualTo("APPLIED");
    assertThat(syncResponse.results().get(0).appliedDelta()).isEqualTo(-4);
    assertThat(syncResponse.results().get(1).status()).isEqualTo("REJECTED");
    assertThat(syncResponse.results().get(1).reason()).isEqualTo("INSUFFICIENT_STOCK");

    StockEventResponse adjustmentResponse =
        applyAdjustmentCommandHandler.handle(
            new ApplyAdjustmentCommand(
                new ApplyAdjustmentRequest(
                    item.getId(),
                    +2,
                    "Correcao operacional: consumo correto era placa de circuito",
                    syncResponse.results().get(0).eventId()),
                "admin-ops"));

    assertThat(adjustmentResponse.type()).isEqualTo("ADJUSTMENT");
    assertThat(adjustmentResponse.status()).isEqualTo("APPLIED");
    assertThat(adjustmentResponse.appliedDelta()).isEqualTo(2);

    StockItem refreshed = stockItemRepository.findById(item.getId()).orElseThrow();
    assertThat(refreshed.getQuantityAvailable()).isEqualTo(3);

    List<StockEventResponse> history =
        getStockEventsQueryHandler.handle(new GetStockEventsQuery());
    assertThat(history).hasSize(3);
    assertThat(history.stream().filter(event -> "REJECTED".equals(event.status())).count()).isEqualTo(1);
    assertThat(history.stream().filter(event -> "ADJUSTMENT".equals(event.type())).count()).isEqualTo(1);
    assertThat(history.stream().anyMatch(event -> event.id().equals(adjustmentResponse.id()))).isTrue();
  }

  @Test
  void shouldReturnTechnicianStockItemsSortedByName() {
    stockItemRepository.save(new StockItem("SKU-3", "Zeta Item", 2, 1));
    stockItemRepository.save(new StockItem("SKU-1", "Alpha Item", 7, 3));
    stockItemRepository.save(new StockItem("SKU-2", "Beta Item", 4, 2));

    var response = getTechnicianStockItemsQueryHandler.handle(new GetTechnicianStockItemsQuery());

    assertThat(response).hasSize(3);
    assertThat(response.get(0).name()).isEqualTo("Alpha Item");
    assertThat(response.get(0).quantityAvailable()).isEqualTo(7);
    assertThat(response.get(0).minimumThreshold()).isEqualTo(3);
    assertThat(response.get(1).name()).isEqualTo("Beta Item");
    assertThat(response.get(2).name()).isEqualTo("Zeta Item");
  }
}
