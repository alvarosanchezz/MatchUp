import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ComentarioRequest, ComentarioResponse } from '../models/comment.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly api = inject(ApiService);

  create(meetupId: number, body: ComentarioRequest): Observable<ComentarioResponse> {
    return this.api.post<ComentarioResponse, ComentarioRequest>(`/meetups/${meetupId}/comments`, body);
  }

  list(meetupId: number, page = 0, size = 20): Observable<Page<ComentarioResponse>> {
    return this.api.get<Page<ComentarioResponse>>(`/meetups/${meetupId}/comments`, { page, size });
  }

  delete(meetupId: number, commentId: number): Observable<void> {
    return this.api.delete<void>(`/meetups/${meetupId}/comments/${commentId}`);
  }
}
