package exemplo.refatoracao.pedidos.api;

import exemplo.refatoracao.pedidos.application.command.CriarPedidoCommand;
import exemplo.refatoracao.pedidos.application.usecase.CriarPedidoUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pedidos")
public class PedidoControllerRefatorado {

    private final CriarPedidoUseCase criarPedidoUseCase;

    public PedidoControllerRefatorado(CriarPedidoUseCase criarPedidoUseCase) {
        this.criarPedidoUseCase = criarPedidoUseCase;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CriarPedidoResponse criarPedido(@Valid @RequestBody CriarPedidoRequest request) {
        var command = new CriarPedidoCommand(request.clienteId(), request.valor());
        var pedido = criarPedidoUseCase.executar(command);

        return new CriarPedidoResponse(pedido.id(), "Pedido criado com sucesso", pedido.criadoEm());
    }

    public record CriarPedidoRequest(@NotBlank String clienteId, @Positive BigDecimal valor) {}

    public record CriarPedidoResponse(UUID pedidoId, String mensagem, OffsetDateTime criadoEm) {}
}
