import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.model';
import { UsuarioResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  private readonly base = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<UsuarioResponse | null>(null);

  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, body).pipe(
      tap(res => this.tokenService.setTokens(res.access_token, res.refresh_token))
    );
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, body).pipe(
      tap(res => this.tokenService.setTokens(res.access_token, res.refresh_token))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${this.base}/refresh`, { refreshToken })
      .pipe(tap(res => this.tokenService.setTokens(res.access_token, res.refresh_token)));
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.base}/logout`, { refreshToken }).subscribe({ error: () => {} });
    }
    this.tokenService.clear();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<unknown> {
    return this.http.post(`${this.base}/forgot-password`, body);
  }

  resetPassword(body: ResetPasswordRequest): Observable<unknown> {
    return this.http.post(`${this.base}/reset-password`, body);
  }

  loadCurrentUser(): Observable<UsuarioResponse> {
    return this.http
      .get<UsuarioResponse>(`${environment.apiUrl}/users/me`)
      .pipe(tap(user => this.currentUser.set(user)));
  }
}
