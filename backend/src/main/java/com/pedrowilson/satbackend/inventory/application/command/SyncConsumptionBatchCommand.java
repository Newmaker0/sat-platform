package com.pedrowilson.satbackend.inventory.application.command;

import com.pedrowilson.satbackend.inventory.api.dto.SyncConsumptionBatchRequest;

public record SyncConsumptionBatchCommand(SyncConsumptionBatchRequest request, String actor) {}
