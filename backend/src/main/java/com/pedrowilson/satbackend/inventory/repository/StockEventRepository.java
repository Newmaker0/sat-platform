package com.pedrowilson.satbackend.inventory.repository;

import com.pedrowilson.satbackend.inventory.domain.EventStatus;
import com.pedrowilson.satbackend.inventory.domain.StockEvent;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockEventRepository extends JpaRepository<StockEvent, Long> {

  Optional<StockEvent> findByExternalEventId(UUID externalEventId);

  List<StockEvent> findAllByOrderByProcessedAtDesc();

  long countByStatusAndProcessedAtAfter(EventStatus status, LocalDateTime processedAfter);
}
