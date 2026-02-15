import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'ADMIN' | 'TECHNICIAN';

export interface AuthUser {
  readonly username: string;
  readonly role: UserRole;
  readonly authToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly storageKey = 'sat-auth-session';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  readonly user$ = this.userSubject.asObservable();

  get user(): AuthUser | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.user !== null;
  }

  get authToken(): string | null {
    return this.user?.authToken ?? null;
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthUser>;
      if (
        typeof parsed.username !== 'string' ||
        (parsed.role !== 'ADMIN' && parsed.role !== 'TECHNICIAN') ||
        typeof parsed.authToken !== 'string'
      ) {
        localStorage.removeItem(this.storageKey);
        return null;
      }

      return {
        username: parsed.username,
        role: parsed.role,
        authToken: parsed.authToken
      };
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
