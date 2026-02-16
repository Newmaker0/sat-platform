package exemplo.refatoracao.pedidos.domain.port;

public interface NotificationPort {
    void enviarConfirmacaoPedido(String clienteId, String mensagem);
}
