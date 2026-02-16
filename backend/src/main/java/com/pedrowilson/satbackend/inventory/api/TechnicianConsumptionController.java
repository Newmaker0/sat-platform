package com.pedrowilson.satbackend.inventory.api;

import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionBatchRequest;
import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionBatchResponse;
import com.pedrowilson.satbackend.inventory.api.dto.TechnicianStockItemResponse;
import com.pedrowilson.satbackend.inventory.application.command.SyncConsumptionBatchCommand;
import com.pedrowilson.satbackend.inventory.application.command.SyncConsumptionBatchCommandHandler;
import com.pedrowilson.satbackend.inventory.application.query.GetTechnicianStockItemsQuery;
import com.pedrowilson.satbackend.inventory.application.query.GetTechnicianStockItemsQueryHandler;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/technician/consumptions")
public class TechnicianConsumptionController {

  private final SyncConsumptionBatchCommandHandler syncConsumptionBatchCommandHandler;
  private final GetTechnicianStockItemsQueryHandler getTechnicianStockItemsQueryHandler;

  public TechnicianConsumptionController(
      SyncConsumptionBatchCommandHandler syncConsumptionBatchCommandHandler,
      GetTechnicianStockItemsQueryHandler getTechnicianStockItemsQueryHandler) {
    this.syncConsumptionBatchCommandHandler = syncConsumptionBatchCommandHandler;
    this.getTechnicianStockItemsQueryHandler = getTechnicianStockItemsQueryHandler;
  }

  @GetMapping("/stock-items")
  public List<TechnicianStockItemResponse> stockItems() {
    return getTechnicianStockItemsQueryHandler.handle(new GetTechnicianStockItemsQuery());
  }

  @PostMapping("/batch")
  public SyncConsumptionBatchResponse syncBatch(
      @Valid @RequestBody SyncConsumptionBatchRequest request, Authentication authentication) {
    return syncConsumptionBatchCommandHandler.handle(
        new SyncConsumptionBatchCommand(request, authentication.getName()));
  }
}
