import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ParamValue = string | number | boolean | undefined | null;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(path: string, params?: Record<string, ParamValue>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      }
    }
    return this.http.get<T>(`${this.base}${path}`, { params: httpParams });
  }

  post<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body ?? null);
  }

  patch<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.patch<T>(`${this.base}${path}`, body);
  }

  put<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  delete<T = void>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`);
  }
}
