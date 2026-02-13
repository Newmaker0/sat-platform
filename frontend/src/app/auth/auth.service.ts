import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'sat-auth-user';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  readonly user$ = this.userSubject.asObservable();

  get user(): AuthUser | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.user;
  }

  login(username: string, password: string): boolean {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return false;
    }

    const user: AuthUser = { username: cleanUsername };
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (!parsed?.username) {
        localStorage.removeItem(this.storageKey);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
