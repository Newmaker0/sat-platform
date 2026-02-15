import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { AdminInventoryService } from '../../data-access/admin-inventory.service';
import { DashboardLabelsService } from '../../data-access/dashboard-labels.service';
import {
  ApplicationStatus,
  ConsumptionActivity,
  EventType,
  NonAppliedReason
} from '../../models/consumption-activity.model';
import {
  AsyncStateWithEmpty,
  toAsyncState,
  withEmptyState
} from '../../../../shared/async/async-state';

type ActivityFilter = 'TODOS' | 'APLICADOS' | 'EXCECOES' | 'AJUSTES';
type ReportsState = AsyncStateWithEmpty<readonly ConsumptionActivity[]>;

interface FilterOption {
  readonly value: ActivityFilter;
  readonly label: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  readonly displayedColumns: string[] = [
    'eventId',
    'tipoEvento',
    'astronauta',
    'itemNome',
    'quantidade',
    'statusAplicacao',
    'motivo',
    'acoes'
  ];
  readonly pageSizeOptions: readonly number[] = [5, 10, 20];
  readonly filterOptions: readonly FilterOption[] = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'EXCECOES', label: 'Exceções' },
    { value: 'APLICADOS', label: 'Aplicados' },
    { value: 'AJUSTES', label: 'Ajustes' }
  ];

  private readonly reload$ = new Subject<void>();

  readonly state$: Observable<ReportsState> = this.reload$.pipe(
    startWith(void 0),
    switchMap(() =>
      this.adminInventoryService.getActivities().pipe(
        toAsyncState<readonly ConsumptionActivity[]>(),
        withEmptyState((items) => items.length === 0)
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  pageSize = this.pageSizeOptions[0];
  pageIndex = 0;
  activeFilter: ActivityFilter = 'TODOS';
  actionFeedback: string | null = null;

  constructor(
    private readonly adminInventoryService: AdminInventoryService,
    private readonly dashboardLabelsService: DashboardLabelsService
  ) {}

  getActivities(state: ReportsState): readonly ConsumptionActivity[] {
    return state.status === 'success' ? state.data : [];
  }

  getFilteredActivities(
    activities: readonly ConsumptionActivity[]
  ): readonly ConsumptionActivity[] {
    if (this.activeFilter === 'APLICADOS') {
      return activities.filter((activity) => activity.statusAplicacao === 'APLICADO');
    }

    if (this.activeFilter === 'EXCECOES') {
      return activities.filter((activity) => activity.statusAplicacao === 'NAO_APLICADO');
    }

    if (this.activeFilter === 'AJUSTES') {
      return activities.filter((activity) => activity.tipoEvento === 'AJUSTE');
    }

    return activities;
  }

  getPagedActivities(activities: readonly ConsumptionActivity[]): readonly ConsumptionActivity[] {
    const filtered = this.getFilteredActivities(activities);
    const start = this.pageIndex * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  getTotalActivities(activities: readonly ConsumptionActivity[]): number {
    return this.getFilteredActivities(activities).length;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  onFilterChange(filter: ActivityFilter): void {
    this.activeFilter = filter;
    this.pageIndex = 0;
    this.actionFeedback = null;
  }

  onAction(event: ConsumptionActivity): void {
    if (event.tipoEvento === 'AJUSTE') {
      this.actionFeedback = `Fluxo mock: abrindo histórico do ajuste ${event.eventId}.`;
      return;
    }

    if (event.statusAplicacao === 'NAO_APLICADO') {
      this.actionFeedback = `Fluxo mock: abrir investigação de exceção para ${event.eventId}.`;
      return;
    }

    this.actionFeedback = `Fluxo mock: iniciar ajuste corretivo para ${event.eventId}.`;
  }

  clearActionFeedback(): void {
    this.actionFeedback = null;
  }

  retryLoad(): void {
    this.reload$.next();
  }

  trackByActivityId(_: number, row: ConsumptionActivity): string {
    return row.eventId;
  }

  getApplicationStatusLabel(status: ApplicationStatus): string {
    return this.dashboardLabelsService.getApplicationStatusLabel(status);
  }

  getEventTypeLabel(type: EventType): string {
    return this.dashboardLabelsService.getEventTypeLabel(type);
  }

  getReasonLabel(reason?: NonAppliedReason): string {
    return this.dashboardLabelsService.getReasonLabel(reason);
  }

  getApplicationStatusClasses(status: ApplicationStatus): string {
    if (status === 'APLICADO') {
      return 'bg-emerald-100 text-emerald-700';
    }

    return 'bg-rose-100 text-rose-700';
  }

  getEventTypeClasses(type: EventType): string {
    if (type === 'AJUSTE') {
      return 'bg-sky-100 text-sky-700';
    }

    return 'bg-slate-200 text-slate-700';
  }

  getActionLabel(event: ConsumptionActivity): string {
    if (event.tipoEvento === 'AJUSTE') {
      return 'Ver ajuste';
    }

    if (event.statusAplicacao === 'NAO_APLICADO') {
      return 'Investigar';
    }

    return 'Registrar ajuste';
  }
}
