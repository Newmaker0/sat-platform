import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    const didLogin = this.authService.login(this.username, this.password);
    if (!didLogin) {
      this.errorMessage = 'Informe usuário e senha para continuar.';
      return;
    }

    this.errorMessage = '';
    this.router.navigateByUrl('/dashboard');
  }
}
