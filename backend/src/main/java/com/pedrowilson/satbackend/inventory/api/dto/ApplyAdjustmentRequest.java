package com.pedrowilson.satbackend.inventory.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ApplyAdjustmentRequest(
    @NotNull Long itemId, @NotNull Integer delta, @NotBlank String reason, Long adjustsEventId) {}
