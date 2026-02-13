import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

interface DashboardLink {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent {
  readonly user$ = this.authService.user$;
  readonly links: readonly DashboardLink[] = [
    { label: 'Visão geral', path: 'overview' },
    { label: 'Relatórios', path: 'reports' },
    { label: 'Configurações', path: 'settings' }
  ];

  isSidebarOpen = false;
  isUserMenuOpen = false;
  userMenuStyles: Record<string, string> = {};
  private userMenuTriggerElement?: HTMLElement;

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

  toggleUserMenu(event: MouseEvent): void {
    if (this.isUserMenuOpen) {
      this.closeUserMenu();
      return;
    }

    this.openUserMenu(event.currentTarget as HTMLElement | null);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
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

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void {
    if (!this.isUserMenuOpen) {
      return;
    }

    this.updateUserMenuPosition();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeUserMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.closeSidebar();
    this.router.navigateByUrl('/login');
  }

  private openUserMenu(trigger: HTMLElement | null): void {
    if (!trigger) {
      return;
    }

    this.userMenuTriggerElement = trigger;
    this.updateUserMenuPosition();
    this.isUserMenuOpen = true;
  }

  private updateUserMenuPosition(): void {
    const trigger = this.userMenuTriggerElement;
    if (!trigger) {
      return;
    }

    const viewportPadding = 16;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(352, Math.max(280, rect.width));
    const left = Math.max(
      viewportPadding,
      Math.min(rect.left, window.innerWidth - width - viewportPadding)
    );

    this.userMenuStyles = {
      width: `${width}px`,
      left: `${left}px`,
      bottom: `${window.innerHeight - rect.top + 8}px`,
      maxHeight: `${Math.max(220, rect.top - viewportPadding)}px`
    };
  }
}
