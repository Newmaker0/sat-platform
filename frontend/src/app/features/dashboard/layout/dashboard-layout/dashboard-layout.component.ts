import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { ActionMenuItem } from '../../../../shared/ui/action-menu/action-menu.component';

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
  readonly user$ = this.authService.user$;
  readonly links: readonly DashboardLink[] = [
    { label: 'Estoque', path: 'estoque' },
    { label: 'Atividades', path: 'atividades' },
    { label: 'Configurações', path: 'configuracoes' }
  ];
  readonly userMenuItems: readonly ActionMenuItem[] = [
    { id: 'PROFILE', label: 'Perfil', icon: 'user' },
    { id: 'ACTIVITIES', label: 'Atividades', icon: 'activities' },
    { id: 'NOTIFICATIONS', label: 'Notificações', icon: 'notifications' },
    { id: 'LOGOUT', label: 'Sair', icon: 'logout', dividerBefore: true }
  ];

  isSidebarOpen = false;
  isUserMenuOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.isUserMenuOpen = false;
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

  onUserMenuAction(actionId: string): void {
    if (actionId === 'ACTIVITIES') {
      this.goToActivities();
      return;
    }

    if (actionId === 'LOGOUT') {
      this.logout();
      return;
    }

    this.goToSettings();
  }

  goToSettings(): void {
    this.isUserMenuOpen = false;
    this.closeSidebar();
    this.router.navigateByUrl('/dashboard/configuracoes');
  }

  goToActivities(): void {
    this.isUserMenuOpen = false;
    this.closeSidebar();
    this.router.navigateByUrl('/dashboard/atividades');
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.closeSidebar();
    this.router.navigateByUrl('/login');
  }
}
