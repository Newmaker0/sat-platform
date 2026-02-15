package com.pedrowilson.satbackend.inventory.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_items")
public class StockItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 60)
  private String sku;

  @Column(nullable = false, length = 140)
  private String name;

  @Column(nullable = false)
  private Integer quantityAvailable;

  @Column(nullable = false)
  private Integer minThreshold;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  protected StockItem() {
    // JPA
  }

  public StockItem(String sku, String name, Integer quantityAvailable, Integer minThreshold) {
    this.sku = sku;
    this.name = name;
    this.quantityAvailable = quantityAvailable;
    this.minThreshold = minThreshold;
  }

  @PrePersist
  @PreUpdate
  void touch() {
    this.updatedAt = LocalDateTime.now();
  }

  public Long getId() {
    return id;
  }

  public String getSku() {
    return sku;
  }

  public String getName() {
    return name;
  }

  public Integer getQuantityAvailable() {
    return quantityAvailable;
  }

  public void setQuantityAvailable(Integer quantityAvailable) {
    this.quantityAvailable = quantityAvailable;
  }

  public Integer getMinThreshold() {
    return minThreshold;
  }
}
