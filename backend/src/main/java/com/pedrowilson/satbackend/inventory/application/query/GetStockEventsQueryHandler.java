package com.pedrowilson.satbackend.inventory.application.query;

import com.pedrowilson.satbackend.inventory.api.dto.StockEventResponse;
import com.pedrowilson.satbackend.inventory.application.mapper.StockEventMapper;
import com.pedrowilson.satbackend.inventory.repository.StockEventRepository;
import com.pedrowilson.satbackend.shared.cqrs.QueryHandler;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GetStockEventsQueryHandler implements QueryHandler<GetStockEventsQuery, List<StockEventResponse>> {

  private final StockEventRepository stockEventRepository;
  private final StockEventMapper stockEventMapper;

  public GetStockEventsQueryHandler(
      StockEventRepository stockEventRepository, StockEventMapper stockEventMapper) {
    this.stockEventRepository = stockEventRepository;
    this.stockEventMapper = stockEventMapper;
  }

  @Override
  @Transactional(readOnly = true)
  public List<StockEventResponse> handle(GetStockEventsQuery query) {
    return stockEventRepository.findAllByOrderByProcessedAtDesc().stream()
        .map(stockEventMapper::toEventResponse)
        .toList();
  }
}
