import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { UserService } from '../../../core/services/user.service';
import { UsuarioPublicResponse } from '../../../core/models/user.model';

const NIVEL_LABELS = ['', 'Principiante', 'Amateur', 'Intermedio', 'Avanzado', 'Experto'];

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
  ],
  styles: [`
    .profile-page {
      padding: 24px;
      max-width: 680px;
      margin: 0 auto;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 64px 16px;
      color: rgba(0,0,0,0.45);
      text-align: center;
    }
    .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }
    /* Header */
    .user-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 24px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
    .user-avatar {
      flex-shrink: 0;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #6750a4;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials { color: white; font-size: 26px; font-weight: 700; }
    .user-info { flex: 1; min-width: 0; }
    .user-name { font-size: 1.4rem; font-weight: 700; margin: 0 0 2px; }
    .user-since {
      font-size: 13px;
      color: rgba(0,0,0,0.5);
      margin: 0 0 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fiabilidad-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .fiabilidad-label { font-size: 13px; color: rgba(0,0,0,0.6); }
    .fiabilidad-score {
      font-size: 14px;
      font-weight: 700;
      min-width: 44px;
    }
    .score-green { color: #166534; }
    .score-amber { color: #9a3412; }
    .score-red   { color: #991b1b; }
    .score-bar-track {
      flex: 1;
      min-width: 100px;
      max-width: 160px;
      height: 8px;
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .score-bar-fill.score-green { background: #22c55e; }
    .score-bar-fill.score-amber { background: #f97316; }
    .score-bar-fill.score-red   { background: #ef4444; }
    /* Sports */
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 12px;
    }
    .sports-list { display: flex; flex-direction: column; }
    .sport-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 4px;
    }
    .sport-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .sport-name { font-weight: 600; font-size: 15px; }
    .sport-stars { font-size: 15px; letter-spacing: 1px; color: #f59e0b; }
    .sport-level { font-size: 13px; color: rgba(0,0,0,0.55); }
    .sport-role  { font-size: 13px; color: rgba(0,0,0,0.45); font-style: italic; }
    .empty-sports {
      padding: 32px 0;
      text-align: center;
      color: rgba(0,0,0,0.45);
      font-size: 14px;
    }
    /* Back button */
    .back-btn { margin-bottom: 16px; }
    @media (max-width: 600px) {
      .profile-page { padding: 12px; }
      .user-header { flex-direction: column; align-items: center; text-align: center; padding: 16px; }
    }
  `],
  template: `
    <div class="profile-page">
      <button mat-button class="back-btn" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Volver
      </button>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48" />
        </div>
      } @else if (error()) {
        <div class="error-state">
          <mat-icon>person_off</mat-icon>
          <p>Usuario no encontrado</p>
          <button mat-stroked-button (click)="goBack()">Volver</button>
        </div>
      } @else if (user()) {
        <!-- User header -->
        <div class="user-header">
          <div class="user-avatar">
            @if (user()!.urlFotoPerfil) {
              <img class="avatar-img" [src]="user()!.urlFotoPerfil!" [alt]="user()!.nombre" />
            } @else {
              <span class="avatar-initials">{{ initials(user()!.nombre) }}</span>
            }
          </div>
          <div class="user-info">
            <h1 class="user-name">{{ user()!.nombre }}</h1>
            <p class="user-since">
              <mat-icon style="font-size:14px;width:14px;height:14px">calendar_today</mat-icon>
              Miembro desde {{ user()!.fechaRegistro | date:'MMMM yyyy':'':'es-ES' }}
            </p>
            <div class="fiabilidad-row">
              <span class="fiabilidad-label">Fiabilidad:</span>
              <span class="fiabilidad-score" [class]="scoreClass()">
                {{ user()!.fiabilidadScore | number:'1.0-0' }}%
              </span>
              <div class="score-bar-track">
                <div class="score-bar-fill" [class]="scoreClass()"
                     [style.width.%]="user()!.fiabilidadScore">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sports -->
        <mat-card>
          <mat-card-content style="padding: 20px">
            <h2 class="section-title">Deportes</h2>
            @if (user()!.deportes.length === 0) {
              <p class="empty-sports">Este usuario no tiene deportes registrados</p>
            } @else {
              <div class="sports-list">
                @for (s of user()!.deportes; track s.idDeporte; let last = $last) {
                  <div class="sport-row">
                    <div class="sport-info">
                      <span class="sport-name">{{ s.nombreDeporte }}</span>
                      <span class="sport-stars">{{ nivelStars(s.nivel) }}</span>
                      <span class="sport-level">{{ nivelLabel(s.nivel) }}</span>
                      @if (s.rolPreferido) {
                        <span class="sport-role">· {{ s.rolPreferido }}</span>
                      }
                    </div>
                  </div>
                  @if (!last) { <mat-divider /> }
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class UserProfileComponent implements OnChanges {
  @Input() id!: string;

  private readonly userSvc = inject(UserService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal(false);
  readonly user = signal<UsuarioPublicResponse | null>(null);

  ngOnChanges(): void {
    const numId = parseInt(this.id, 10);
    if (!numId) return;
    this.loading.set(true);
    this.error.set(false);
    this.userSvc.getPublicProfile(numId).subscribe({
      next: u => { this.user.set(u); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  scoreClass(): string {
    const s = this.user()?.fiabilidadScore ?? 0;
    if (s > 80) return 'score-green';
    if (s >= 50) return 'score-amber';
    return 'score-red';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  }

  nivelLabel(nivel: number): string { return NIVEL_LABELS[nivel] ?? ''; }
  nivelStars(nivel: number): string { return '★'.repeat(nivel) + '☆'.repeat(5 - nivel); }

  goBack(): void { this.router.navigate(['/meetups']); }
}
