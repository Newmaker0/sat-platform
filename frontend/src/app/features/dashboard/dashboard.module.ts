import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MaterialModule } from '../../shared/material.module';
import { getPtBrPaginatorIntl } from '../../shared/i18n/paginator-intl-pt-br';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MetricCardComponent } from './components/metric-card/metric-card.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    MetricCardComponent,
    OverviewComponent,
    PageHeaderComponent,
    ReportsComponent,
    SettingsComponent
  ],
  imports: [CommonModule, MaterialModule, DashboardRoutingModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPtBrPaginatorIntl }]
})
export class DashboardModule {}
