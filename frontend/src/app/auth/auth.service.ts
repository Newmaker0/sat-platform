import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthApiService } from '../features/auth/data-access/auth-api.service';
import { AuthSessionStore, AuthUser } from './auth-session.store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly user$ = this.authSessionStore.user$;

  constructor(
    private readonly authApiService: AuthApiService,
    private readonly authSessionStore: AuthSessionStore
  ) {}

  get user(): AuthUser | null {
    return this.authSessionStore.user;
  }

  get isAuthenticated(): boolean {
    return this.authSessionStore.isAuthenticated;
  }

  login(username: string, password: string): Observable<boolean> {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return of(false);
    }

    const authToken = btoa(`${cleanUsername}:${cleanPassword}`);

    return this.authApiService.validateAdminCredentials(authToken).pipe(
      map(() => {
        this.authSessionStore.setUser({
          username: cleanUsername,
          role: 'ADMIN',
          authToken
        });
        return true;
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.authSessionStore.clear();
  }
}
