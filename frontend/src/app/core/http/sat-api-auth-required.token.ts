import { HttpContextToken } from '@angular/common/http';

export const SAT_API_AUTH_REQUIRED = new HttpContextToken<boolean>(() => false);
