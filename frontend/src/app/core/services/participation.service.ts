import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ParticipacionResponse } from '../models/participation.model';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  private readonly api = inject(ApiService);

  join(meetupId: number): Observable<ParticipacionResponse> {
    return this.api.post<ParticipacionResponse>(`/meetups/${meetupId}/participations/join`);
  }

  leave(meetupId: number): Observable<void> {
    return this.api.post<void>(`/meetups/${meetupId}/participations/leave`);
  }

  confirm(meetupId: number, userId: number): Observable<ParticipacionResponse> {
    return this.api.post<ParticipacionResponse>(`/meetups/${meetupId}/participations/${userId}/confirm`);
  }

  markNoShow(meetupId: number, userId: number): Observable<ParticipacionResponse> {
    return this.api.post<ParticipacionResponse>(`/meetups/${meetupId}/participations/${userId}/no-show`);
  }
}
