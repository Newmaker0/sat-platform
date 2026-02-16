@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @PostMapping
    public ResponseEntity<String> criarPedido(@RequestBody PedidoDTO dto) {
        if (dto.getValor() <= 0) {
            return ResponseEntity.badRequest().body("Valor inválido");
        }

        Pedido pedido = new Pedido();
        pedido.setClienteId(dto.getClienteId());
        pedido.setValor(dto.getValor());
        pedido.setDataCriacao(LocalDateTime.now());

        pedidoRepository.save(pedido);

        // Envia notificação
        NotificacaoService.enviarEmail(dto.getClienteId(), "Pedido criado!");

        return ResponseEntity.ok("Pedido criado com sucesso");
    }
}
