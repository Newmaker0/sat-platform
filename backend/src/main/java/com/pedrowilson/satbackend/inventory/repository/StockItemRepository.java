package com.pedrowilson.satbackend.inventory.repository;

import com.pedrowilson.satbackend.inventory.domain.StockItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockItemRepository extends JpaRepository<StockItem, Long> {

  List<StockItem> findAllByOrderByNameAsc();
}
