import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { take } from 'rxjs/operators';
import { AdminInventoryService } from '../../data-access/admin-inventory.service';
import { DashboardLabelsService } from '../../data-access/dashboard-labels.service';
import {
  ApplicationStatus,
  ConsumptionActivity,
  EventType,
  NonAppliedReason
} from '../../models/consumption-activity.model';

type ActivityFilter = 'TODOS' | 'APLICADOS' | 'EXCECOES' | 'AJUSTES';

interface FilterOption {
  readonly value: ActivityFilter;
  readonly label: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
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
  readonly pageSizeOptions: readonly number[] = [5, 10, 20];
  readonly filterOptions: readonly FilterOption[] = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'EXCECOES', label: 'Exceções' },
    { value: 'APLICADOS', label: 'Aplicados' },
    { value: 'AJUSTES', label: 'Ajustes' }
  ];

  activities: readonly ConsumptionActivity[] = [];

  pageSize = this.pageSizeOptions[0];
  pageIndex = 0;
  activeFilter: ActivityFilter = 'TODOS';
  actionFeedback: string | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly adminInventoryService: AdminInventoryService,
    private readonly dashboardLabelsService: DashboardLabelsService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  get totalActivities(): number {
    return this.filteredActivities.length;
  }

  get filteredActivities(): readonly ConsumptionActivity[] {
    if (this.activeFilter === 'APLICADOS') {
      return this.activities.filter((activity) => activity.statusAplicacao === 'APLICADO');
    }

    if (this.activeFilter === 'EXCECOES') {
      return this.activities.filter((activity) => activity.statusAplicacao === 'NAO_APLICADO');
    }

    if (this.activeFilter === 'AJUSTES') {
      return this.activities.filter((activity) => activity.tipoEvento === 'AJUSTE');
    }

    return this.activities;
  }

  get pagedActivities(): readonly ConsumptionActivity[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredActivities.slice(start, start + this.pageSize);
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

  private loadActivities(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminInventoryService
      .getActivities()
      .pipe(take(1))
      .subscribe({
        next: (activities) => {
          this.activities = activities;
          this.pageIndex = 0;
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.activities = [];
          this.pageIndex = 0;
          this.isLoading = false;
          this.errorMessage = 'Não foi possível carregar atividades do backend.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }
}
