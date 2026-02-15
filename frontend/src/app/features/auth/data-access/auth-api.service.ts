import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api-base-url.token';

export interface LoginApiResponse {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresInSeconds: number;
  readonly username: string;
  readonly role: 'ADMIN' | 'TECHNICIAN';
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string
  ) {}

  login(username: string, password: string): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.apiBaseUrl}/auth/admin/login`, {
      username,
      password
    });
  }
}
