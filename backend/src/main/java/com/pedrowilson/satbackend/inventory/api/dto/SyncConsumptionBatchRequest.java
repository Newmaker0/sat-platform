package com.pedrowilson.satbackend.inventory.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SyncConsumptionBatchRequest(@NotEmpty List<@Valid SyncConsumptionItemRequest> events) {}
