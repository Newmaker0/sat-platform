package exemplo.refatoracao.pedidos.application.usecase;

import exemplo.refatoracao.pedidos.application.command.CriarPedidoCommand;
import exemplo.refatoracao.pedidos.domain.model.Pedido;

public interface CriarPedidoUseCase {
    Pedido executar(CriarPedidoCommand command);
}
