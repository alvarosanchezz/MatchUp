import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';

const PUBLIC_PATHS = [
  '/auth/register',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const path = req.url.replace(environment.apiUrl, '');
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return next(req);
  }

  const token = inject(TokenService).getAccessToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
