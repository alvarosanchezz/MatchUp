import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  LOCALE_ID,
  importProvidersFrom,
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
import {
  LucideAngularModule,
  Activity, ArrowLeft, ArrowRight, Bike, Bookmark, BarChart3, Bell,
  Calendar, CalendarCheck, Check, CheckCircle2, ChevronDown, ChevronRight,
  Circle, CircleDashed, Clock, Compass, Eye, EyeOff, Flag, Flame, Footprints,
  Globe, Goal, Info, Key, Layers, Lock, LogIn, LogOut, Mail, Map, MapPin,
  Megaphone, Menu, MessageCircle, Navigation, Pencil, Plus, PlusCircle,
  Radar, Search, Send, Settings, Share2, Sliders, Star, Trash2, Trophy,
  User, UserPlus, Users, Volleyball, Waves, X, Zap,
} from 'lucide-angular';

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

    // ── Lucide icons — registro global de iconos usados en la app ────────
    importProvidersFrom(LucideAngularModule.pick({
      Activity, ArrowLeft, ArrowRight, Bike, Bookmark, BarChart3, Bell,
      Calendar, CalendarCheck, Check, CheckCircle2, ChevronDown, ChevronRight,
      Circle, CircleDashed, Clock, Compass, Eye, EyeOff, Flag, Flame, Footprints,
      Globe, Goal, Info, Key, Layers, Lock, LogIn, LogOut, Mail, Map, MapPin,
      Megaphone, Menu, MessageCircle, Navigation, Pencil, Plus, PlusCircle,
      Radar, Search, Send, Settings, Share2, Sliders, Star, Trash2, Trophy,
      User, UserPlus, Users, Volleyball, Waves, X, Zap,
    })),
  ],
};
