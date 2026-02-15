package com.pedrowilson.satbackend.inventory.application.command;

import com.pedrowilson.satbackend.inventory.api.dto.ApplyAdjustmentRequest;

public record ApplyAdjustmentCommand(ApplyAdjustmentRequest request, String actor) {}
