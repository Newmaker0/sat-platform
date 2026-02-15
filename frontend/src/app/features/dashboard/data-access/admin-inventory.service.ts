import { Injectable } from '@angular/core';
import { map, Observable, forkJoin } from 'rxjs';
import { ApiHttpService } from '../../../core/http/api-http.service';
import {
  ApplicationStatus,
  ConsumptionActivity,
  EventSource,
  EventType,
  NonAppliedReason
} from '../models/consumption-activity.model';
import { StockItem } from '../models/stock-item.model';

interface AdminOverviewApiResponse {
  readonly items: readonly AdminOverviewItemApiResponse[];
  readonly metrics: AdminOverviewMetricsApiResponse;
}

interface AdminOverviewItemApiResponse {
  readonly id: number;
  readonly sku: string;
  readonly name: string;
  readonly quantityAvailable: number;
  readonly minThreshold: number;
  readonly lowStock: boolean;
}

interface AdminOverviewMetricsApiResponse {
  readonly totalItems: number;
  readonly lowStockItems: number;
  readonly rejectedEventsLast24h: number;
  readonly availableUnits: number;
}

interface StockEventApiResponse {
  readonly id: number;
  readonly externalEventId: string | null;
  readonly itemId: number;
  readonly itemName: string;
  readonly type: 'CONSUMPTION' | 'ADJUSTMENT';
  readonly status: 'APPLIED' | 'REJECTED';
  readonly requestedQuantity: number;
  readonly appliedDelta: number;
  readonly reason: string | null;
  readonly source: 'TECHNICIAN_SYNC' | 'ADMIN_ADJUSTMENT';
  readonly actor: string;
  readonly adjustsEventId: number | null;
  readonly occurredAt: string;
  readonly processedAt: string;
}

type ApplyAdjustmentApiResponse = StockEventApiResponse;

export interface ApplyAdjustmentPayload {
  readonly itemId: number;
  readonly delta: number;
  readonly reason: string;
  readonly adjustsEventId?: number;
}

export interface InventorySummary {
  readonly itensMonitorados: number;
  readonly itensCriticos: number;
  readonly excecoesOperacionais: number;
  readonly ajustesUltimas24h: number;
}

export interface DashboardSnapshot {
  readonly summary: InventorySummary;
  readonly stockItems: readonly StockItem[];
  readonly lowStockItems: readonly StockItem[];
  readonly activities: readonly ConsumptionActivity[];
  readonly recentActivities: readonly ConsumptionActivity[];
  readonly openExceptions: readonly ConsumptionActivity[];
}

@Injectable({ providedIn: 'root' })
export class AdminInventoryService {
  constructor(private readonly apiHttpService: ApiHttpService) {}

  getDashboardSnapshot(): Observable<DashboardSnapshot> {
    return forkJoin({
      overview: this.getOverviewResponse(),
      events: this.getEventsResponse()
    }).pipe(
      map(({ overview, events }) => {
        const stockItems = overview.items.map((item) => this.toStockItem(item));
        const lowStockItems = stockItems.filter(
          (item) => item.quantidadeAtual <= item.limiteMinimo
        );
        const activityPairs = events.map((event) => this.toActivityWithDate(event));
        const activities = activityPairs.map((pair) => pair.activity);
        const openExceptions = activities.filter(
          (activity) => activity.statusAplicacao === 'NAO_APLICADO'
        );
        const recentActivities = activities.slice(0, 4);
        const adjustmentsLast24h = activityPairs.filter(
          (pair) =>
            pair.activity.tipoEvento === 'AJUSTE' &&
            Date.now() - pair.occurredAt.getTime() <= 24 * 60 * 60 * 1000
        ).length;

        return {
          summary: {
            itensMonitorados: overview.metrics.totalItems,
            itensCriticos: overview.metrics.lowStockItems,
            excecoesOperacionais: openExceptions.length,
            ajustesUltimas24h: adjustmentsLast24h
          },
          stockItems,
          lowStockItems,
          activities,
          recentActivities,
          openExceptions
        };
      })
    );
  }

  getActivities(): Observable<readonly ConsumptionActivity[]> {
    return this.getEventsResponse().pipe(
      map((events) => events.map((event) => this.toActivityWithDate(event).activity))
    );
  }

