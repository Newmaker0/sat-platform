import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
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
import { ActionMenuItem } from '../../../../shared/ui/action-menu/action-menu.component';
import { UiPillTone } from '../../../../shared/ui/status-pill/status-pill.component';

type ActivityFilter = 'TODOS' | 'APLICADOS' | 'EXCECOES' | 'AJUSTES';
type ReportsState = AsyncStateWithEmpty<readonly ConsumptionActivity[]>;

interface FilterOption {
  readonly value: ActivityFilter;
  readonly label: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
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
  readonly pageSizeOptions: readonly number[] = [5, 8, 10, 12, 15, 20];
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
  desktopSkeletonRows: readonly number[] = [];
  private autoPageSizeEnabled = true;

  constructor(
    private readonly adminInventoryService: AdminInventoryService,
    private readonly dashboardLabelsService: DashboardLabelsService
  ) {}

  ngOnInit(): void {
    this.configureDesktopPageSize();
    this.syncDesktopSkeletonRows();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.autoPageSizeEnabled) {
      return;
    }

    this.configureDesktopPageSize();
  }

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
    const previousPageSize = this.pageSize;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.syncDesktopSkeletonRows();

    if (event.pageSize !== previousPageSize) {
      this.autoPageSizeEnabled = false;
    }
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

  onMenuAction(event: ConsumptionActivity, action: string): void {
    if (action === 'PRIMARY') {
      this.onAction(event);
      return;
    }

    if (action === 'HISTORY') {
      this.actionFeedback = `Fluxo mock: exibindo histórico do item ${event.itemNome}.`;
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(event.eventId);
      this.actionFeedback = `ID ${event.eventId} copiado para a área de transferência.`;
      return;
    }

    this.actionFeedback = `Não foi possível copiar automaticamente. ID do evento: ${event.eventId}.`;
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

  getApplicationStatusTone(status: ApplicationStatus): UiPillTone {
    return status === 'APLICADO' ? 'success' : 'danger';
  }

  getEventTypeTone(type: EventType): UiPillTone {
    return type === 'AJUSTE' ? 'info' : 'neutral';
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

  getRowActionOptions(event: ConsumptionActivity): readonly ActionMenuItem[] {
    return [
      { id: 'PRIMARY', label: this.getActionLabel(event), icon: 'sparkles' },
      { id: 'HISTORY', label: 'Ver histórico do item', icon: 'history' },
      { id: 'COPY_EVENT_ID', label: 'Copiar ID do evento', icon: 'copy' }
    ];
  }

  private configureDesktopPageSize(): void {
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      this.pageSize = 5;
      this.pageIndex = 0;
      this.syncDesktopSkeletonRows();
      return;
    }

    const viewportHeight = window.innerHeight;
    const reservedHeight = 420;
    const rowHeight = 45;
    const desiredRows = Math.max(5, Math.floor((viewportHeight - reservedHeight) / rowHeight));
    const bestFit = [...this.pageSizeOptions].filter((option) => option <= desiredRows).pop() ?? 5;

    this.pageSize = bestFit;
    this.pageIndex = 0;
    this.syncDesktopSkeletonRows();
  }

  private syncDesktopSkeletonRows(): void {
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      const mobileCount = 4;
      this.desktopSkeletonRows = Array.from({ length: mobileCount }, (_, index) => index);
      return;
    }

    const viewportHeight = window.innerHeight;
    const reservedHeight = 360;
    const rowHeight = 45;
    const availableRows = Math.ceil(Math.max(0, viewportHeight - reservedHeight) / rowHeight);
    const count = Math.max(this.pageSize, availableRows);
    this.desktopSkeletonRows = Array.from({ length: count }, (_, index) => index);
  }
}
