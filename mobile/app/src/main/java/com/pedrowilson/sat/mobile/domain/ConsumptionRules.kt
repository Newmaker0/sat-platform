package com.pedrowilson.sat.mobile.domain

object ConsumptionRules {
    fun isValidQuantity(quantity: Int): Boolean = quantity > 0

    fun hasAvailableStock(available: Int, requested: Int): Boolean =
        isValidQuantity(requested) && available >= requested
}
