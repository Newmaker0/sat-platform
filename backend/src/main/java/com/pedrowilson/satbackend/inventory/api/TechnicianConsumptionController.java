package com.pedrowilson.satbackend.inventory.api;

import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionBatchRequest;
import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionBatchResponse;
import com.pedrowilson.satbackend.inventory.application.command.SyncConsumptionBatchCommand;
import com.pedrowilson.satbackend.inventory.application.command.SyncConsumptionBatchCommandHandler;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/technician/consumptions")
public class TechnicianConsumptionController {

  private final SyncConsumptionBatchCommandHandler syncConsumptionBatchCommandHandler;

  public TechnicianConsumptionController(
      SyncConsumptionBatchCommandHandler syncConsumptionBatchCommandHandler) {
    this.syncConsumptionBatchCommandHandler = syncConsumptionBatchCommandHandler;
  }

  @PostMapping("/batch")
  public SyncConsumptionBatchResponse syncBatch(
      @Valid @RequestBody SyncConsumptionBatchRequest request, Authentication authentication) {
    return syncConsumptionBatchCommandHandler.handle(
        new SyncConsumptionBatchCommand(request, authentication.getName()));
  }
}
