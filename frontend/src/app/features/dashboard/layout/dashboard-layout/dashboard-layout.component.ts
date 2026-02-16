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
    { label: 'Atividades', path: 'atividades' }
  ];
  readonly userMenuItems: readonly ActionMenuItem[] = [
    { id: 'LOGOUT', label: 'Sair', icon: 'logout' }
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
    if (actionId === 'LOGOUT') {
      this.logout();
    }
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.closeSidebar();
    this.router.navigateByUrl('/login');
  }
}
