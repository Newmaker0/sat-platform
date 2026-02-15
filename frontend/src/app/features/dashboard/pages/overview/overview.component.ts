import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { AdminInventoryService, InventorySummary } from '../../data-access/admin-inventory.service';
import { DashboardLabelsService } from '../../data-access/dashboard-labels.service';
import { ApplicationStatus, ConsumptionActivity } from '../../models/consumption-activity.model';
import { StockItem } from '../../models/stock-item.model';
import {
  AsyncStateWithEmpty,
  toAsyncState,
  withEmptyState
} from '../../../../shared/async/async-state';

type OverviewState = AsyncStateWithEmpty<OverviewData>;

interface OverviewData {
  readonly summary: InventorySummary;
  readonly stockItems: readonly StockItem[];
  readonly lowStockItems: readonly StockItem[];
  readonly recentActivities: readonly ConsumptionActivity[];
  readonly openExceptions: readonly ConsumptionActivity[];
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  readonly metricSkeletons = [1, 2, 3, 4];
  readonly listSkeletons = [1, 2, 3, 4, 5, 6];

  private readonly emptySummary: InventorySummary = {
    itensMonitorados: 0,
    itensCriticos: 0,
    excecoesOperacionais: 0,
    ajustesUltimas24h: 0
  };
  private readonly reload$ = new Subject<void>();

  readonly state$: Observable<OverviewState> = this.reload$.pipe(
    startWith(void 0),
    switchMap(() =>
      this.adminInventoryService.getDashboardSnapshot().pipe(
        toAsyncState<OverviewData>(),
        withEmptyState((snapshot) => snapshot.stockItems.length === 0)
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly adminInventoryService: AdminInventoryService,
    private readonly dashboardLabelsService: DashboardLabelsService
  ) {}

  trackByStockItemId(_: number, item: StockItem): string {
    return item.id;
  }

  trackByActivityEventId(_: number, activity: ConsumptionActivity): string {
    return activity.eventId;
  }

  retryLoad(): void {
    this.reload$.next();
  }

  getSummary(state: OverviewState): InventorySummary {
    return state.status === 'success' ? state.data.summary : this.emptySummary;
  }

  getStockItems(state: OverviewState): readonly StockItem[] {
    return state.status === 'success' ? state.data.stockItems : [];
  }

  getRecentActivities(state: OverviewState): readonly ConsumptionActivity[] {
    return state.status === 'success' ? state.data.recentActivities : [];
  }

  getOpenExceptions(state: OverviewState): readonly ConsumptionActivity[] {
    return state.status === 'success' ? state.data.openExceptions : [];
  }

  getStockBadgeClasses(item: StockItem): string {
    return item.quantidadeAtual <= item.limiteMinimo
      ? 'bg-rose-100 text-rose-700'
      : 'bg-emerald-100 text-emerald-700';
  }

  getApplicationStatusLabel(status: ApplicationStatus): string {
    return this.dashboardLabelsService.getApplicationStatusLabel(status);
  }

  getApplicationStatusClasses(status: ApplicationStatus): string {
    if (status === 'APLICADO') {
      return 'bg-emerald-100 text-emerald-700';
    }

    return 'bg-rose-100 text-rose-700';
  }

  getReasonLabel(reason?: ConsumptionActivity['motivoNaoAplicacao']): string {
    return this.dashboardLabelsService.getReasonLabel(reason);
  }

  getEventTypeLabel(type: ConsumptionActivity['tipoEvento']): string {
    return this.dashboardLabelsService.getEventTypeLabel(type);
  }
}
