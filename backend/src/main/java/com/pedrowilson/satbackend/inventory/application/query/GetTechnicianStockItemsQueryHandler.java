package com.pedrowilson.satbackend.inventory.application.query;

import com.pedrowilson.satbackend.inventory.api.dto.TechnicianStockItemResponse;
import com.pedrowilson.satbackend.inventory.repository.StockItemRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GetTechnicianStockItemsQueryHandler {

  private final StockItemRepository stockItemRepository;

  public GetTechnicianStockItemsQueryHandler(StockItemRepository stockItemRepository) {
    this.stockItemRepository = stockItemRepository;
  }

  public List<TechnicianStockItemResponse> handle(GetTechnicianStockItemsQuery query) {
    return stockItemRepository.findAllByOrderByNameAsc().stream()
        .map(
            item ->
                new TechnicianStockItemResponse(
                    item.getId(),
                    item.getSku(),
                    item.getName(),
                    item.getQuantityAvailable(),
                    item.getMinThreshold()))
        .toList();
  }
}

