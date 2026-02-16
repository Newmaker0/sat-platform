package exemplo.refatoracao.pedidos.domain.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record Pedido(UUID id, String clienteId, BigDecimal valor, OffsetDateTime criadoEm) {}
