package exemplo.refatoracao.pedidos.infrastructure.event;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PedidoCriadoEvent(UUID pedidoId, String clienteId, OffsetDateTime criadoEm) {}
