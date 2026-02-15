package com.pedrowilson.satbackend.inventory.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_events")
public class StockEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true)
  private UUID externalEventId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "item_id", nullable = false)
  private StockItem item;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EventType type;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EventStatus status;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EventSource source;

  @Column(nullable = false)
  private Integer requestedQuantity;

  @Column(nullable = false)
  private Integer appliedDelta;

  @Column(length = 120)
  private String reason;

  @Column(length = 80)
  private String actor;

  private Long adjustsEventId;

  @Column(nullable = false)
  private LocalDateTime occurredAt;

  @Column(nullable = false)
  private LocalDateTime processedAt;

  protected StockEvent() {
    // JPA
  }

  public static StockEvent consumptionApplied(
      UUID externalEventId,
      StockItem item,
      Integer requestedQuantity,
      String actor,
      LocalDateTime occurredAt) {
    StockEvent event = new StockEvent();
    event.externalEventId = externalEventId;
    event.item = item;
    event.type = EventType.CONSUMPTION;
    event.status = EventStatus.APPLIED;
    event.source = EventSource.TECHNICIAN_SYNC;
    event.requestedQuantity = requestedQuantity;
    event.appliedDelta = requestedQuantity * -1;
    event.actor = actor;
    event.occurredAt = occurredAt;
    return event;
  }

  public static StockEvent consumptionRejected(
      UUID externalEventId,
      StockItem item,
      Integer requestedQuantity,
      String actor,
      LocalDateTime occurredAt,
      String reason) {
    StockEvent event = new StockEvent();
    event.externalEventId = externalEventId;
    event.item = item;
    event.type = EventType.CONSUMPTION;
    event.status = EventStatus.REJECTED;
    event.source = EventSource.TECHNICIAN_SYNC;
    event.requestedQuantity = requestedQuantity;
    event.appliedDelta = 0;
    event.reason = reason;
    event.actor = actor;
    event.occurredAt = occurredAt;
    return event;
  }

  public static StockEvent adjustmentApplied(
      StockItem item, Integer delta, String actor, String reason, Long adjustsEventId) {
    return adjustmentApplied(item, delta, actor, reason, adjustsEventId, LocalDateTime.now());
  }

  public static StockEvent adjustmentApplied(
      StockItem item,
      Integer delta,
      String actor,
      String reason,
      Long adjustsEventId,
      LocalDateTime occurredAt) {
    StockEvent event = new StockEvent();
    event.item = item;
    event.type = EventType.ADJUSTMENT;
    event.status = EventStatus.APPLIED;
    event.source = EventSource.ADMIN_ADJUSTMENT;
    event.requestedQuantity = Math.abs(delta);
    event.appliedDelta = delta;
    event.reason = reason;
    event.actor = actor;
    event.adjustsEventId = adjustsEventId;
    event.occurredAt = occurredAt;
    return event;
  }

  @PrePersist
  void markProcessedAt() {
    this.processedAt = LocalDateTime.now();
    if (this.occurredAt == null) {
      this.occurredAt = this.processedAt;
    }
  }

  public Long getId() {
    return id;
  }

  public UUID getExternalEventId() {
    return externalEventId;
  }

  public StockItem getItem() {
    return item;
  }

  public EventType getType() {
    return type;
  }

  public EventStatus getStatus() {
    return status;
  }

  public EventSource getSource() {
    return source;
  }

  public Integer getRequestedQuantity() {
    return requestedQuantity;
  }

  public Integer getAppliedDelta() {
    return appliedDelta;
  }

  public String getReason() {
    return reason;
  }

  public String getActor() {
    return actor;
  }

  public Long getAdjustsEventId() {
    return adjustsEventId;
  }

  public LocalDateTime getOccurredAt() {
    return occurredAt;
  }

  public LocalDateTime getProcessedAt() {
    return processedAt;
  }
}
