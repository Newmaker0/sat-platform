# Teste técnico

1. ## **Desenvolvimento aplicação WEB**

   ## Desenvolver uma solução simples utilizando a stack da SAT, o escopo é aberto.

Entregas esperadas:

* Backend Spring JAVA  
  * Frontend angular 13/14/15  
  * Pelo menos duas telas  
  * Pelo menos um teste unitário usando JUNIT

2. ## **Refatorando um Código com Problemas Arquiteturais**

```java
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


```

3. ## **Desenvolvimento aplicativo móvel**

   ## Criar um aplicativo simplificado para técnicos de campo que precisam gerenciar um estoque de peças. O técnico trabalha em áreas sem sinal (offline) e precisa registrar o uso (consumo) de materiais. Quando houver internet, esses dados devem ser enviados para o servidor de maneira automática, sem a necessidade do usuário iniciar a sincronização.

Requisitos obrigatórios:

* Linguagem: Kotlin.  
  * UI: Jetpack Compose.  
  * Banco de Dados: Room.  
    1. Contendo ao menos 2 migrações cadastradas  
  * Injeção de Dependência: Koin.  
  * Background: WorkManager.  
  * Arquitetura: MVVM com Repository Pattern.
