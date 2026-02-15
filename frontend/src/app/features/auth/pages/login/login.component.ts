import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;
  shouldRenderOrbitalScene = false;
  isMobileViewport = false;
  isMobileLoginModalOpen = false;
  isMobileLoginModalVisible = false;

  private sceneMountDelayId?: number;
  private modalCloseTimeoutId?: ReturnType<typeof setTimeout>;
  private modalOpenFrameId = 0;
  private isDestroyed = false;
  private readonly modalExitAnimationMs = 240;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateViewportMode();
    this.sceneMountDelayId = window.setTimeout(() => {
      this.mountOrbitalScene();
    }, 120);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;

    if (this.sceneMountDelayId) {
      window.clearTimeout(this.sceneMountDelayId);
      this.sceneMountDelayId = undefined;
    }

    if (this.modalCloseTimeoutId) {
      clearTimeout(this.modalCloseTimeoutId);
      this.modalCloseTimeoutId = undefined;
    }

    if (this.modalOpenFrameId) {
      cancelAnimationFrame(this.modalOpenFrameId);
      this.modalOpenFrameId = 0;
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Informe usuário e senha para continuar.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService
      .login(this.username, this.password)
      .pipe(
        take(1),
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe((didLogin) => {
        if (!didLogin) {
          this.errorMessage = 'Credenciais inválidas';
          return;
        }

        this.errorMessage = '';
        this.router.navigateByUrl('/dashboard');
      });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateViewportMode();
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.closeMobileLoginModal();
  }

  openMobileLoginModal(): void {
    if (this.modalCloseTimeoutId) {
      clearTimeout(this.modalCloseTimeoutId);
      this.modalCloseTimeoutId = undefined;
    }

    this.isMobileLoginModalVisible = true;
    this.isMobileLoginModalOpen = false;
    this.errorMessage = '';

    this.modalOpenFrameId = requestAnimationFrame(() => {
      this.modalOpenFrameId = 0;
      if (this.isDestroyed || !this.isMobileLoginModalVisible) {
        return;
      }
      this.isMobileLoginModalOpen = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  closeMobileLoginModal(): void {
    if (!this.isMobileLoginModalVisible) {
      return;
    }

    this.isMobileLoginModalOpen = false;

    if (this.modalCloseTimeoutId) {
      clearTimeout(this.modalCloseTimeoutId);
    }

    this.modalCloseTimeoutId = setTimeout(() => {
      this.modalCloseTimeoutId = undefined;
      this.isMobileLoginModalVisible = false;
      this.changeDetectorRef.markForCheck();
    }, this.modalExitAnimationMs);
  }

  private async mountOrbitalScene(): Promise<void> {
    try {
      const { defineSatOrbitalSceneElement } =
        await import('../../web-components/sat-orbital-scene.element');
      defineSatOrbitalSceneElement();

      if (!this.isDestroyed) {
        this.shouldRenderOrbitalScene = true;
        this.changeDetectorRef.markForCheck();
      }
    } catch (error) {
      console.error('Falha ao carregar cena orbital:', error);
    }
  }

  private updateViewportMode(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isMobileViewport = window.innerWidth < 768;
    if (!this.isMobileViewport) {
      this.isMobileLoginModalOpen = false;
      this.isMobileLoginModalVisible = false;
    }
  }
}
