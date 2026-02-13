# Sistema de Gestao de Estoque da Estacao Orbital de Pesquisa

## 1. Visao Geral do Cenario

Este projeto simula um **sistema de gestao de estoque para uma estacao orbital de pesquisa**.

A estacao abriga uma pequena tripulacao de astronautas que realiza manutencao e operacoes cientificas usando um estoque limitado de pecas substituiveis
(filtros, placas de circuito, valvulas de oxigenio, sensores etc.).

Devido a comunicacao intermitente e de alta latencia com a Terra,
os astronautas precisam ser capazes de:

- Trabalhar offline
- Registrar consumo de pecas localmente
- Sincronizar automaticamente os dados de consumo quando a conectividade estiver disponivel

O Controle da Missao (Terra) precisa de:

- Visibilidade em tempo real dos niveis de estoque
- Historico de auditoria do uso de pecas
- Alertas de estoque baixo
- Controle administrativo de estoque e usuarios

Este sistema consiste em:

- Um **aplicativo movel (Kotlin + Jetpack Compose)** para os astronautas
- Um **painel web administrativo (Angular)** para o Controle da Missao
- Um **backend Spring Boot (Java)** atuando como sistema autoritativo

------------------------------------------------------------------------

# 2. Arquitetura do Sistema

    App Movel (Astronauta)
            |
            |  API REST (Autenticacao JWT)
            |
    Backend Spring Boot (Estoque Autoritativo)
            |
            |  Banco de Dados (PostgreSQL ou H2 para demo)
            |
    Painel Admin Angular (Controle da Missao)

## Principios Arquiteturais

- O backend e a **fonte unica da verdade**
- O app movel e **offline-first**
- Atualizacoes de estoque sao **baseadas em eventos (eventos imutaveis de consumo)**
- A sincronizacao e **automatica (WorkManager)**
- Controle de acesso baseado em papeis (RBAC)
- Design de API idempotente

------------------------------------------------------------------------

# 3. Papeis de Usuario

## TECHNICIAN (Astronauta)

Capacidades: - Login - Visualizar estoque - Registrar consumo de pecas - Operar offline - Sincronizacao automatica em background

Restricoes: - Nao pode modificar estoque diretamente - Nao pode gerenciar usuarios

------------------------------------------------------------------------

## ADMIN (Controle da Missao)

Capacidades: - Login - Visualizar dashboard global de estoque - Visualizar historico de consumo - Adicionar estoque - Ajustar estoque - Gerenciar usuarios

------------------------------------------------------------------------

# 4. Modelo de Dominio Principal

## User

    User
    - id (Long)
    - username (unique)
    - passwordHash (BCrypt)
    - role (ADMIN | TECHNICIAN)
    - active (boolean)
    - createdAt

------------------------------------------------------------------------

## StockItem

    StockItem
    - id (Long)
    - name (String)
    - currentQuantity (Integer)
    - minThreshold (Integer)
    - version (Integer)  // opcional para optimistic locking

------------------------------------------------------------------------

## ConsumptionEvent

    ConsumptionEvent
    - id (UUID)
    - itemId (FK -> StockItem)
    - userId (FK -> User)
    - quantity (Integer)
    - createdAt (LocalDateTime)
    - processedAt (LocalDateTime)
    - status (PENDING | ACCEPTED | REJECTED)

Notas de design:

- Eventos sao imutaveis
- O backend deriva `userId` a partir do JWT, nunca do payload do cliente
- O `id` do evento garante idempotencia

------------------------------------------------------------------------

# 5. Autenticacao e Autorizacao

## Autenticacao

- Username + password
- Senha armazenada com BCrypt
- JWT emitido no login

Endpoint de login:

    POST /api/auth/login

Resposta:

```json
{
  "token": "<jwt>",
  "role": "TECHNICIAN"
}
```

O JWT contem:

```json
{
  "sub": "username",
  "userId": 1,
  "role": "TECHNICIAN",
  "iat": ...,
  "exp": ...
}
```

------------------------------------------------------------------------

## Autorizacao

Spring Security + seguranca em nivel de metodo:

- `/api/auth/**` → publico
- `/api/admin/**` → apenas ADMIN
- `/api/consumptions/**` → apenas TECHNICIAN

Nunca confiar em papeis enviados pelo cliente.

------------------------------------------------------------------------

# 6. Aplicativo Movel (Kotlin)

## Requisitos de Stack

- Kotlin
- Jetpack Compose
- Room
- Koin
- WorkManager
- MVVM + Repository Pattern

------------------------------------------------------------------------

## Estrategia Offline

- Eventos de consumo armazenados localmente no Room
- Cada evento possui `synced = false`
- WorkManager roda periodicamente com restricao de rede
- Quando houver internet:
    - Envia lote de eventos nao sincronizados
    - Recebe resultados aceitos/rejeitados
    - Atualiza status local

Sem botao manual de sincronizacao.

------------------------------------------------------------------------

## Migracoes Obrigatorias

### Migracao 1

Adicionar coluna `status` em `ConsumptionEvent`

### Migracao 2

Adicionar coluna `minThreshold` em `StockItem`

------------------------------------------------------------------------

# 7. Logica de Processamento no Backend

## Endpoint de Sincronizacao em Lote

    POST /api/consumptions/batch

Regras de processamento:

1. Extrair `userId` do JWT
2. Para cada evento:
    - Se o evento ja existir → ignorar (idempotente)
    - Validar estoque
    - Se houver quantidade suficiente → subtrair e ACCEPT
    - Senao → REJECT
3. Persistir resultados transacionalmente
4. Retornar status por evento

------------------------------------------------------------------------

# 8. Painel Admin Angular

Minimo de 2 telas:

## 1. Dashboard de Estoque

- Lista de itens de estoque
- Quantidade atual
- Destaque para itens abaixo de `minThreshold`

## 2. Visao de Usuarios / Atividades

- Lista de astronautas
- Visualizar historico de consumo por usuario
- Filtro por data

------------------------------------------------------------------------

# 9. Tratamento de Conflitos de Negocio

Conflitos sao tratados como **violacoes de regra de negocio**, nao como conflitos de merge de dados.

Exemplo:

Estoque restante: 1\
Astronauta A consome 1\
Astronauta B consome 1 (offline)

Ao sincronizar:

- Evento A → ACCEPTED
- Evento B → REJECTED
