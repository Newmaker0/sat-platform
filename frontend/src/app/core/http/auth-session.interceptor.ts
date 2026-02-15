import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { AuthSessionStore } from '../../auth/auth-session.store';
import { SAT_API_AUTH_REQUIRED } from './sat-api-auth-required.token';

@Injectable()
export class AuthSessionInterceptor implements HttpInterceptor {
  private handlingExpiredSession = false;

  constructor(
    private readonly authService: AuthService,
    private readonly authSessionStore: AuthSessionStore,
    private readonly router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (this.shouldLogoutForUnauthorized(error, request)) {
          this.logoutAndRedirect();
        }

        return throwError(() => error);
      })
    );
  }

  private shouldLogoutForUnauthorized(
    error: unknown,
    request: HttpRequest<unknown>
  ): error is HttpErrorResponse {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    if (error.status !== 401) {
      return false;
    }

    if (!request.context.get(SAT_API_AUTH_REQUIRED)) {
      return false;
    }

    return this.authSessionStore.isAuthenticated;
  }

  private logoutAndRedirect(): void {
    if (this.handlingExpiredSession) {
      return;
    }

    this.handlingExpiredSession = true;
    this.authService.logout();
    void this.router.navigateByUrl('/login').finally(() => {
      this.handlingExpiredSession = false;
    });
  }
}
