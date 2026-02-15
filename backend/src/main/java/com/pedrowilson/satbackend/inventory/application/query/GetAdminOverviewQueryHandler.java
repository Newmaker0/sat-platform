package com.pedrowilson.satbackend.inventory.application.query;

import com.pedrowilson.satbackend.inventory.api.dto.AdminOverviewResponse;
import com.pedrowilson.satbackend.inventory.domain.EventStatus;
import com.pedrowilson.satbackend.inventory.repository.StockEventRepository;
import com.pedrowilson.satbackend.inventory.repository.StockItemRepository;
import com.pedrowilson.satbackend.shared.cqrs.QueryHandler;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GetAdminOverviewQueryHandler
    implements QueryHandler<GetAdminOverviewQuery, AdminOverviewResponse> {

  private final StockItemRepository stockItemRepository;
  private final StockEventRepository stockEventRepository;

  public GetAdminOverviewQueryHandler(
      StockItemRepository stockItemRepository, StockEventRepository stockEventRepository) {
    this.stockItemRepository = stockItemRepository;
    this.stockEventRepository = stockEventRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public AdminOverviewResponse handle(GetAdminOverviewQuery query) {
    var items = stockItemRepository.findAllByOrderByNameAsc();

    var summaries =
        items.stream()
            .map(
                item ->
                    new AdminOverviewResponse.StockItemSummary(
                        item.getId(),
                        item.getSku(),
                        item.getName(),
                        item.getQuantityAvailable(),
                        item.getMinThreshold(),
                        item.getQuantityAvailable() <= item.getMinThreshold()))
            .toList();

    long lowStock = summaries.stream().filter(AdminOverviewResponse.StockItemSummary::lowStock).count();
    long availableUnits = summaries.stream().mapToLong(AdminOverviewResponse.StockItemSummary::quantityAvailable).sum();
    long rejectedLast24h =
        stockEventRepository.countByStatusAndProcessedAtAfter(
            EventStatus.REJECTED, LocalDateTime.now().minusHours(24));

    var metrics =
        new AdminOverviewResponse.Metrics(
            (long) summaries.size(), lowStock, rejectedLast24h, availableUnits);

    return new AdminOverviewResponse(summaries, metrics);
  }
}
