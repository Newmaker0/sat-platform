import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardMockDataService } from '../../data-access/dashboard-mock-data.service';
import { ApplicationStatus, ConsumptionActivity } from '../../models/consumption-activity.model';
import { StockItem } from '../../models/stock-item.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  readonly summary = this.dashboardData.getInventorySummary();
  readonly stockItems = this.dashboardData.getStockItems();
  readonly lowStockItems = this.dashboardData.getLowStockItems();
  readonly recentActivities = this.dashboardData.getRecentActivities(4);
  readonly openExceptions = this.dashboardData.getOpenExceptions();

  constructor(private readonly dashboardData: DashboardMockDataService) {}

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
    return this.dashboardData.getApplicationStatusLabel(status);
  }

  getApplicationStatusClasses(status: ApplicationStatus): string {
    if (status === 'APLICADO') {
      return 'bg-emerald-100 text-emerald-700';
    }

    return 'bg-rose-100 text-rose-700';
  }

  getReasonLabel(reason?: ConsumptionActivity['motivoNaoAplicacao']): string {
    return this.dashboardData.getReasonLabel(reason);
  }

  getEventTypeLabel(type: ConsumptionActivity['tipoEvento']): string {
    return this.dashboardData.getEventTypeLabel(type);
  }
}
