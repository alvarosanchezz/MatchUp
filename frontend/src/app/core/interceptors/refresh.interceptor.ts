import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

// Module-level state so all interceptor calls share the same refresh lock
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || !tokenService.getRefreshToken()) {
        return throwError(() => err);
      }

      if (isRefreshing) {
        // Wait until the ongoing refresh completes, then retry with new token
        return refreshDone$.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(newToken =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
          )
        );
      }

      isRefreshing = true;
      refreshDone$.next(null);

      return authService.refresh().pipe(
        switchMap(res => {
          isRefreshing = false;
          refreshDone$.next(res.access_token);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.access_token}` } }));
        }),
        catchError(refreshErr => {
          isRefreshing = false;
          refreshDone$.next(null);
          authService.logout();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
