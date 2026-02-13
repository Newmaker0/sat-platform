import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  name = '';
  email = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    const didLogin = this.authService.login(this.name, this.email);

    if (!didLogin) {
      this.errorMessage = 'Please provide your name and email to continue.';
      return;
    }

    this.errorMessage = '';
    this.router.navigateByUrl('/dashboard');
  }
}
