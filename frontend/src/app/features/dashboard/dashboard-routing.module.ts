import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'estoque' },
      { path: 'estoque', component: OverviewComponent, data: { animation: 'estoque' } },
      { path: 'atividades', component: ReportsComponent, data: { animation: 'atividades' } },
      { path: 'configuracoes', component: SettingsComponent, data: { animation: 'configuracoes' } },
      { path: 'overview', pathMatch: 'full', redirectTo: 'estoque' },
      { path: 'reports', pathMatch: 'full', redirectTo: 'atividades' },
      { path: 'settings', pathMatch: 'full', redirectTo: 'configuracoes' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
