package com.pedrowilson.satbackend.config;

import com.pedrowilson.satbackend.auth.domain.AppUser;
import com.pedrowilson.satbackend.auth.domain.UserRole;
import com.pedrowilson.satbackend.auth.repository.AppUserRepository;
import com.pedrowilson.satbackend.inventory.domain.StockEvent;
import com.pedrowilson.satbackend.inventory.domain.StockItem;
import com.pedrowilson.satbackend.inventory.repository.StockEventRepository;
import com.pedrowilson.satbackend.inventory.repository.StockItemRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

  @Bean
  CommandLineRunner seedData(
      StockItemRepository stockItemRepository,
      StockEventRepository stockEventRepository,
      AppUserRepository appUserRepository,
      PasswordEncoder passwordEncoder) {
    return args -> {
      if (stockItemRepository.count() == 0) {
        stockItemRepository.saveAll(
            List.of(
                new StockItem("VALV-O2", "Valvula de oxigenio", 10, 4),
                new StockItem("PLC-CIR", "Placa de circuito", 18, 6),
                new StockItem("SENS-TEMP", "Sensor de temperatura", 6, 4),
                new StockItem("FILT-AR", "Filtro de ar", 24, 8),
                new StockItem("BAT-ION", "Bateria de ion-litio", 9, 4)));
      }

      if (stockEventRepository.count() == 0) {
        List<StockItem> items = stockItemRepository.findAllByOrderByNameAsc();
        StockItem oxygenValve = findBySku(items, "VALV-O2");
        StockItem circuitBoard = findBySku(items, "PLC-CIR");
        StockItem tempSensor = findBySku(items, "SENS-TEMP");
        StockItem airFilter = findBySku(items, "FILT-AR");

        LocalDateTime now = LocalDateTime.now().withNano(0);

        oxygenValve.setQuantityAvailable(oxygenValve.getQuantityAvailable() - 3);
        stockItemRepository.save(oxygenValve);
        StockEvent appliedValveEvent =
            stockEventRepository.save(
                StockEvent.consumptionApplied(
                    UUID.fromString("11111111-1111-1111-1111-111111111111"),
                    oxygenValve,
                    3,
                    "Felipe",
                    now.minusHours(12)));

        circuitBoard.setQuantityAvailable(circuitBoard.getQuantityAvailable() - 5);
        stockItemRepository.save(circuitBoard);
        stockEventRepository.save(
            StockEvent.consumptionApplied(
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                circuitBoard,
                5,
                "Gustavo",
                now.minusHours(9)));

        StockEvent rejectedSensorEvent =
            stockEventRepository.save(
                StockEvent.consumptionRejected(
                    UUID.fromString("33333333-3333-3333-3333-333333333333"),
                    tempSensor,
                    9,
                    "Felipe",
                    now.minusHours(6),
                    "INSUFFICIENT_STOCK"));

        tempSensor.setQuantityAvailable(tempSensor.getQuantityAvailable() + 2);
        stockItemRepository.save(tempSensor);
        stockEventRepository.save(
            StockEvent.adjustmentApplied(
                tempSensor,
                2,
                "Pedro",
                "Ajuste administrativo apos conferencia de almoxarifado",
                rejectedSensorEvent.getId(),
                now.minusHours(4)));

        airFilter.setQuantityAvailable(airFilter.getQuantityAvailable() - 4);
        stockItemRepository.save(airFilter);
        stockEventRepository.save(
            StockEvent.consumptionApplied(
                UUID.fromString("44444444-4444-4444-4444-444444444444"),
                airFilter,
                4,
                "Gustavo",
                now.minusHours(2)));

        oxygenValve.setQuantityAvailable(oxygenValve.getQuantityAvailable() - 1);
        stockItemRepository.save(oxygenValve);
        stockEventRepository.save(
            StockEvent.adjustmentApplied(
                oxygenValve,
                -1,
                "Pedro",
                "Correcao de inventario apos auditoria",
                appliedValveEvent.getId(),
                now.minusHours(1)));
      }

      if (appUserRepository.count() == 0) {
        appUserRepository.saveAll(
            List.of(
                new AppUser("Pedro", passwordEncoder.encode("Pedro"), UserRole.ADMIN, true),
                new AppUser("Felipe", passwordEncoder.encode("Felipe"), UserRole.TECHNICIAN, true),
                new AppUser("Gustavo", passwordEncoder.encode("Gustavo"), UserRole.TECHNICIAN, true)));
      }
    };
  }

  private StockItem findBySku(List<StockItem> items, String sku) {
    return items.stream()
        .filter(item -> sku.equalsIgnoreCase(item.getSku()))
        .findFirst()
        .orElseThrow(() -> new IllegalStateException("Stock item not found for SKU: " + sku));
  }
}