  applyAdjustment(payload: ApplyAdjustmentPayload): Observable<ConsumptionActivity> {
    return this.apiHttpService
      .post<ApplyAdjustmentApiResponse, ApplyAdjustmentPayload>('/admin/adjustments', payload)
      .pipe(map((event) => this.toActivityWithDate(event).activity));
  }

  private getOverviewResponse(): Observable<AdminOverviewApiResponse> {
    return this.apiHttpService.get<AdminOverviewApiResponse>('/admin/overview');
  }

  private getEventsResponse(): Observable<readonly StockEventApiResponse[]> {
    return this.apiHttpService.get<readonly StockEventApiResponse[]>('/admin/events');
  }

  private toStockItem(item: AdminOverviewItemApiResponse): StockItem {
    return {
      id: item.id.toString(),
      nome: item.name,
      categoria: this.toCategory(item.sku),
      localizacao: this.toLocation(item.sku),
      quantidadeAtual: item.quantityAvailable,
      limiteMinimo: item.minThreshold,
      unidade: 'un',
      ultimaAtualizacao: 'Atualizado recentemente'
    };
  }

  private toActivityWithDate(event: StockEventApiResponse): {
    readonly activity: ConsumptionActivity;
    readonly occurredAt: Date;
  } {
    const occurredAt = this.toDate(event.occurredAt);
    const activity: ConsumptionActivity = {
      eventId: event.externalEventId ?? `evt-${event.id}`,
      tipoEvento: this.toEventType(event.type),
      astronauta: event.actor,
      itemNome: event.itemName,
      quantidade: event.requestedQuantity,
      unidade: 'un',
      origem: this.toSource(event.source),
      registradoEm: this.toDateLabel(occurredAt),
      statusAplicacao: this.toApplicationStatus(event.status),
      motivoNaoAplicacao: this.toReason(event.reason),
      referenciaEventoId: event.adjustsEventId ? event.adjustsEventId.toString() : undefined,
      observacao: event.reason ?? undefined
    };

    return { activity, occurredAt };
  }

  private toEventType(type: StockEventApiResponse['type']): EventType {
    return type === 'ADJUSTMENT' ? 'AJUSTE' : 'CONSUMO';
  }

  private toApplicationStatus(status: StockEventApiResponse['status']): ApplicationStatus {
    return status === 'APPLIED' ? 'APLICADO' : 'NAO_APLICADO';
  }

  private toReason(reason: string | null): NonAppliedReason | undefined {
    if (!reason) {
      return undefined;
    }

    if (reason === 'INSUFFICIENT_STOCK') {
      return 'ESTOQUE_INSUFICIENTE';
    }

    if (reason === 'ITEM_NOT_FOUND') {
      return 'ITEM_INVALIDO';
    }

    if (reason === 'DUPLICATE_EVENT') {
      return 'DUPLICADO';
    }

    return undefined;
  }

  private toSource(source: StockEventApiResponse['source']): EventSource {
    return source === 'ADMIN_ADJUSTMENT' ? 'Admin' : 'Offline';
  }

  private toDate(value: string): Date {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }

  private toDateLabel(date: Date): string {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfEventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (startOfEventDay.getTime() === startOfToday.getTime()) {
      return `Hoje, ${time}`;
    }

    if (startOfEventDay.getTime() === startOfYesterday.getTime()) {
      return `Ontem, ${time}`;
    }

    const dayAndMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${dayAndMonth}, ${time}`;
  }

  private toCategory(sku: string): string {
    if (sku.startsWith('VALV') || sku.startsWith('FILT')) {
      return 'Suporte de vida';
    }

    if (sku.startsWith('PLC') || sku.startsWith('BAT')) {
      return 'Eletrônica';
    }

    if (sku.startsWith('SENS')) {
      return 'Telemetria';
    }

    return 'Manutenção';
  }

  private toLocation(sku: string): string {
    if (sku.startsWith('VALV')) {
      return 'Módulo Habitat';
    }

    if (sku.startsWith('PLC')) {
      return 'Laboratório';
    }

    if (sku.startsWith('SENS')) {
      return 'Módulo Técnico';
    }

    if (sku.startsWith('FILT')) {
      return 'Módulo Suporte';
    }

    return 'Armazém Central';
  }
}
