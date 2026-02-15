package com.pedrowilson.satbackend.inventory.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record StockEventResponse(
    Long id,
    UUID externalEventId,
    Long itemId,
    String itemName,
    String type,
    String status,
    Integer requestedQuantity,
    Integer appliedDelta,
    String reason,
    String source,
    String actor,
    Long adjustsEventId,
    LocalDateTime occurredAt,
    LocalDateTime processedAt) {}
