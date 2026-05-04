import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DeporteRequest, DeportePatchRequest, DeporteResponse } from '../models/sport.model';

@Injectable({ providedIn: 'root' })
export class SportService {
  private readonly api = inject(ApiService);

  listAll(): Observable<DeporteResponse[]> {
    return this.api.get<DeporteResponse[]>('/sports');
  }

  create(body: DeporteRequest): Observable<DeporteResponse> {
    return this.api.post<DeporteResponse, DeporteRequest>('/sports', body);
  }

  update(id: number, body: DeportePatchRequest): Observable<DeporteResponse> {
    return this.api.patch<DeporteResponse, DeportePatchRequest>(`/sports/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/sports/${id}`);
  }
}
