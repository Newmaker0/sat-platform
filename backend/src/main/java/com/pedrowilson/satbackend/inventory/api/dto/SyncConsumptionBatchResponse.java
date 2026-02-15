package com.pedrowilson.satbackend.inventory.api.dto;

import java.util.List;

public record SyncConsumptionBatchResponse(List<SyncConsumptionItemResponse> results) {}
