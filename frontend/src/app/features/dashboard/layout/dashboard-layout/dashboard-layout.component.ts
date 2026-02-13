import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';

interface DashboardLink {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayoutComponent {
  @ViewChild(MatMenuTrigger) userMenuTrigger?: MatMenuTrigger;

  readonly user$ = this.authService.user$;
  readonly links: readonly DashboardLink[] = [
    { label: 'Visão geral', path: 'overview' },
    { label: 'Relatórios', path: 'reports' },
    { label: 'Configurações', path: 'settings' }
  ];

  isSidebarOpen = false;
  isUserMenuOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.closeUserMenu();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  trackByPath(_: number, link: DashboardLink): string {
    return link.path;
  }

  onUserMenuOpened(): void {
    this.isUserMenuOpen = true;
  }

  onUserMenuClosed(): void {
    this.isUserMenuOpen = false;
  }

  closeUserMenu(): void {
    this.userMenuTrigger?.closeMenu();
  }

  goToSettings(): void {
    this.closeUserMenu();
    this.closeSidebar();
    this.router.navigateByUrl('/dashboard/settings');
  }

  goToReports(): void {
    this.closeUserMenu();
    this.closeSidebar();
    this.router.navigateByUrl('/dashboard/reports');
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.closeSidebar();
    this.router.navigateByUrl('/login');
  }
}
