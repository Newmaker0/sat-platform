package com.pedrowilson.satbackend.inventory.application.mapper;

import com.pedrowilson.satbackend.inventory.api.dto.StockEventResponse;
import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionItemResponse;
import com.pedrowilson.satbackend.inventory.domain.StockEvent;
import org.springframework.stereotype.Component;

@Component
public class StockEventMapper {

  public SyncConsumptionItemResponse toConsumptionResponse(StockEvent event, boolean idempotent) {
    return new SyncConsumptionItemResponse(
        event.getId(),
        event.getExternalEventId(),
        event.getStatus().name(),
        event.getAppliedDelta(),
        event.getReason(),
        event.getItem().getQuantityAvailable(),
        idempotent);
  }

  public StockEventResponse toEventResponse(StockEvent event) {
    return new StockEventResponse(
        event.getId(),
        event.getExternalEventId(),
        event.getItem().getId(),
        event.getItem().getName(),
        event.getType().name(),
        event.getStatus().name(),
        event.getRequestedQuantity(),
        event.getAppliedDelta(),
        event.getReason(),
        event.getSource().name(),
        event.getActor(),
        event.getAdjustsEventId(),
        event.getOccurredAt(),
        event.getProcessedAt());
  }
}
