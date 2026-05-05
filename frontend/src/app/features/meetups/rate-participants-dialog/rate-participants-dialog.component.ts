import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
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
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  styles: [`
    .dialog-content {
      padding: 8px 0 16px;
      max-height: 70vh;
      overflow-y: auto;
    }
    .participant-block {
      padding: 16px 0;
    }
    .participant-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #6750a4;
      color: white;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .participant-name { font-weight: 600; font-size: 15px; }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .rating-label {
      font-size: 13px;
      color: rgba(0,0,0,0.65);
      min-width: 130px;
    }
    mat-button-toggle-group {
      border-radius: 8px;
    }
    .empty-msg {
      padding: 16px 0;
      color: rgba(0,0,0,0.5);
      text-align: center;
    }
    .actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      align-items: center;
    }
    .btn-spinner { display: inline-block; margin-right: 6px; vertical-align: middle; }
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
            <span class="rating-label">
              <mat-icon style="font-size:16px;width:16px;height:16px;vertical-align:middle">fitness_center</mat-icon>
              Nivel (habilidad):
            </span>
            <mat-button-toggle-group
              [value]="getNivel(p.idUsuario)"
              (change)="setNivel(p.idUsuario, $event.value)">
              @for (n of [1,2,3,4,5]; track n) {
                <mat-button-toggle [value]="n">{{ n }}★</mat-button-toggle>
              }
            </mat-button-toggle-group>
          </div>

          <!-- Deportividad -->
          <div class="rating-row">
            <span class="rating-label">
              <mat-icon style="font-size:16px;width:16px;height:16px;vertical-align:middle">handshake</mat-icon>
              Deportividad:
            </span>
            <mat-button-toggle-group
              [value]="getDeportividad(p.idUsuario)"
              (change)="setDeportividad(p.idUsuario, $event.value)">
              @for (n of [1,2,3,4,5]; track n) {
                <mat-button-toggle [value]="n">{{ n }}★</mat-button-toggle>
              }
            </mat-button-toggle-group>
          </div>
        </div>

        @if (!last) { <mat-divider /> }
      }
    </div>

    <mat-dialog-actions>
      <div class="actions-row" style="width:100%">
        <button mat-button mat-dialog-close [disabled]="submitting()">Cancelar</button>
        <button
          mat-raised-button
          color="primary"
          (click)="submit()"
          [disabled]="submitting() || confirmedParticipants.length === 0">
          @if (submitting()) {
            <mat-spinner diameter="18" class="btn-spinner" />
          } @else {
            <mat-icon>star</mat-icon>
          }
          Enviar valoraciones
        </button>
      </div>
    </mat-dialog-actions>
  `,
})
export class RateParticipantsDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<RateParticipantsDialogComponent>);
  readonly data = inject<RateParticipantsDialogData>(MAT_DIALOG_DATA);
  private readonly authSvc = inject(AuthService);
  private readonly ratingSvc = inject(RatingService);
  private readonly snackBar = inject(MatSnackBar);

  readonly submitting = signal(false);

  // Rating state: Map<idUsuario → {nivel, deportividad}>
  private ratingsMap: Record<number, ParticipantRating> = {};

  // Participants confirmed (excluding current user)
  confirmedParticipants: ParticipanteResponse[] = [];

  ngOnInit(): void {
    const userId = this.authSvc.currentUser()?.id;
    this.confirmedParticipants = this.data.meetup.participantes.filter(
      p => p.estadoAsistencia === 'CONFIRMADO' && p.idUsuario !== userId
    );

    // Init with default rating of 3 for all
    for (const p of this.confirmedParticipants) {
      this.ratingsMap[p.idUsuario] = { nivel: 3, deportividad: 3 };
    }
  }

  // ── Getters / setters ─────────────────────────────────────────────────
  getNivel(id: number): number {
    return this.ratingsMap[id]?.nivel ?? 3;
  }

  getDeportividad(id: number): number {
    return this.ratingsMap[id]?.deportividad ?? 3;
  }

  setNivel(id: number, val: number): void {
    this.ratingsMap[id] = { ...this.ratingsMap[id], nivel: val };
  }

  setDeportividad(id: number, val: number): void {
    this.ratingsMap[id] = { ...this.ratingsMap[id], deportividad: val };
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  }

  // ── Submit ────────────────────────────────────────────────────────────
  submit(): void {
    if (this.confirmedParticipants.length === 0) {
      this.dialogRef.close();
      return;
    }

    this.submitting.set(true);
    const meetupId = this.data.meetup.id;

    const requests = this.confirmedParticipants.map(p =>
      this.ratingSvc
        .rate(meetupId, {
          idValorado: p.idUsuario,
          nivelNota: this.ratingsMap[p.idUsuario]?.nivel ?? 3,
          deportividadNota: this.ratingsMap[p.idUsuario]?.deportividad ?? 3,
        })
        .pipe(
          catchError(err => {
            // 409 = ya valorado → ignorar silenciosamente
            if (err?.status === 409) return of(null);
            // Otros errores también los absorb­emos para no cortar el forkJoin
            return of(null);
          })
        )
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.snackBar.open('Valoraciones enviadas ✓', 'Cerrar', { duration: 3000 });
        this.submitting.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        // forkJoin no debería llegar aquí dado el catchError, pero por si acaso
        this.snackBar.open('Error al enviar valoraciones', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
      },
    });
  }
}
