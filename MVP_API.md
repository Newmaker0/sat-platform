# MVP API - Slice Inicial de Estoque e Eventos

Este documento define o contrato minimo para o primeiro slice funcional do backend.

## Objetivo do slice

- Processar consumo em lote com idempotencia
- Registrar conflitos de estoque (evento rejeitado com motivo)
- Permitir ajuste administrativo sem apagar historico
- Expor visao geral de estoque e historico de eventos

## Estados e tipos

- `EventType`: `CONSUMPTION`, `ADJUSTMENT`
- `EventStatus`: `APPLIED`, `REJECTED`
- `reason` para rejeicao (ex.: `INSUFFICIENT_STOCK`)

## Endpoints

### 1) Sincronizar consumos em lote (tecnico)

`POST /api/v1/technician/consumptions/batch`

Request:

```json
{
  "events": [
    {
      "externalEventId": "c8b5f2de-a1a2-44cd-b2f2-f8d7f7d0ac1f",
      "itemId": 1,
      "quantity": 2,
      "occurredAt": "2026-02-14T10:15:00"
    }
  ]
}
```

Response:

```json
{
  "results": [
    {
      "eventId": 101,
      "externalEventId": "c8b5f2de-a1a2-44cd-b2f2-f8d7f7d0ac1f",
      "status": "APPLIED",
      "appliedDelta": -2,
      "reason": null,
      "currentQuantity": 3,
      "idempotent": false
    }
  ]
}
```

Notas:
- `externalEventId` e a chave de idempotencia.
- Se o mesmo evento chegar de novo, retorna o mesmo resultado com `idempotent: true`.
- `actor` e derivado do usuario autenticado (HTTP Basic/JWT), nao do payload.

### 2) Aplicar ajuste (admin)

`POST /api/v1/admin/adjustments`

Request:

```json
{
  "itemId": 1,
  "delta": 2,
  "reason": "Correcao operacional",
  "adjustsEventId": 101
}
```

Response (201):

```json
{
  "id": 202,
  "externalEventId": null,
  "itemId": 1,
  "itemName": "Valvula de oxigenio",
  "type": "ADJUSTMENT",
  "status": "APPLIED",
  "requestedQuantity": 2,
  "appliedDelta": 2,
  "reason": "Correcao operacional",
  "source": "ADMIN_ADJUSTMENT",
  "actor": "admin-ops",
  "adjustsEventId": 101,
  "occurredAt": "2026-02-14T10:20:00",
  "processedAt": "2026-02-14T10:20:00"
}
```

Nota:
- Ajuste nao reescreve eventos antigos; cria um novo evento de `ADJUSTMENT`.

### 3) Visao geral (admin)

`GET /api/v1/admin/overview`

Response:

```json
{
  "items": [
    {
      "id": 1,
      "sku": "VALV-O2",
      "name": "Valvula de oxigenio",
      "quantityAvailable": 3,
      "minThreshold": 2,
      "lowStock": false
    }
  ],
  "metrics": {
    "totalItems": 4,
    "lowStockItems": 1,
    "rejectedEventsLast24h": 2,
    "availableUnits": 45
  }
}
```

### 4) Historico de eventos (admin)

`GET /api/v1/admin/events`

Response:

```json
[
  {
    "id": 202,
    "externalEventId": null,
    "itemId": 1,
    "itemName": "Valvula de oxigenio",
    "type": "ADJUSTMENT",
    "status": "APPLIED",
    "requestedQuantity": 2,
    "appliedDelta": 2,
    "reason": "Correcao operacional",
    "source": "ADMIN_ADJUSTMENT",
    "actor": "admin-ops",
    "adjustsEventId": 101,
    "occurredAt": "2026-02-14T10:20:00",
    "processedAt": "2026-02-14T10:20:00"
  }
]
```

## Erros de regra

- `ITEM_NOT_FOUND`
- `INSUFFICIENT_STOCK`
- `INVALID_QUANTITY`
- `ADJUSTMENT_DELTA_CANNOT_BE_ZERO`
- `ADJUSTMENT_WOULD_CREATE_NEGATIVE_STOCK`

## Seed inicial (H2)

Ao subir localmente, o backend cria itens base:
- `VALV-O2` (Valvula de oxigenio)
- `PLC-CIR` (Placa de circuito)
- `SENS-TEMP` (Sensor de temperatura)
- `FILT-AR` (Filtro de ar)
- `BAT-ION` (Bateria de ion-litio)

Usuarios de teste:
- `Pedro` / `Pedro` (ADMIN)
- `Felipe` / `Felipe` (TECHNICIAN)
- `Gustavo` / `Gustavo` (TECHNICIAN)

Eventos iniciais:
- consumos aplicados e rejeitados
- ajustes administrativos referenciando eventos anteriores
