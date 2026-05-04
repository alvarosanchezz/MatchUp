import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  UsuarioResponse,
  UsuarioPublicResponse,
  UsuarioPreferenciaResponse,
  UsuarioUpdateRequest,
  UsuarioPreferenciaRequest,
} from '../models/user.model';
import { QuedadaSummaryResponse } from '../models/meetup.model';
import { Page } from '../models/page.model';

export type MeetupRole = 'ORGANIZED' | 'JOINED' | 'ALL';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getMe(): Observable<UsuarioResponse> {
    return this.api.get<UsuarioResponse>('/users/me');
  }

  updateMe(body: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.api.patch<UsuarioResponse, UsuarioUpdateRequest>('/users/me', body);
  }

  getMySports(): Observable<UsuarioPreferenciaResponse[]> {
    return this.api.get<UsuarioPreferenciaResponse[]>('/users/me/sports');
  }

  updateMySports(prefs: UsuarioPreferenciaRequest[]): Observable<UsuarioPreferenciaResponse[]> {
    return this.api.put<UsuarioPreferenciaResponse[], UsuarioPreferenciaRequest[]>('/users/me/sports', prefs);
  }

  getMyMeetups(role: MeetupRole = 'ALL', page = 0, size = 20): Observable<Page<QuedadaSummaryResponse>> {
    return this.api.get<Page<QuedadaSummaryResponse>>('/users/me/meetups', { role, page, size });
  }

  getPublicProfile(id: number): Observable<UsuarioPublicResponse> {
    return this.api.get<UsuarioPublicResponse>(`/users/${id}`);
  }
}
