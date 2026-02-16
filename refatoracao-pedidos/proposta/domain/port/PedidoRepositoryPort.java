package exemplo.refatoracao.pedidos.domain.port;

import exemplo.refatoracao.pedidos.domain.model.Pedido;

public interface PedidoRepositoryPort {
    void salvar(Pedido pedido);
}
