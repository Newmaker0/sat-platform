# Mapa de MVP - Teste Tecnico SAT

Este documento fecha o escopo minimo para entrega do teste tecnico usando o cenario definido em `Cenario_do_projeto.md`.

## 1. Objetivo do MVP

Entregar um fluxo fim a fim funcional com:

- Web admin (Angular 15) com pelo menos 2 telas reais
- Backend Spring Boot com regras basicas de estoque e consumo
- Mobile Kotlin offline-first com sincronizacao automatica
- Refatoracao da atividade 2 (codigo arquiteturalmente problematico)

## 2. Escopo fechado (entra no MVP)

### 2.1 Web (atividade 1)

- Login (UI pronta; manter)
- Dashboard de estoque com dados reais da API
- Tela de usuarios/atividades com historico de consumo
- Estado de carregamento, vazio e erro nas duas telas

### 2.2 Backend (atividade 1)

- Entidades: `User`, `StockItem`, `ConsumptionEvent`
- Autenticacao por JWT (`/api/auth/login`)
- Rotas admin:
  - `GET /api/admin/stock-items`
  - `GET /api/admin/consumptions`
- Rota tecnico:
  - `POST /api/consumptions/batch`
- Regras:
  - idempotencia por `eventId`
  - baixa de estoque quando valido
  - rejeicao quando sem saldo
- Pelo menos 1 teste JUnit cobrindo regra de negocio critica

### 2.3 Mobile (atividade 3)

- Stack obrigatoria:
  - Kotlin
  - Jetpack Compose
  - Room (com 2 migracoes)
  - Koin
  - WorkManager
  - MVVM + Repository Pattern
- Fluxo tecnico:
  - login simples
  - lista de pecas
  - registrar consumo offline
  - sincronizacao automatica em background

### 2.4 Refatoracao (atividade 2)

- Refatorar o controller de pedidos em modulo/pasta dedicada
- Separar responsabilidades em camadas (controller, service, gateway/notificacao)
- Remover acoplamento estatico e criar interface de notificacao
- Validacao com Bean Validation
- Cobrir a regra principal com teste unitario

## 3. Fora de escopo (nao entra no MVP)

- Refresh token e fluxo completo de sessao
- Controle granular de permissoes por tela
- CRUD completo de usuarios
- Observabilidade avancada (tracing, metricas detalhadas)
- CI/CD e deploy em nuvem
- UX refinada alem do baseline atual

## 4. Estado atual (13/02/2026)

- Frontend:
  - esqueleto de login/dashboard pronto
  - arquitetura por features e lazy loading pronta
  - componentes/tipografia/paginador em bom estado
  - ainda com dados mock
- Backend:
  - projeto Spring criado, sem dominio/rotas implementadas
- Mobile:
  - projeto Android base criado
  - ainda sem Room/Koin/WorkManager/MVVM de dominio

## 5. Ordem de implementacao recomendada

## Fase 1 - Backend base (primeiro)

1. Modelar entidades e repositorios
2. Criar seed inicial (1 admin, 1 tecnico, alguns itens)
3. Implementar `POST /api/auth/login`
4. Implementar `POST /api/consumptions/batch` com idempotencia
5. Implementar `GET /api/admin/stock-items` e `GET /api/admin/consumptions`
6. Adicionar teste JUnit da regra de consumo

## Fase 2 - Frontend integrado

1. Substituir mocks por chamadas HTTP
2. Conectar login e guardar token
3. Exibir dashboard de estoque real
4. Exibir historico de atividades real com filtros basicos
5. Tratar loading/erro/vazio

## Fase 3 - Mobile offline-first

1. Definir schema Room inicial e DAOs
2. Registrar 2 migracoes obrigatorias
3. Implementar repositorios (local + remoto)
4. Configurar Koin
5. Criar Worker de sync com constraint de rede
6. Fluxo offline -> online com atualizacao de status

## Fase 4 - Atividade 2 (refatoracao)

1. Criar pacote/modulo dedicado para exemplo `pedidos`
2. Aplicar refatoracao arquitetural
3. Adicionar teste unitario e documentar "antes/depois"

## 6. Criterios de pronto (Definition of Done)

Um incremento so e considerado pronto se:

- Build do frontend passa: `cd frontend && npm run build`
- Lint do frontend passa: `cd frontend && npm run lint`
- Testes backend passam: `cd backend && ./mvnw test`
- Mobile compila sem erro no Android Studio
- Fluxo principal da fase e demonstravel manualmente
- README atualizado quando houver novo comando/decisao estrutural

## 7. Riscos principais e mitigacao

- Risco: divergir contrato API x frontend x mobile
  - Mitigacao: definir DTOs e exemplos JSON antes da integracao
- Risco: sync offline inconsistente
  - Mitigacao: garantir idempotencia por `eventId` no backend e no repositorio local
- Risco: escopo crescer demais
  - Mitigacao: usar este documento como "scope lock"

## 8. Checklist final de entrega do teste

- [ ] Atividade 1: backend + frontend com 2 telas reais
- [ ] Atividade 1: ao menos 1 teste JUnit
- [ ] Atividade 2: refatoracao arquitetural documentada
- [ ] Atividade 3: app Kotlin com Compose, Room (2 migracoes), Koin, WorkManager, MVVM + Repository
- [ ] Demo ponta a ponta: consumo offline e sincronizacao automatica
