import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { QuedadaSummaryResponse, EstadoQuedada } from '../../core/models/meetup.model';

const ESTADO_LABELS: Record<EstadoQuedada, string> = {
  ABIERTA:    'Abierta',
  COMPLETA:   'Completa',
  FINALIZADA: 'Finalizada',
  CANCELADA:  'Cancelada',
};

function sportIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('fútbol') || n.includes('futbol') || n.includes('soccer')) return 'sports_soccer';
  if (n.includes('basket') || n.includes('baloncesto'))  return 'sports_basketball';
  if (n.includes('tenis') || n.includes('tennis'))       return 'sports_tennis';
  if (n.includes('volei') || n.includes('voley'))        return 'sports_volleyball';
  if (n.includes('golf'))                                return 'golf_course';
  if (n.includes('natac') || n.includes('swim'))         return 'pool';
  if (n.includes('ciclismo') || n.includes('bici'))      return 'directions_bike';
  if (n.includes('running') || n.includes('atletismo'))  return 'directions_run';
  if (n.includes('padel') || n.includes('pádel'))        return 'sports_tennis';
  return 'sports';
}

@Component({
  selector: 'app-meetup-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatIconModule],
  styles: [`
    :host { display: block; height: 100%; }

    .card {
      background: var(--apex-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--apex-ink-10);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: box-shadow var(--t-normal), transform var(--t-normal), border-color var(--t-normal);
      position: relative;
    }
    .card:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-3px);
      border-color: var(--apex-ink-20);
    }
    .card:active { transform: translateY(-1px); }

    .card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      border-radius: 3px 0 0 3px;
      opacity: 0;
      transition: opacity var(--t-normal);
    }
    .card:hover::before { opacity: 1; }
    .card.estado-abierta::before    { background: var(--apex-success); }
    .card.estado-completa::before   { background: var(--apex-warning); }
    .card.estado-finalizada::before { background: #636366; }
    .card.estado-cancelada::before  { background: var(--apex-error);   }

    .card-header {
      padding: 16px 18px 12px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .sport-icon-wrap {
      width: 42px; height: 42px;
      border-radius: var(--radius-md);
      background: var(--apex-blue-light);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sport-icon-wrap mat-icon { color: var(--apex-blue); font-size: 22px; width: 22px; height: 22px; }

    .header-text { flex: 1; min-width: 0; }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--apex-ink);
      margin: 0 0 3px;
      letter-spacing: -0.2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-date {
      font-size: 12px;
      color: var(--apex-ink-40);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .card-date mat-icon { font-size: 13px; width: 13px; height: 13px; }

    .estado-badge {
      flex-shrink: 0;
      padding: 3px 9px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .badge-abierta    { background: var(--apex-success-bg); color: #1a7a2e; }
    .badge-completa   { background: var(--apex-warning-bg); color: #8a5000; }
    .badge-finalizada { background: var(--apex-neutral-bg); color: #636366; }
    .badge-cancelada  { background: var(--apex-error-bg);   color: #bf1e15; }

    .card-divider { height: 1px; background: var(--apex-ink-10); margin: 0 18px; }

    .card-body {
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      color: var(--apex-ink-60);
    }
    .info-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--apex-ink-40); flex-shrink: 0; }
    .info-row span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .players-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .players-bar-track { flex: 1; height: 4px; background: var(--apex-ink-10); border-radius: 2px; overflow: hidden; }
    .players-bar-fill {
      height: 100%; border-radius: 2px;
      background: var(--apex-blue);
      transition: width 0.4s ease;
    }
    .players-bar-fill.full { background: var(--apex-warning); }
    .players-count { font-size: 12px; font-weight: 600; color: var(--apex-ink-40); white-space: nowrap; }

    .card-desc {
      font-size: 13px;
      color: var(--apex-ink-40);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
      margin-top: 2px;
    }

    .card-footer {
      padding: 10px 18px 14px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .ver-link {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: var(--apex-blue);
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;
      font-family: 'Inter', system-ui, sans-serif;
      transition: gap var(--t-fast), opacity var(--t-fast);
    }
    .ver-link mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ver-link:hover { gap: 6px; opacity: 0.8; }
  `],
  template: `
    <div
      class="card"
      [class]="'estado-' + meetup.estado.toLowerCase()"
      (click)="cardClick.emit(meetup.id)"
      role="article"
    >
      <div class="card-header">
        <div class="sport-icon-wrap">
          <mat-icon>{{ sportIcon(meetup.nombreDeporte) }}</mat-icon>
        </div>
        <div class="header-text">
          <p class="card-title">{{ meetup.nombreDeporte }}</p>
          <span class="card-date">
            <mat-icon>schedule</mat-icon>
            {{ meetup.fechaHoraInicio | date:'dd/MM/yyyy · HH:mm' }}
          </span>
        </div>
        <span [class]="'estado-badge badge-' + meetup.estado.toLowerCase()">{{ estadoLabel }}</span>
      </div>

      <div class="card-divider"></div>

      <div class="card-body">
        <div class="info-row">
          <mat-icon>place</mat-icon>
          <span>{{ meetup.ubicacionNombre }}</span>
        </div>

        <div class="players-row">
          <mat-icon style="font-size:16px;width:16px;height:16px;color:var(--apex-ink-40)">group</mat-icon>
          <div class="players-bar-track">
            <div class="players-bar-fill"
              [class.full]="meetup.numParticipantesActivos >= meetup.numJugadoresTotal"
              [style.width.%]="(meetup.numParticipantesActivos / meetup.numJugadoresTotal) * 100">
            </div>
          </div>
          <span class="players-count">{{ meetup.numParticipantesActivos }}/{{ meetup.numJugadoresTotal }}</span>
        </div>

        @if (meetup.descripcion) {
          <p class="card-desc">{{ meetup.descripcion }}</p>
        }
      </div>

      <div class="card-footer">
        <button class="ver-link" (click)="cardClick.emit(meetup.id); $event.stopPropagation()">
          Ver detalle <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>
    </div>
  `,
})
export class MeetupCardComponent {
  @Input({ required: true }) meetup!: QuedadaSummaryResponse;
  @Output() cardClick = new EventEmitter<number>();

  get estadoLabel(): string { return ESTADO_LABELS[this.meetup.estado] ?? this.meetup.estado; }
  sportIcon(name: string): string { return sportIcon(name); }
}
