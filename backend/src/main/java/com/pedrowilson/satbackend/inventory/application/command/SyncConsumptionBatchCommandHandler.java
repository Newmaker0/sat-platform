package com.pedrowilson.satbackend.inventory.application.command;

import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionBatchResponse;
import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionItemResponse;
import com.pedrowilson.satbackend.inventory.application.StockRules;
import com.pedrowilson.satbackend.inventory.application.mapper.StockEventMapper;
import com.pedrowilson.satbackend.inventory.domain.EventStatus;
import com.pedrowilson.satbackend.inventory.domain.StockEvent;
import com.pedrowilson.satbackend.inventory.domain.StockItem;
import com.pedrowilson.satbackend.inventory.repository.StockEventRepository;
import com.pedrowilson.satbackend.inventory.repository.StockItemRepository;
import com.pedrowilson.satbackend.shared.cqrs.CommandHandler;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SyncConsumptionBatchCommandHandler
    implements CommandHandler<SyncConsumptionBatchCommand, SyncConsumptionBatchResponse> {

  private final StockItemRepository stockItemRepository;
  private final StockEventRepository stockEventRepository;
  private final StockEventMapper stockEventMapper;

  public SyncConsumptionBatchCommandHandler(
      StockItemRepository stockItemRepository,
      StockEventRepository stockEventRepository,
      StockEventMapper stockEventMapper) {
    this.stockItemRepository = stockItemRepository;
    this.stockEventRepository = stockEventRepository;
    this.stockEventMapper = stockEventMapper;
  }

  @Override
  @Transactional
  public SyncConsumptionBatchResponse handle(SyncConsumptionBatchCommand command) {
    List<SyncConsumptionItemResponse> results = new ArrayList<>();

    for (var itemRequest : command.request().events()) {
      StockEvent existingEvent =
          stockEventRepository.findByExternalEventId(itemRequest.externalEventId()).orElse(null);

      if (existingEvent != null) {
        results.add(stockEventMapper.toConsumptionResponse(existingEvent, true));
        continue;
      }

      StockItem stockItem =
          stockItemRepository
              .findById(itemRequest.itemId())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "ITEM_NOT_FOUND"));

      StockRules.ConsumptionDecision decision =
          StockRules.evaluateConsumption(stockItem.getQuantityAvailable(), itemRequest.quantity());

      StockEvent event;
      LocalDateTime occurredAt =
          itemRequest.occurredAt() != null ? itemRequest.occurredAt() : LocalDateTime.now();

      if (decision.status() == EventStatus.APPLIED) {
        stockItem.setQuantityAvailable(stockItem.getQuantityAvailable() + decision.appliedDelta());
        stockItemRepository.save(stockItem);

        event =
            StockEvent.consumptionApplied(
                itemRequest.externalEventId(),
                stockItem,
                itemRequest.quantity(),
                normalizeActor(command.actor()),
                occurredAt);
      } else {
        event =
            StockEvent.consumptionRejected(
                itemRequest.externalEventId(),
                stockItem,
                itemRequest.quantity(),
                normalizeActor(command.actor()),
                occurredAt,
                decision.reason());
      }

      StockEvent saved = stockEventRepository.save(event);
      results.add(stockEventMapper.toConsumptionResponse(saved, false));
    }

    return new SyncConsumptionBatchResponse(results);
  }

  private String normalizeActor(String actor) {
    if (actor == null || actor.isBlank()) {
      return "unknown";
    }
    return actor.trim();
  }
}
