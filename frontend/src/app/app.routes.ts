import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Landing pública ───────────────────────────────────────────────────
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },

  // ── Rutas protegidas con MainLayout ───────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Quedadas — orden importa: 'new' antes de ':id'
      {
        path: 'meetups',
        loadComponent: () =>
          import('./features/meetups/meetups.component').then(m => m.MeetupsComponent),
      },
      {
        path: 'meetups/new',
        loadComponent: () =>
          import('./features/meetups/meetup-form/meetup-form.component').then(
            m => m.MeetupFormComponent
          ),
      },
      {
        path: 'meetups/:id',
        loadComponent: () =>
          import('./features/meetups/meetup-detail/meetup-detail.component').then(
            m => m.MeetupDetailComponent
          ),
      },
      {
        path: 'meetups/:id/edit',
        loadComponent: () =>
          import('./features/meetups/meetup-form/meetup-form.component').then(
            m => m.MeetupFormComponent
          ),
      },
      // Perfiles públicos
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./features/users/user-profile/user-profile.component').then(
            m => m.UserProfileComponent
          ),
      },
      // Perfil propio y deportes
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'sports',
        loadComponent: () =>
          import('./features/sports/sports.component').then(m => m.SportsComponent),
      },
      { path: '', redirectTo: 'meetups', pathMatch: 'full' },
    ],
  },

  // ── Auth con AuthLayout (sin guard) ───────────────────────────────────
  {
    path: 'auth',
    loadComponent: () =>
      import('./shared/layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            m => m.ForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            m => m.ResetPasswordComponent
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────────────────
  { path: '**', redirectTo: '/auth/login' },
];
