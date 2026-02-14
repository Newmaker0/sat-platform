import { Injectable } from '@angular/core';
import {
  ApplicationStatus,
  ConsumptionActivity,
  EventType,
  NonAppliedReason
} from '../models/consumption-activity.model';
import { StockItem } from '../models/stock-item.model';

interface InventorySummary {
  readonly itensMonitorados: number;
  readonly itensCriticos: number;
  readonly excecoesOperacionais: number;
  readonly ajustesUltimas24h: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardMockDataService {
  private readonly stockItems: readonly StockItem[] = [
    {
      id: 'ox-valve-a1',
      nome: 'Válvula de oxigênio A1',
      categoria: 'Suporte de vida',
      localizacao: 'Módulo Habitat',
      quantidadeAtual: 2,
      limiteMinimo: 5,
      unidade: 'un',
      ultimaAtualizacao: 'Hoje, 09:15'
    },
    {
      id: 'co2-filter-b2',
      nome: 'Filtro CO2 B2',
      categoria: 'Suporte de vida',
      localizacao: 'Módulo Técnico',
      quantidadeAtual: 12,
      limiteMinimo: 8,
      unidade: 'un',
      ultimaAtualizacao: 'Hoje, 08:50'
    },
    {
      id: 'sensor-thermal-c7',
      nome: 'Sensor térmico C7',
      categoria: 'Telemetria',
      localizacao: 'Módulo Científico',
      quantidadeAtual: 2,
      limiteMinimo: 4,
      unidade: 'un',
      ultimaAtualizacao: 'Hoje, 07:42'
    },
    {
      id: 'circuit-board-d4',
      nome: 'Placa de circuito D4',
      categoria: 'Eletrônica',
      localizacao: 'Laboratório',
      quantidadeAtual: 3,
      limiteMinimo: 4,
      unidade: 'un',
      ultimaAtualizacao: 'Hoje, 09:10'
    },
    {
      id: 'water-seal-e3',
      nome: 'Vedação hidráulica E3',
      categoria: 'Manutenção',
      localizacao: 'Armazém Central',
      quantidadeAtual: 1,
      limiteMinimo: 3,
      unidade: 'un',
      ultimaAtualizacao: 'Hoje, 06:18'
    },
    {
      id: 'sensor-press-f9',
      nome: 'Sensor de pressão F9',
      categoria: 'Telemetria',
      localizacao: 'Módulo Técnico',
      quantidadeAtual: 9,
      limiteMinimo: 5,
      unidade: 'un',
      ultimaAtualizacao: 'Ontem, 18:40'
    }
  ];

  private readonly activities: readonly ConsumptionActivity[] = [
    {
      eventId: 'adj-81f2be64',
      tipoEvento: 'AJUSTE',
      astronauta: 'Controle da Missão',
      itemNome: 'Válvula de oxigênio A1',
      quantidade: 3,
      unidade: 'un',
      origem: 'Admin',
      registradoEm: 'Hoje, 09:28',
      statusAplicacao: 'APLICADO',
      referenciaEventoId: 'evt-9c1be24e',
      observacao: 'Reversão para corrigir peça informada incorretamente.'
    },
    {
      eventId: 'evt-a54f90c1',
      tipoEvento: 'CONSUMO',
      astronauta: 'Aline Costa',
      itemNome: 'Placa de circuito D4',
      quantidade: 3,
      unidade: 'un',
      origem: 'Online',
      registradoEm: 'Hoje, 09:25',
      statusAplicacao: 'APLICADO',
      referenciaEventoId: 'evt-9c1be24e',
      observacao: 'Consumo corrigido após ajuste de inventário.'
    },
    {
      eventId: 'evt-5ab2dd10',
      tipoEvento: 'CONSUMO',
      astronauta: 'Rafael Lima',
      itemNome: 'Válvula de oxigênio A1',
      quantidade: 3,
      unidade: 'un',
      origem: 'Offline',
      registradoEm: 'Hoje, 09:21',
      statusAplicacao: 'NAO_APLICADO',
      motivoNaoAplicacao: 'ESTOQUE_INSUFICIENTE',
      observacao: 'Saldo disponível de 2 unidades no momento da sincronização.'
    },
    {
      eventId: 'evt-9c1be24e',
      tipoEvento: 'CONSUMO',
      astronauta: 'Aline Costa',
      itemNome: 'Válvula de oxigênio A1',
      quantidade: 3,
      unidade: 'un',
      origem: 'Offline',
      registradoEm: 'Hoje, 09:05',
      statusAplicacao: 'APLICADO'
    },
    {
      eventId: 'evt-6da0a8e2',
      tipoEvento: 'CONSUMO',
      astronauta: 'Bruno Neri',
      itemNome: 'Vedação hidráulica E3',
      quantidade: 2,
      unidade: 'un',
      origem: 'Offline',
      registradoEm: 'Hoje, 08:44',
      statusAplicacao: 'NAO_APLICADO',
      motivoNaoAplicacao: 'ESTOQUE_INSUFICIENTE',
      observacao: 'Consumo registrado com saldo insuficiente para aplicação.'
    },
    {
      eventId: 'adj-df8c4a77',
      tipoEvento: 'AJUSTE',
      astronauta: 'Controle da Missão',
      itemNome: 'Vedação hidráulica E3',
      quantidade: 2,
      unidade: 'un',
      origem: 'Admin',
      registradoEm: 'Hoje, 08:52',
      statusAplicacao: 'APLICADO',
      referenciaEventoId: 'evt-6da0a8e2',
      observacao: 'Ajuste após reposição manual no módulo de manutenção.'
    },
    {
      eventId: 'evt-12ad7f4b',
      tipoEvento: 'CONSUMO',
      astronauta: 'Rafael Lima',
      itemNome: 'Sensor térmico C7',
      quantidade: 2,
      unidade: 'un',
      origem: 'Offline',
      registradoEm: 'Hoje, 08:40',
      statusAplicacao: 'APLICADO'
    },
    {
      eventId: 'evt-7fa10bc5',
      tipoEvento: 'CONSUMO',
      astronauta: 'Aline Costa',
      itemNome: 'Item legado ZX-19',
      quantidade: 1,
      unidade: 'un',
      origem: 'Offline',
      registradoEm: 'Ontem, 23:10',
      statusAplicacao: 'NAO_APLICADO',
      motivoNaoAplicacao: 'ITEM_INVALIDO',
      observacao: 'Código não encontrado no catálogo atual da estação.'
    },
    {
      eventId: 'evt-4eaf7612',
      tipoEvento: 'CONSUMO',
      astronauta: 'Bruno Neri',
      itemNome: 'Filtro CO2 B2',
      quantidade: 1,
      unidade: 'un',
      origem: 'Offline',
      registradoEm: 'Ontem, 22:54',
      statusAplicacao: 'NAO_APLICADO',
      motivoNaoAplicacao: 'DUPLICADO',
      observacao: 'Evento já processado com o mesmo eventId.'
    }
  ];

  getStockItems(): readonly StockItem[] {
    return this.stockItems;
  }

  getLowStockItems(): readonly StockItem[] {
    return this.stockItems.filter((item) => item.quantidadeAtual <= item.limiteMinimo);
  }

  getActivities(): readonly ConsumptionActivity[] {
    return this.activities;
  }

  getRecentActivities(limit = 4): readonly ConsumptionActivity[] {
    return this.activities.slice(0, limit);
  }

  getOpenExceptions(): readonly ConsumptionActivity[] {
    return this.activities.filter((activity) => activity.statusAplicacao === 'NAO_APLICADO');
  }

  getInventorySummary(): InventorySummary {
    return {
      itensMonitorados: this.stockItems.length,
      itensCriticos: this.getLowStockItems().length,
      excecoesOperacionais: this.getOpenExceptions().length,
      ajustesUltimas24h: this.activities.filter((activity) => activity.tipoEvento === 'AJUSTE')
        .length
    };
  }

  getApplicationStatusLabel(status: ApplicationStatus): string {
    if (status === 'APLICADO') {
      return 'Aplicado';
    }

    return 'Não aplicado';
  }

  getReasonLabel(reason?: NonAppliedReason): string {
    if (reason === 'ESTOQUE_INSUFICIENTE') {
      return 'Estoque insuficiente';
    }

    if (reason === 'ITEM_INVALIDO') {
      return 'Item inválido';
    }

    if (reason === 'DUPLICADO') {
      return 'Evento duplicado';
    }

    return 'Sem motivo informado';
  }

  getEventTypeLabel(type: EventType): string {
    if (type === 'AJUSTE') {
      return 'Ajuste';
    }

    return 'Consumo';
  }
}
