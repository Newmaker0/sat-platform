package com.pedrowilson.sat.mobile.domain

data class StockItem(
    val id: Long,
    val sku: String,
    val name: String,
    val quantityAvailable: Int,
    val minimumThreshold: Int,
)
