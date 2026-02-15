import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string
  ) {}

  validateAdminCredentials(authToken: string): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Basic ${authToken}`
    });

    return this.http
      .get<unknown>(`${this.apiBaseUrl}/admin/overview`, { headers })
      .pipe(map(() => undefined));
  }
}
