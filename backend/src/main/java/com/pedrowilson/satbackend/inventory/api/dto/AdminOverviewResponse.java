package com.pedrowilson.satbackend.inventory.api.dto;

import java.util.List;

public record AdminOverviewResponse(List<StockItemSummary> items, Metrics metrics) {

  public record StockItemSummary(
      Long id, String sku, String name, Integer quantityAvailable, Integer minThreshold, boolean lowStock) {}

  public record Metrics(Long totalItems, Long lowStockItems, Long rejectedEventsLast24h, Long availableUnits) {}
}
