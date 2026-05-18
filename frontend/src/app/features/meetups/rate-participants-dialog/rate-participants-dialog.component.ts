import { Component, inject, signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { RatingService } from '../../../core/services/rating.service';
import { QuedadaDetailResponse, ParticipanteResponse } from '../../../core/models/meetup.model';

export interface RateParticipantsDialogData {
  meetup: QuedadaDetailResponse;
}

interface ParticipantRating {
  nivel: number;
  deportividad: number;
}

@Component({
  selector: 'app-rate-participants-dialog',
  standalone: true,
  imports: [MatDialogModule, MatSnackBarModule],
  styles: [`
    .dialog-content {
      padding: 8px 0 16px;
      max-height: 70vh;
      overflow-y: auto;
    }
    .participant-block { padding: 16px 0; }
    .participant-header {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 14px;
    }
    .avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: color-mix(in oklch, var(--accent) 25%, var(--surface-2));
      color: var(--accent);
      font-size: 15px; font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .participant-name { font-weight: 600; font-size: 15px; color: var(--ink); }

    /* Star rating */
    .rating-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px; flex-wrap: wrap;
    }
    .rating-label { font-size: 13px; color: var(--ink-muted); min-width: 130px; }
    .star-group { display: flex; gap: 3px; }
    .star-btn {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-2);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      font-size: 16px;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast);
      color: var(--ink-muted);
    }
    .star-btn.active {
      background: color-mix(in oklch, oklch(0.78 0.15 75) 20%, transparent);
      border-color: oklch(0.78 0.15 75);
      color: oklch(0.65 0.15 75);
    }
    .star-btn:hover { background: var(--surface-2); }

    .divider { height: 1px; background: var(--hairline); }

    .empty-msg {
      padding: 16px 0;
      color: var(--ink-muted);
      text-align: center;
      font-size: 14px;
    }

    /* Actions */
    .actions-row {
      display: flex; justify-content: flex-end;
      gap: 8px; align-items: center; width: 100%;
    }
    .btn-cancel {
      display: inline-flex; align-items: center;
      padding: 8px 16px;
      background: transparent;
      color: var(--ink-muted);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      font-size: 14px; font-weight: 500;
      font-family: 'Inter', system-ui, sans-serif;
      cursor: pointer;
      transition: background var(--t-fast);
    }
    .btn-cancel:hover:not(:disabled) { background: var(--bg-2); color: var(--ink); }
    .btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-confirm {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 18px;
      background: var(--accent);
      color: var(--accent-ink);
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px; font-weight: 600;
      font-family: 'Inter', system-ui, sans-serif;
      cursor: pointer;
      transition: opacity var(--t-fast);
    }
    .btn-confirm:hover:not(:disabled) { opacity: 0.88; }
    .btn-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-spin {
      display: inline-block;
      width: 15px; height: 15px;
      border: 2px solid color-mix(in oklch, var(--accent-ink) 40%, transparent);
      border-top-color: var(--accent-ink);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  template: `
    <h2 mat-dialog-title>Valorar participantes</h2>

    <div class="dialog-content">
      @if (confirmedParticipants.length === 0) {
        <p class="empty-msg">No hay otros participantes confirmados para valorar</p>
      }

      @for (p of confirmedParticipants; track p.idUsuario; let last = $last) {
        <div class="participant-block">
          <div class="participant-header">
            <div class="avatar">
              @if (p.urlFotoPerfil) {
                <img [src]="p.urlFotoPerfil" [alt]="p.nombre" />
              } @else {
                {{ initials(p.nombre) }}
              }
            </div>
            <span class="participant-name">{{ p.nombre }}</span>
          </div>

          <!-- Nivel (habilidad) -->
          <div class="rating-row">
            <span class="rating-label">⚡ Nivel (habilidad):</span>
            <div class="star-group">
              @for (n of [1,2,3,4,5]; track n) {
                <button
                  type="button"
                  [class]="'star-btn' + (getNivel(p.idUsuario) >= n ? ' active' : '')"
                  (click)="setNivel(p.idUsuario, n)">
                  {{ n }}★
                </button>
              }
            </div>
          </div>

          <!-- Deportividad -->
          <div class="rating-row">
            <span class="rating-label">🤝 Deportividad:</span>
            <div class="star-group">
              @for (n of [1,2,3,4,5]; track n) {
                <button
                  type="button"
                  [class]="'star-btn' + (getDeportividad(p.idUsuario) >= n ? ' active' : '')"
                  (click)="setDeportividad(p.idUsuario, n)">
                  {{ n }}★
                </button>
              }
            </div>
          </div>
        </div>

        @if (!last) { <div class="divider"></div> }
      }
    </div>

    <mat-dialog-actions>
      <div class="actions-row">
        <button class="btn-cancel" mat-dialog-close [disabled]="submitting()">Cancelar</button>
        <button
          class="btn-confirm"
          (click)="submit()"
          [disabled]="submitting() || confirmedParticipants.length === 0">
          @if (submitting()) {
            <span class="btn-spin"></span>
          } @else {
            ★
          }
          Enviar valoraciones
        </button>
      </div>
    </mat-dialog-actions>
  `,
})
export class RateParticipantsDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<RateParticipantsDialogComponent>);
  readonly data    = inject<RateParticipantsDialogData>(MAT_DIALOG_DATA);
  private readonly authSvc   = inject(AuthService);
  private readonly ratingSvc = inject(RatingService);
  private readonly snackBar  = inject(MatSnackBar);

  readonly submitting = signal(false);

  private ratingsMap: Record<number, ParticipantRating> = {};
  confirmedParticipants: ParticipanteResponse[] = [];

  ngOnInit(): void {
    const userId = this.authSvc.currentUser()?.id;
    this.confirmedParticipants = this.data.meetup.participantes.filter(
      p => p.estadoAsistencia === 'CONFIRMADO' && p.idUsuario !== userId
    );
    for (const p of this.confirmedParticipants) {
      this.ratingsMap[p.idUsuario] = { nivel: 3, deportividad: 3 };
    }
  }

  getNivel(id: number): number          { return this.ratingsMap[id]?.nivel       ?? 3; }
  getDeportividad(id: number): number   { return this.ratingsMap[id]?.deportividad ?? 3; }
  setNivel(id: number, val: number): void       { this.ratingsMap[id] = { ...this.ratingsMap[id], nivel: val }; }
  setDeportividad(id: number, val: number): void { this.ratingsMap[id] = { ...this.ratingsMap[id], deportividad: val }; }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  }

  submit(): void {
    if (this.confirmedParticipants.length === 0) { this.dialogRef.close(); return; }
    this.submitting.set(true);
    const meetupId = this.data.meetup.id;

    const requests = this.confirmedParticipants.map(p =>
      this.ratingSvc.rate(meetupId, {
        idValorado:       p.idUsuario,
        nivelNota:        this.ratingsMap[p.idUsuario]?.nivel       ?? 3,
        deportividadNota: this.ratingsMap[p.idUsuario]?.deportividad ?? 3,
      }).pipe(catchError(() => of(null)))
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.snackBar.open('Valoraciones enviadas ✓', 'Cerrar', { duration: 3000 });
        this.submitting.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al enviar valoraciones', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
      },
    });
  }
}
