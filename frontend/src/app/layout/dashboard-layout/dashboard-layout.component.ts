import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  @ViewChild('userMenuContainer') userMenuContainer?: ElementRef<HTMLElement>;

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

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isUserMenuOpen) {
      return;
    }

    const target = event.target as Node | null;
    const container = this.userMenuContainer?.nativeElement;
    if (!target || !container) {
      return;
    }

    if (!container.contains(target)) {
      this.closeUserMenu();
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.closeSidebar();
    this.router.navigateByUrl('/login');
  }
}
