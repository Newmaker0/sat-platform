import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ReportsComponent } from './pages/reports/reports.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'estoque' },
      { path: 'estoque', component: OverviewComponent },
      { path: 'atividades', component: ReportsComponent },
      { path: 'overview', pathMatch: 'full', redirectTo: 'estoque' },
      { path: 'reports', pathMatch: 'full', redirectTo: 'atividades' },
      { path: 'configuracoes', pathMatch: 'full', redirectTo: 'estoque' },
      { path: 'settings', pathMatch: 'full', redirectTo: 'estoque' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
