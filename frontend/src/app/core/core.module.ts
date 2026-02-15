import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { API_BASE_URL } from './http/api-base-url.token';
import { AuthTokenInterceptor } from './http/auth-token.interceptor';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    { provide: API_BASE_URL, useValue: '/api/v1' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule | null) {
    if (parentModule) {
      throw new Error('CoreModule should only be imported in AppModule.');
    }
  }
}
