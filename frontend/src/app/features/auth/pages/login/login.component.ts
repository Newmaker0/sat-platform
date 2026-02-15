import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;
  shouldRenderOrbitalScene = false;

  private sceneMountDelayId?: number;
  private isDestroyed = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
          this.errorMessage = 'Credenciais inválidas ou sem acesso administrativo.';
          return;
        }

        this.errorMessage = '';
        this.router.navigateByUrl('/dashboard');
      });
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
}
