import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { UserService } from '../../../core/services/user.service';
import { UsuarioPublicResponse } from '../../../core/models/user.model';

const NIVEL_LABELS = ['', 'Principiante', 'Amateur', 'Intermedio', 'Avanzado', 'Experto'];

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  styles: [`
    .profile-page {
      padding: 24px;
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: apex-fade-up 0.3s ease both;
    }

    /* Back */
    .back-btn {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--ink-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px 4px;
      border-radius: var(--radius-sm);
      transition: color 120ms ease;
    }
    .back-btn:hover { color: var(--ink); }
    .back-arrow { font-size: 17px; }

    /* States */
    .loading-container { display: flex; justify-content: center; padding: 64px 0; }
    .spinner {
      display: inline-block;
      width: 44px; height: 44px;
      border: 3px solid color-mix(in oklch, var(--accent) 30%, transparent);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 64px 16px;
      color: var(--ink-muted);
      text-align: center;
    }
    .error-icon { font-size: 48px; }

    /* Header */
    .user-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 24px;
      background: var(--surface);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-lg);
    }
    .user-avatar {
      flex-shrink: 0;
      width: 72px; height: 72px;
      border-radius: 50%;
      background: color-mix(in oklch, var(--accent) 25%, var(--surface-2));
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials { color: var(--accent); font-size: 26px; font-weight: 700; }
    .user-info { flex: 1; min-width: 0; }
    .user-name { font-size: 1.4rem; font-weight: 700; color: var(--ink); margin: 0 0 2px; }
    .user-since {
      font-size: 13px;
      color: var(--ink-muted);
      margin: 0 0 14px;
    }
    .fiabilidad-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .fiabilidad-label { font-size: 13px; color: var(--ink-muted); }
    .fiabilidad-score {
      font-size: 14px; font-weight: 700;
      min-width: 44px;
    }
    .score-green { color: oklch(0.60 0.16 145); }
    .score-amber { color: oklch(0.60 0.13 75); }
    .score-red   { color: var(--danger); }
    .score-bar-track {
      flex: 1; min-width: 100px; max-width: 160px;
      height: 8px;
      background: var(--bg-2);
      border-radius: 4px;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .score-bar-fill.score-green { background: oklch(0.73 0.17 145); }
    .score-bar-fill.score-amber { background: oklch(0.78 0.15 75); }
    .score-bar-fill.score-red   { background: var(--danger); }

    /* Sports card */
    .sports-card {
      background: var(--surface);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
    }
    .section-title {
      font-size: 1rem; font-weight: 700;
      color: var(--ink);
      margin: 0 0 16px;
    }
    .sports-list { display: flex; flex-direction: column; }
    .sport-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--hairline);
    }
    .sport-row:last-child { border-bottom: none; }
    .sport-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .sport-name { font-weight: 600; font-size: 15px; color: var(--ink); }
    .sport-stars { font-size: 15px; letter-spacing: 1px; color: oklch(0.78 0.15 75); }
    .sport-level { font-size: 13px; color: var(--ink-muted); }
    .sport-role  { font-size: 13px; color: var(--ink-muted); font-style: italic; }
    .empty-sports {
      padding: 32px 0;
      text-align: center;
      color: var(--ink-muted);
      font-size: 14px;
    }

    @media (max-width: 600px) {
      .profile-page { padding: 12px; }
      .user-header { flex-direction: column; align-items: center; text-align: center; padding: 16px; }
    }
  `],
  template: `
    <div class="profile-page">
      <button class="back-btn" (click)="goBack()">
        <span class="back-arrow">←</span>
        Volver
      </button>

      @if (loading()) {
        <div class="loading-container">
          <span class="spinner"></span>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">👤</span>
          <p>Usuario no encontrado</p>
          <button class="back-btn" (click)="goBack()">Volver</button>
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
              Miembro desde {{ user()!.fechaRegistro | date:'MMMM yyyy':'':'es-ES' }}
            </p>
            <div class="fiabilidad-row">
              <span class="fiabilidad-label">Fiabilidad:</span>
              <span class="fiabilidad-score" [class]="scoreClass()">
                {{ user()!.fiabilidadScore | number:'1.0-0' }}%
              </span>
              <div class="score-bar-track">
                <div
                  class="score-bar-fill"
                  [class]="scoreClass()"
                  [style.width.%]="user()!.fiabilidadScore">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sports -->
        <div class="sports-card">
          <h2 class="section-title">Deportes</h2>
          @if (user()!.deportes.length === 0) {
            <p class="empty-sports">Este usuario no tiene deportes registrados</p>
          } @else {
            <div class="sports-list">
              @for (s of user()!.deportes; track s.idDeporte) {
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
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class UserProfileComponent implements OnChanges {
  @Input() id!: string;

  private readonly userSvc = inject(UserService);
  private readonly router  = inject(Router);

  readonly loading = signal(false);
  readonly error   = signal(false);
  readonly user    = signal<UsuarioPublicResponse | null>(null);

  ngOnChanges(): void {
    const numId = parseInt(this.id, 10);
    if (!numId) return;
    this.loading.set(true);
    this.error.set(false);
    this.userSvc.getPublicProfile(numId).subscribe({
      next:  u => { this.user.set(u); this.loading.set(false); },
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
