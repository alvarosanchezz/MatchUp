import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';
import { AuthService } from './core/services/auth.service';
import { TokenService } from './core/services/token.service';

// Registrar datos del locale español una sola vez al arrancar
registerLocaleData(localeEs);

function initializeApp(authService: AuthService, tokenService: TokenService) {
  return (): Promise<void> => {
    if (!tokenService.isLoggedIn()) return Promise.resolve();
    return authService
      .loadCurrentUser()
      .toPromise()
      .then(() => undefined)
      .catch(() => {
        tokenService.clear();
      });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
    provideAnimations(),

    // ── Locale español ──────────────────────────────────────────────────
    { provide: LOCALE_ID,       useValue: 'es-ES' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },

    // ── App initializer: carga el usuario si ya hay token válido ────────
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, TokenService],
      multi: true,
    },
  ],
};
