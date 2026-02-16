package exemplo.refatoracao.pedidos.application.command;

import java.math.BigDecimal;

public record CriarPedidoCommand(String clienteId, BigDecimal valor) {}
