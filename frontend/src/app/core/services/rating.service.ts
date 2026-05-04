import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RatingRequest, RatingResponse } from '../models/rating.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly api = inject(ApiService);

  rate(meetupId: number, body: RatingRequest): Observable<RatingResponse> {
    return this.api.post<RatingResponse, RatingRequest>(`/meetups/${meetupId}/ratings`, body);
  }

  getReceived(meetupId: number): Observable<RatingResponse[]> {
    return this.api.get<RatingResponse[]>(`/meetups/${meetupId}/ratings/received`);
  }
}
