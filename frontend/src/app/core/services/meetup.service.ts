import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  QuedadaSummaryResponse,
  QuedadaDetailResponse,
  QuedadaRequest,
  QuedadaPatchRequest,
  MeetupFilters,
} from '../models/meetup.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class MeetupService {
  private readonly api = inject(ApiService);

  list(filters: MeetupFilters = {}, page = 0, size = 20): Observable<Page<QuedadaSummaryResponse>> {
    return this.api.get<Page<QuedadaSummaryResponse>>('/meetups', {
      ...filters,
      page,
      size,
    } as Record<string, string | number | boolean | undefined>);
  }

  getById(id: number): Observable<QuedadaDetailResponse> {
    return this.api.get<QuedadaDetailResponse>(`/meetups/${id}`);
  }

  create(body: QuedadaRequest): Observable<QuedadaDetailResponse> {
    return this.api.post<QuedadaDetailResponse, QuedadaRequest>('/meetups', body);
  }

  update(id: number, body: QuedadaPatchRequest): Observable<QuedadaDetailResponse> {
    return this.api.patch<QuedadaDetailResponse, QuedadaPatchRequest>(`/meetups/${id}`, body);
  }

  cancel(id: number): Observable<void> {
    return this.api.delete<void>(`/meetups/${id}`);
  }

  finalize(id: number): Observable<QuedadaDetailResponse> {
    return this.api.post<QuedadaDetailResponse>(`/meetups/${id}/finalize`);
  }
}
