package exemplo.refatoracao.pedidos.domain.port;

public interface EventPublisherPort {
    void publicar(Object event);
}
