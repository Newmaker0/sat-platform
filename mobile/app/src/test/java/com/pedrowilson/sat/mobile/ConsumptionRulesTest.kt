package com.pedrowilson.sat.mobile

import com.pedrowilson.sat.mobile.domain.ConsumptionRules
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ConsumptionRulesTest {

    @Test
    fun `isValidQuantity should accept positive numbers only`() {
        assertTrue(ConsumptionRules.isValidQuantity(1))
        assertFalse(ConsumptionRules.isValidQuantity(0))
        assertFalse(ConsumptionRules.isValidQuantity(-1))
    }

    @Test
    fun `hasAvailableStock should validate available amount`() {
        assertTrue(ConsumptionRules.hasAvailableStock(available = 10, requested = 3))
        assertTrue(ConsumptionRules.hasAvailableStock(available = 3, requested = 3))
        assertFalse(ConsumptionRules.hasAvailableStock(available = 2, requested = 3))
    }
}
