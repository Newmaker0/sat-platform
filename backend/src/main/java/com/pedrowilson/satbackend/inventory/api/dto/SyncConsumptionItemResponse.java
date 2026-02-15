package com.pedrowilson.satbackend.inventory.api.dto;

import java.util.UUID;

public record SyncConsumptionItemResponse(
    Long eventId,
    UUID externalEventId,
    String status,
    Integer appliedDelta,
    String reason,
    Integer currentQuantity,
    boolean idempotent) {}
