import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url.token';
import { SAT_API_AUTH_REQUIRED } from './sat-api-auth-required.token';

type ParamValue = string | number | boolean | readonly (string | number | boolean)[];

export interface ApiHttpOptions {
  readonly headers?: HttpHeaders | { [header: string]: string | string[] };
  readonly params?: HttpParams | { [param: string]: ParamValue };
  readonly context?: HttpContext;
}

@Injectable({ providedIn: 'root' })
export class ApiHttpService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string
  ) {}

  get<TResponse>(path: string, options?: ApiHttpOptions): Observable<TResponse> {
    return this.http.get<TResponse>(this.toUrl(path), this.withApiAuthContext(options));
  }

  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: ApiHttpOptions
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.toUrl(path), body, this.withApiAuthContext(options));
  }

  private toUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      throw new Error('ApiHttpService accepts only relative API paths.');
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }

  private withApiAuthContext(options?: ApiHttpOptions): ApiHttpOptions {
    const context = (options?.context ?? new HttpContext()).set(SAT_API_AUTH_REQUIRED, true);
    return { ...options, context };
  }
}
