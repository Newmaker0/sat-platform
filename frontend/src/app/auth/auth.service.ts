import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'sat-auth-user';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());

  readonly user$ = this.userSubject.asObservable();

  get user(): AuthUser | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.user;
  }

  login(name: string, email: string): boolean {
    if (!name.trim() || !email.trim()) {
      return false;
    }

    const user: AuthUser = { name: name.trim(), email: email.trim() };
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  private getStoredUser(): AuthUser | null {
    const serializedUser = localStorage.getItem(this.storageKey);

    if (!serializedUser) {
      return null;
    }

    try {
      return JSON.parse(serializedUser) as AuthUser;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
