package com.pedrowilson.satbackend.inventory.api;

import com.pedrowilson.satbackend.inventory.api.dto.AdminOverviewResponse;
import com.pedrowilson.satbackend.inventory.api.dto.ApplyAdjustmentRequest;
import com.pedrowilson.satbackend.inventory.api.dto.StockEventResponse;
import com.pedrowilson.satbackend.inventory.application.command.ApplyAdjustmentCommand;
import com.pedrowilson.satbackend.inventory.application.command.ApplyAdjustmentCommandHandler;
import com.pedrowilson.satbackend.inventory.application.query.GetAdminOverviewQuery;
import com.pedrowilson.satbackend.inventory.application.query.GetAdminOverviewQueryHandler;
import com.pedrowilson.satbackend.inventory.application.query.GetStockEventsQuery;
import com.pedrowilson.satbackend.inventory.application.query.GetStockEventsQueryHandler;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminInventoryController {

  private final ApplyAdjustmentCommandHandler applyAdjustmentCommandHandler;
  private final GetAdminOverviewQueryHandler getAdminOverviewQueryHandler;
  private final GetStockEventsQueryHandler getStockEventsQueryHandler;

  public AdminInventoryController(
      ApplyAdjustmentCommandHandler applyAdjustmentCommandHandler,
      GetAdminOverviewQueryHandler getAdminOverviewQueryHandler,
      GetStockEventsQueryHandler getStockEventsQueryHandler) {
    this.applyAdjustmentCommandHandler = applyAdjustmentCommandHandler;
    this.getAdminOverviewQueryHandler = getAdminOverviewQueryHandler;
    this.getStockEventsQueryHandler = getStockEventsQueryHandler;
  }

  @GetMapping("/overview")
  public AdminOverviewResponse overview() {
    return getAdminOverviewQueryHandler.handle(new GetAdminOverviewQuery());
  }

  @GetMapping("/events")
  public List<StockEventResponse> events() {
    return getStockEventsQueryHandler.handle(new GetStockEventsQuery());
  }

  @PostMapping("/adjustments")
  @ResponseStatus(HttpStatus.CREATED)
  public StockEventResponse applyAdjustment(
      @Valid @RequestBody ApplyAdjustmentRequest request, Authentication authentication) {
    return applyAdjustmentCommandHandler.handle(
        new ApplyAdjustmentCommand(request, authentication.getName()));
  }
}
