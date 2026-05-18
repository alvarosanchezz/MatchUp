import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { QuedadaSummaryResponse, EstadoQuedada } from '../../core/models/meetup.model';

const ESTADO_LABELS: Record<EstadoQuedada, string> = {
  ABIERTA:    'Abierta',
  COMPLETA:   'Completa',
  FINALIZADA: 'Finalizada',
  CANCELADA:  'Cancelada',
};

function sportIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('fútbol') || n.includes('futbol') || n.includes('soccer')) return 'activity';
  if (n.includes('basket') || n.includes('baloncesto'))  return 'activity';
  if (n.includes('tenis') || n.includes('tennis'))       return 'zap';
  if (n.includes('volei') || n.includes('voley'))        return 'volleyball';
  if (n.includes('natac') || n.includes('swim'))         return 'waves';
  if (n.includes('ciclismo') || n.includes('bici'))      return 'bike';
  if (n.includes('running') || n.includes('atletismo'))  return 'footprints';
  if (n.includes('padel') || n.includes('pádel'))        return 'zap';
  if (n.includes('golf'))                                return 'flag';
  return 'trophy';
}

@Component({
  selector: 'app-meetup-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, LucideAngularModule],
  styles: [`
    :host { display: block; height: 100%; }

    .card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--hairline);
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
      border-color: var(--hairline-2);
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
    .card.estado-abierta::before    { background: oklch(0.73 0.17 145); }
    .card.estado-completa::before   { background: oklch(0.78 0.15 75); }
    .card.estado-finalizada::before { background: color-mix(in oklch, var(--ink) 35%, transparent); }
    .card.estado-cancelada::before  { background: var(--danger); }

    .card-header {
      padding: 16px 18px 12px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .sport-icon-wrap {
      width: 42px; height: 42px;
      border-radius: var(--radius-md);
      background: color-mix(in oklch, var(--accent) 14%, transparent);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sport-icon-wrap lucide-icon {
      width: 22px; height: 22px;
      color: var(--accent);
    }

    .header-text { flex: 1; min-width: 0; }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 3px;
      letter-spacing: -0.2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-date {
      font-size: 12px;
      color: color-mix(in oklch, var(--ink) 50%, transparent);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .card-date lucide-icon { width: 12px; height: 12px; flex-shrink: 0; }

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
    .badge-abierta    {
      background: color-mix(in oklch, oklch(0.73 0.17 145) 18%, transparent);
      color: oklch(0.73 0.17 145);
    }
    .badge-completa   {
      background: color-mix(in oklch, oklch(0.78 0.15 75) 18%, transparent);
      color: oklch(0.78 0.15 75);
    }
    .badge-finalizada {
      background: color-mix(in oklch, var(--ink) 12%, transparent);
      color: color-mix(in oklch, var(--ink) 50%, transparent);
    }
    .badge-cancelada  {
      background: color-mix(in oklch, var(--danger) 18%, transparent);
      color: var(--danger);
    }

    .card-divider { height: 1px; background: var(--hairline); margin: 0 18px; }

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
      color: color-mix(in oklch, var(--ink) 65%, transparent);
    }
    .info-row lucide-icon {
      width: 15px; height: 15px;
      color: color-mix(in oklch, var(--ink) 45%, transparent);
      flex-shrink: 0;
    }
    .info-row span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .players-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .players-bar-track {
      flex: 1; height: 4px;
      background: var(--hairline);
      border-radius: 2px; overflow: hidden;
    }
    .players-bar-fill {
      height: 100%; border-radius: 2px;
      background: var(--accent);
      transition: width 0.4s ease;
    }
    .players-bar-fill.full { background: oklch(0.78 0.15 75); }
    .players-count {
      font-size: 12px; font-weight: 600;
      color: color-mix(in oklch, var(--ink) 45%, transparent);
      white-space: nowrap;
    }

    .card-desc {
      font-size: 13px;
      color: color-mix(in oklch, var(--ink) 45%, transparent);
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
      color: var(--accent);
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
      transition: gap var(--t-fast), opacity var(--t-fast);
    }
    .ver-link lucide-icon { width: 15px; height: 15px; }
    .ver-link:hover { gap: 7px; opacity: 0.8; }
  `],
  template: `
    <div
      [class]="'card estado-' + meetup.estado.toLowerCase()"
      (click)="cardClick.emit(meetup.id)"
      role="article"
    >
      <div class="card-header">
        <div class="sport-icon-wrap">
          <lucide-icon [name]="sportIcon(meetup.nombreDeporte)"></lucide-icon>
        </div>
        <div class="header-text">
          <p class="card-title">{{ meetup.nombreDeporte }}</p>
          <span class="card-date">
            <lucide-icon name="clock"></lucide-icon>
            {{ meetup.fechaHoraInicio | date:'dd/MM/yyyy · HH:mm' }}
          </span>
        </div>
        <span [class]="'estado-badge badge-' + meetup.estado.toLowerCase()">{{ estadoLabel }}</span>
      </div>

      <div class="card-divider"></div>

      <div class="card-body">
        <div class="info-row">
          <lucide-icon name="map-pin"></lucide-icon>
          <span>{{ meetup.ubicacionNombre }}</span>
        </div>

        <div class="players-row">
          <lucide-icon name="users" style="width:15px;height:15px;color:color-mix(in oklch,var(--ink) 45%,transparent);flex-shrink:0"></lucide-icon>
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
          Ver detalle <lucide-icon name="arrow-right"></lucide-icon>
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
