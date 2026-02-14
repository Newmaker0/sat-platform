import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
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
    const didLogin = this.authService.login(this.username, this.password);
    if (!didLogin) {
      this.errorMessage = 'Informe usuário e senha para continuar.';
      return;
    }

    this.errorMessage = '';
    this.router.navigateByUrl('/dashboard');
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
