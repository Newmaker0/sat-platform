# Proposta de Correcao

## Principais problemas do codigo original

1. Controller com responsabilidades de validacao, regra de negocio, persistencia e notificacao.
2. Uso direto de `Repository` no controller (acoplamento com infraestrutura).
3. Side effect (email) acoplado ao fluxo sincrono HTTP.
4. Dependencia estatica (`NotificacaoService.enviarEmail`) dificil de testar.
5. Retorno textual (`ResponseEntity<String>`) sem contrato de API consistente.
6. Falta de padrao para erros e validacoes.

## Direcao da refatoracao

1. Controller fino: recebe request, valida formato e delega para um caso de uso.
2. Caso de uso (`CriarPedidoUseCase`): encapsula regra de negocio e coordenacao.
3. Portas de dominio (`PedidoRepositoryPort`, `NotificationPort`, `EventPublisherPort`).
4. Side effects desacoplados via evento de dominio (`PedidoCriadoEvent`) e processamento assincrono.
5. Inversao de dependencia para facilitar testes unitarios de regra.

## Sobre CQRS aqui

Nao e necessario adotar CQRS completo para resolver o problema, mas um recorte com
`command` + `use case` ja organiza melhor o fluxo de escrita e abre caminho para evolucao.

## Fluxo sugerido

1. `POST /pedidos` recebe DTO valido.
2. Controller mapeia DTO -> `CriarPedidoCommand`.
3. Use case cria entidade, salva e publica evento `PedidoCriadoEvent`.
4. Handler assincrono (infra) consome evento e dispara notificacao.

Assim, falha de notificacao nao quebra a persistencia do pedido e o sistema fica mais resiliente.

## Observacao importante

Este material ainda e um **esboco arquitetural** para demonstrar direcao de refatoracao.
Em uma solucao completa de producao, ainda seriam necessarios alguns complementos, como:

1. Padronizacao robusta de tratamento de erros (`@ControllerAdvice`, payload de erro e codigos de dominio).
2. Definicao transacional e estrategia de entrega confiavel para eventos (ex.: Outbox).
3. Implementacoes concretas das portas de dominio e configuracao de DI/wiring.
4. Testes unitarios e de integracao cobrindo regras, persistencia, eventos e falhas.
5. Observabilidade (logs estruturados, metricas e correlacao de requisicoes).
