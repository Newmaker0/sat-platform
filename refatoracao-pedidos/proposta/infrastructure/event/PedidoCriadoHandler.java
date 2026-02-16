package exemplo.refatoracao.pedidos.infrastructure.event;

import exemplo.refatoracao.pedidos.domain.port.NotificationPort;

public class PedidoCriadoHandler {

    private final NotificationPort notificationPort;

    public PedidoCriadoHandler(NotificationPort notificationPort) {
        this.notificationPort = notificationPort;
    }

    public void onPedidoCriado(PedidoCriadoEvent event) {
        notificationPort.enviarConfirmacaoPedido(event.clienteId(), "Pedido criado com sucesso");
    }
}
