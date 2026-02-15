package com.pedrowilson.satbackend.inventory.application;

import com.pedrowilson.satbackend.inventory.domain.EventStatus;

public final class StockRules {

  private StockRules() {}

  public static ConsumptionDecision evaluateConsumption(int quantityAvailable, int requestedQuantity) {
    if (requestedQuantity <= 0) {
      return new ConsumptionDecision(EventStatus.REJECTED, 0, "INVALID_QUANTITY");
    }

    if (quantityAvailable >= requestedQuantity) {
      return new ConsumptionDecision(EventStatus.APPLIED, requestedQuantity * -1, null);
    }

    return new ConsumptionDecision(EventStatus.REJECTED, 0, "INSUFFICIENT_STOCK");
  }

  public static boolean canApplyAdjustment(int quantityAvailable, int adjustmentDelta) {
    return quantityAvailable + adjustmentDelta >= 0;
  }

  public record ConsumptionDecision(EventStatus status, int appliedDelta, String reason) {}
}
