import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthSessionStore } from '../../auth/auth-session.store';
import { SAT_API_AUTH_REQUIRED } from './sat-api-auth-required.token';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private readonly authSessionStore: AuthSessionStore) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requiresApiAuth = request.context.get(SAT_API_AUTH_REQUIRED);
    const accessToken = this.authSessionStore.accessToken;
    const hasAuthorization = request.headers.has('Authorization');

    if (!requiresApiAuth || !accessToken || hasAuthorization) {
      return next.handle(request);
    }

    return next.handle(
      request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    );
  }
}
