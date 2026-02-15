package com.pedrowilson.satbackend.inventory.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record SyncConsumptionItemRequest(
    @NotNull UUID externalEventId,
    @NotNull Long itemId,
    @NotNull @Min(1) Integer quantity,
    LocalDateTime occurredAt) {}
