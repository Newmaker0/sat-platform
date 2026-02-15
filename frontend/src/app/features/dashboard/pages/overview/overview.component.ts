import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { AdminInventoryService, InventorySummary } from '../../data-access/admin-inventory.service';
import { DashboardLabelsService } from '../../data-access/dashboard-labels.service';
import { ApplicationStatus, ConsumptionActivity } from '../../models/consumption-activity.model';
import { StockItem } from '../../models/stock-item.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {
  summary: InventorySummary = {
    itensMonitorados: 0,
    itensCriticos: 0,
    excecoesOperacionais: 0,
    ajustesUltimas24h: 0
  };
  stockItems: readonly StockItem[] = [];
  lowStockItems: readonly StockItem[] = [];
  recentActivities: readonly ConsumptionActivity[] = [];
  openExceptions: readonly ConsumptionActivity[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly adminInventoryService: AdminInventoryService,
    private readonly dashboardLabelsService: DashboardLabelsService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSnapshot();
  }

  trackByStockItemId(_: number, item: StockItem): string {
    return item.id;
  }

  trackByActivityEventId(_: number, activity: ConsumptionActivity): string {
    return activity.eventId;
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

  private loadSnapshot(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminInventoryService
      .getDashboardSnapshot()
      .pipe(take(1))
      .subscribe({
        next: (snapshot) => {
          this.summary = snapshot.summary;
          this.stockItems = snapshot.stockItems;
          this.lowStockItems = snapshot.lowStockItems;
          this.recentActivities = snapshot.recentActivities;
          this.openExceptions = snapshot.openExceptions;
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.stockItems = [];
          this.lowStockItems = [];
          this.recentActivities = [];
          this.openExceptions = [];
          this.isLoading = false;
          this.errorMessage = 'Não foi possível carregar o estoque no backend.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }
}
