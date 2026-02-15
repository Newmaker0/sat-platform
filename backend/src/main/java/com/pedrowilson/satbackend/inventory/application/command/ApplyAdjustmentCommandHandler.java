package com.pedrowilson.satbackend.inventory.application.command;

import com.pedrowilson.satbackend.inventory.api.dto.StockEventResponse;
import com.pedrowilson.satbackend.inventory.application.StockRules;
import com.pedrowilson.satbackend.inventory.application.mapper.StockEventMapper;
import com.pedrowilson.satbackend.inventory.domain.StockEvent;
import com.pedrowilson.satbackend.inventory.domain.StockItem;
import com.pedrowilson.satbackend.inventory.repository.StockEventRepository;
import com.pedrowilson.satbackend.inventory.repository.StockItemRepository;
import com.pedrowilson.satbackend.shared.cqrs.CommandHandler;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ApplyAdjustmentCommandHandler
    implements CommandHandler<ApplyAdjustmentCommand, StockEventResponse> {

  private final StockItemRepository stockItemRepository;
  private final StockEventRepository stockEventRepository;
  private final StockEventMapper stockEventMapper;

  public ApplyAdjustmentCommandHandler(
      StockItemRepository stockItemRepository,
      StockEventRepository stockEventRepository,
      StockEventMapper stockEventMapper) {
    this.stockItemRepository = stockItemRepository;
    this.stockEventRepository = stockEventRepository;
    this.stockEventMapper = stockEventMapper;
  }

  @Override
  @Transactional
  public StockEventResponse handle(ApplyAdjustmentCommand command) {
    var request = command.request();

    if (request.delta() == 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ADJUSTMENT_DELTA_CANNOT_BE_ZERO");
    }

    StockItem stockItem =
        stockItemRepository
            .findById(request.itemId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "ITEM_NOT_FOUND"));

    if (!StockRules.canApplyAdjustment(stockItem.getQuantityAvailable(), request.delta())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ADJUSTMENT_WOULD_CREATE_NEGATIVE_STOCK");
    }

    stockItem.setQuantityAvailable(stockItem.getQuantityAvailable() + request.delta());
    stockItemRepository.save(stockItem);

    StockEvent adjustment =
        StockEvent.adjustmentApplied(
            stockItem,
            request.delta(),
            normalizeActor(command.actor()),
            request.reason(),
            request.adjustsEventId());

    return stockEventMapper.toEventResponse(stockEventRepository.save(adjustment));
  }

  private String normalizeActor(String actor) {
    if (actor == null || actor.isBlank()) {
      return "unknown";
    }
    return actor.trim();
  }
}
