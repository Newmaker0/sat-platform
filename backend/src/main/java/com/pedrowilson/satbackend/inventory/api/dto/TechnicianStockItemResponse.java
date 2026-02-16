package com.pedrowilson.satbackend.inventory.api.dto;

public record TechnicianStockItemResponse(
    Long id, String sku, String name, Integer quantityAvailable, Integer minimumThreshold) {}

