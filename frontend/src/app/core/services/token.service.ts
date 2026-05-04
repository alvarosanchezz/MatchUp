import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

const STORAGE_KEY = 'matchup.tokens';

interface StoredTokens {
  access_token: string;
  refresh_token: string;
}

interface JwtPayload {
  exp: number;
  sub: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {

  getAccessToken(): string | null {
    return this.load()?.access_token ?? null;
  }

  getRefreshToken(): string | null {
    return this.load()?.refresh_token ?? null;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    const tokens: StoredTokens = { access_token: accessToken, refresh_token: refreshToken };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  }

  private load(): StoredTokens | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredTokens;
    } catch {
      return null;
    }
  }
}
