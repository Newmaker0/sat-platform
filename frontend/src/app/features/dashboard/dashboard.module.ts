import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardLayoutComponent } from '../../layout/dashboard-layout/dashboard-layout.component';
import { OverviewComponent } from '../../pages/overview/overview.component';
import { ReportsComponent } from '../../pages/reports/reports.component';
import { SettingsComponent } from '../../pages/settings/settings.component';
import { MaterialModule } from '../../shared/material.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    OverviewComponent,
    ReportsComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
