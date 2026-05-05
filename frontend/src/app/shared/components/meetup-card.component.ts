import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuedadaSummaryResponse, EstadoQuedada } from '../../core/models/meetup.model';

const ESTADO_LABELS: Record<EstadoQuedada, string> = {
  ABIERTA: 'Abierta',
  COMPLETA: 'Completa',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

@Component({
  selector: 'app-meetup-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  styles: [`
    .meetup-card {
      cursor: pointer;
      transition: box-shadow 0.2s ease;
      height: 100%;
    }
    .meetup-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.14); }
    .card-header-content { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; gap: 8px; }
    .estado-badge { flex-shrink: 0; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }
    .badge-abierta    { background: #dcfce7; color: #166534; }
    .badge-completa   { background: #ffedd5; color: #9a3412; }
    .badge-finalizada { background: #f3f4f6; color: #374151; }
    .badge-cancelada  { background: #fee2e2; color: #991b1b; }
    .card-row { display: flex; align-items: center; gap: 6px; font-size: 14px; color: rgba(0,0,0,.72); margin: 4px 0; }
    .card-icon { font-size: 17px; width: 17px; height: 17px; color: rgba(0,0,0,.45); flex-shrink: 0; }
    .card-description { font-size: 13px; color: rgba(0,0,0,.5); margin-top: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `],
  template: `
    <mat-card class="meetup-card" (click)="cardClick.emit(meetup.id)">
      <mat-card-header>
        <div class="card-header-content">
          <div>
            <mat-card-title>{{ meetup.nombreDeporte }}</mat-card-title>
            <mat-card-subtitle>{{ meetup.fechaHoraInicio | date:'dd/MM/yyyy HH:mm' }}</mat-card-subtitle>
          </div>
          <span [class]="'estado-badge badge-' + meetup.estado.toLowerCase()">
            {{ estadoLabel }}
          </span>
        </div>
      </mat-card-header>
      <mat-card-content>
        <p class="card-row">
          <mat-icon class="card-icon">place</mat-icon>
          {{ meetup.ubicacionNombre }}
        </p>
        <p class="card-row">
          <mat-icon class="card-icon">group</mat-icon>
          {{ meetup.numParticipantesActivos }} / {{ meetup.numJugadoresTotal }} jugadores
        </p>
        @if (meetup.descripcion) {
          <p class="card-description">{{ meetup.descripcion }}</p>
        }
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button color="primary" (click)="cardClick.emit(meetup.id); $event.stopPropagation()">
          Ver detalle
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class MeetupCardComponent {
  @Input({ required: true }) meetup!: QuedadaSummaryResponse;
  @Output() cardClick = new EventEmitter<number>();

  get estadoLabel(): string {
    return ESTADO_LABELS[this.meetup.estado] ?? this.meetup.estado;
  }
}
