import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { SportService } from '../../core/services/sport.service';
import { DeporteResponse, DeporteRequest } from '../../core/models/sport.model';
import { ProblemDetail } from '../../core/models/problem-detail.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog.component';

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
  selector: 'app-sports',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  styles: [`
    :host { display: block; }

    .sports-page {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Page hero ──────────────────────────────────────────────────────── */
    .page-hero {
      background: var(--surface);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-xl);
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      position: relative;
      overflow: hidden;
    }
    .page-hero::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 220px; height: 220px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in oklch, var(--accent) 20%, transparent) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-text { position: relative; z-index: 1; }
    .page-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: var(--ink);
      margin: 0 0 4px;
      letter-spacing: -0.03em;
    }
    .page-subtitle {
      font-size: 13px;
      color: color-mix(in oklch, var(--ink) 50%, transparent);
      margin: 0;
    }

    /* ── Buttons ────────────────────────────────────────────────────────── */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--accent);
      color: var(--accent-ink);
      font-size: 14px;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: filter 120ms, transform 120ms;
      flex-shrink: 0;
      position: relative; z-index: 1;
      lucide-icon { width: 16px; height: 16px; }
      &:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: none;
      color: color-mix(in oklch, var(--ink) 70%, transparent);
      border: 1px solid var(--hairline);
      font-size: 14px;
      font-weight: 500;
      padding: 9px 16px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: inherit;
      transition: background 120ms, color 120ms;
      lucide-icon { width: 16px; height: 16px; }
      &:hover:not(:disabled) { background: var(--surface); color: var(--ink); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px; height: 34px;
      border-radius: var(--radius-md);
      background: none;
      border: 1px solid var(--hairline);
      color: color-mix(in oklch, var(--ink) 60%, transparent);
      cursor: pointer;
      transition: background 120ms, color 120ms;
      lucide-icon { width: 15px; height: 15px; }
      &:hover:not(:disabled) { background: var(--surface); color: var(--ink); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &.icon-btn-danger {
        color: var(--danger);
        border-color: color-mix(in oklch, var(--danger) 25%, transparent);
        &:hover:not(:disabled) { background: color-mix(in oklch, var(--danger) 10%, transparent); }
      }
    }

    /* ── Content card ───────────────────────────────────────────────────── */
    .content-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--hairline);
      overflow: hidden;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }
    .spinner {
      display: block;
      width: 40px; height: 40px;
      border: 3px solid var(--hairline);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Empty state ────────────────────────────────────────────────────── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px 16px;
      text-align: center;
    }
    .empty-icon {
      width: 64px; height: 64px;
      border-radius: var(--radius-xl);
      background: color-mix(in oklch, var(--accent) 12%, transparent);
      display: flex; align-items: center; justify-content: center;
      lucide-icon { width: 32px; height: 32px; color: var(--accent); }
    }
    .empty-state p {
      font-size: 14px;
      color: color-mix(in oklch, var(--ink) 45%, transparent);
      margin: 0;
    }

    /* ── Sports list ────────────────────────────────────────────────────── */
    .sports-list { display: flex; flex-direction: column; }
    .sport-row {
      display: flex;
      align-items: center;
      padding: 14px 24px;
      gap: 14px;
      border-bottom: 1px solid var(--hairline);
      transition: background var(--t-fast);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg); }
    }
    .sport-row-icon {
      width: 40px; height: 40px;
      border-radius: var(--radius-md);
      background: color-mix(in oklch, var(--accent) 14%, transparent);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      lucide-icon { width: 20px; height: 20px; color: var(--accent); }
    }
    .sport-info { flex: 1; min-width: 0; }
    .sport-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--ink);
      margin: 0 0 3px;
    }
    .sport-meta {
      font-size: 12px;
      color: color-mix(in oklch, var(--ink) 50%, transparent);
      margin: 0 0 2px;
      display: flex; align-items: center; gap: 5px;
      lucide-icon { width: 13px; height: 13px; }
    }
    .sport-desc {
      font-size: 12px;
      color: color-mix(in oklch, var(--ink) 45%, transparent);
      margin: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 400px;
    }
    .sport-actions { display: flex; gap: 4px; flex-shrink: 0; }

    /* ── Inline add/edit form ───────────────────────────────────────────── */
    .edit-form {
      padding: 16px 24px;
      background: color-mix(in oklch, var(--accent) 5%, transparent);
      border-bottom: 1px solid var(--hairline);
    }
    .edit-form-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 12px;
    }
    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
    }
    .field-name    { flex: 2 1 200px; }
    .field-players { flex: 1 1 120px; }
    .field-desc    { width: 100%; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }

    @media (max-width: 600px) {
      .sports-page { gap: 14px; }
      .page-hero { padding: 20px; border-radius: var(--radius-lg); }
      .sport-row { padding: 12px 16px; }
      .sport-desc { max-width: 200px; }
      .btn-primary { width: 100%; justify-content: center; }
    }
  `],
  template: `
    <div class="sports-page">

      <!-- Hero -->
      <div class="page-hero">
        <div class="hero-text">
          <h1 class="page-title">Deportes</h1>
          <p class="page-subtitle">Catálogo de deportes disponibles en la plataforma</p>
        </div>
        @if (isAdmin()) {
          <button class="btn-primary" (click)="openAddForm()">
            <lucide-icon name="plus"></lucide-icon>
            Añadir deporte
          </button>
        }
      </div>

      <!-- Inline add form -->
      @if (showAddForm()) {
        <div class="content-card">
          <div class="edit-form">
            <p class="edit-form-title">Nuevo deporte</p>
            <form [formGroup]="sportForm" (ngSubmit)="submitAdd()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="field-name">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="nombre" />
                  @if (sportForm.get('nombre')?.hasError('required') && sportForm.get('nombre')?.touched) {
                    <mat-error>El nombre es obligatorio</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline" class="field-players">
                  <mat-label>Jugadores por defecto</mat-label>
                  <input matInput type="number" formControlName="jugadoresDefault" min="1" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="field-desc">
                  <mat-label>Descripción (opcional)</mat-label>
                  <textarea matInput formControlName="descripcion" rows="2"></textarea>
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button class="btn-ghost" type="button" (click)="cancelForm()" [disabled]="saving()">Cancelar</button>
                <button class="btn-primary" type="submit" [disabled]="saving()">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="content-card">
          <div class="loading-container">
            <span class="spinner"></span>
          </div>
        </div>
      } @else if (sports().length === 0) {
        <div class="content-card">
          <div class="empty-state">
            <div class="empty-icon">
              <lucide-icon name="trophy"></lucide-icon>
            </div>
            <p>No hay deportes registrados todavía</p>
          </div>
        </div>
      } @else {
        <div class="content-card">
          <div class="sports-list">
            @for (sport of sports(); track sport.id) {
              @if (editingId() === sport.id) {
                <div class="edit-form">
                  <p class="edit-form-title">Editar — {{ sport.nombre }}</p>
                  <form [formGroup]="sportForm" (ngSubmit)="submitEdit(sport.id)">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="field-name">
                        <mat-label>Nombre</mat-label>
                        <input matInput formControlName="nombre" />
                        @if (sportForm.get('nombre')?.hasError('required') && sportForm.get('nombre')?.touched) {
                          <mat-error>El nombre es obligatorio</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="field-players">
                        <mat-label>Jugadores por defecto</mat-label>
                        <input matInput type="number" formControlName="jugadoresDefault" min="1" />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="field-desc">
                        <mat-label>Descripción (opcional)</mat-label>
                        <textarea matInput formControlName="descripcion" rows="2"></textarea>
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button class="btn-ghost" type="button" (click)="cancelForm()" [disabled]="saving()">Cancelar</button>
                      <button class="btn-primary" type="submit" [disabled]="saving()">Guardar</button>
                    </div>
                  </form>
                </div>
              } @else {
                <div class="sport-row">
                  <div class="sport-row-icon">
                    <lucide-icon [name]="getSportIcon(sport.nombre)"></lucide-icon>
                  </div>
                  <div class="sport-info">
                    <p class="sport-name">{{ sport.nombre }}</p>
                    <p class="sport-meta">
                      <lucide-icon name="users" [size]="13"></lucide-icon>
                      {{ sport.jugadoresDefault }} jugadores por defecto
                    </p>
                    @if (sport.descripcion) {
                      <p class="sport-desc">{{ sport.descripcion }}</p>
                    }
                  </div>
                  @if (isAdmin()) {
                    <div class="sport-actions">
                      <button class="icon-btn" matTooltip="Editar"
                        (click)="openEditForm(sport)" [disabled]="saving()">
                        <lucide-icon name="pencil"></lucide-icon>
                      </button>
                      <button class="icon-btn icon-btn-danger" matTooltip="Eliminar"
                        (click)="deleteSport(sport)" [disabled]="saving()">
                        <lucide-icon name="trash-2"></lucide-icon>
                      </button>
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SportsComponent implements OnInit {
  private readonly authSvc  = inject(AuthService);
  private readonly sportSvc = inject(SportService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog   = inject(MatDialog);
  private readonly fb       = inject(FormBuilder);

  readonly loading     = signal(false);
  readonly saving      = signal(false);
  readonly sports      = signal<DeporteResponse[]>([]);
  readonly showAddForm = signal(false);
  readonly editingId   = signal<number | null>(null);

  readonly isAdmin = computed(() => this.authSvc.currentUser()?.rol === 'ADMIN');

  readonly sportForm = this.fb.group({
    nombre:           ['', [Validators.required, Validators.maxLength(100)]],
    jugadoresDefault: [2,  [Validators.required, Validators.min(1), Validators.max(100)]],
    descripcion:      [''],
  });

  getSportIcon(name: string): string { return sportIcon(name); }

  ngOnInit(): void { this.loadSports(); }

  private loadSports(): void {
    this.loading.set(true);
    this.sportSvc.listAll().subscribe({
      next: list => { this.sports.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAddForm(): void {
    this.editingId.set(null);
    this.sportForm.reset({ nombre: '', jugadoresDefault: 2, descripcion: '' });
    this.showAddForm.set(true);
  }

  openEditForm(sport: DeporteResponse): void {
    this.showAddForm.set(false);
    this.sportForm.reset({
      nombre: sport.nombre,
      jugadoresDefault: sport.jugadoresDefault,
      descripcion: sport.descripcion ?? '',
    });
    this.editingId.set(sport.id);
  }

  cancelForm(): void {
    this.showAddForm.set(false);
    this.editingId.set(null);
    this.sportForm.reset();
  }

  submitAdd(): void {
    if (this.sportForm.invalid) { this.sportForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.sportForm.value;
    const body: DeporteRequest = {
      nombre: v.nombre!,
      jugadoresDefault: v.jugadoresDefault!,
      ...(v.descripcion ? { descripcion: v.descripcion } : {}),
    };
    this.sportSvc.create(body).subscribe({
      next: created => {
        this.sports.update(list => [...list, created]);
        this.snackBar.open('Deporte creado ✓', 'Cerrar', { duration: 2500 });
        this.showAddForm.set(false);
        this.sportForm.reset();
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al crear el deporte', 'Cerrar', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  submitEdit(id: number): void {
    if (this.sportForm.invalid) { this.sportForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.sportForm.value;
    this.sportSvc.update(id, {
      nombre: v.nombre ?? undefined,
      jugadoresDefault: v.jugadoresDefault ?? undefined,
      descripcion: v.descripcion || undefined,
    }).subscribe({
      next: updated => {
        this.sports.update(list => list.map(s => s.id === id ? updated : s));
        this.snackBar.open('Deporte actualizado ✓', 'Cerrar', { duration: 2500 });
        this.editingId.set(null);
        this.sportForm.reset();
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al actualizar el deporte', 'Cerrar', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  deleteSport(sport: DeporteResponse): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Eliminar deporte',
          message: `¿Seguro que quieres eliminar "${sport.nombre}"? Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
          confirmColor: 'warn',
        },
        width: '380px',
      }
    );
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.saving.set(true);
      this.sportSvc.delete(sport.id).subscribe({
        next: () => {
          this.sports.update(list => list.filter(s => s.id !== sport.id));
          this.snackBar.open('Deporte eliminado', 'Cerrar', { duration: 2500 });
          this.saving.set(false);
        },
        error: (err: HttpErrorResponse) => {
          const pd = err.error as ProblemDetail;
          this.snackBar.open(pd?.detail ?? 'Error al eliminar el deporte', 'Cerrar', { duration: 4000 });
          this.saving.set(false);
        },
      });
    });
  }
}
