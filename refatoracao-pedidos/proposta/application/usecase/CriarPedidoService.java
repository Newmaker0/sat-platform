package exemplo.refatoracao.pedidos.application.usecase;

import exemplo.refatoracao.pedidos.application.command.CriarPedidoCommand;
import exemplo.refatoracao.pedidos.domain.model.Pedido;
import exemplo.refatoracao.pedidos.domain.port.EventPublisherPort;
import exemplo.refatoracao.pedidos.domain.port.PedidoRepositoryPort;
import exemplo.refatoracao.pedidos.infrastructure.event.PedidoCriadoEvent;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.UUID;

public class CriarPedidoService implements CriarPedidoUseCase {

    private final PedidoRepositoryPort pedidoRepository;
    private final EventPublisherPort eventPublisher;
    private final Clock clock;

    public CriarPedidoService(
        PedidoRepositoryPort pedidoRepository,
        EventPublisherPort eventPublisher,
        Clock clock
    ) {
        this.pedidoRepository = pedidoRepository;
        this.eventPublisher = eventPublisher;
        this.clock = clock;
    }

    @Override
    public Pedido executar(CriarPedidoCommand command) {
        if (command.valor() == null || command.valor().signum() <= 0) {
            throw new IllegalArgumentException("Valor do pedido deve ser maior que zero");
        }

        var agora = OffsetDateTime.now(clock);
        var pedido = new Pedido(UUID.randomUUID(), command.clienteId(), command.valor(), agora);

        pedidoRepository.salvar(pedido);
        eventPublisher.publicar(new PedidoCriadoEvent(pedido.id(), pedido.clienteId(), pedido.criadoEm()));

        return pedido;
    }
}
