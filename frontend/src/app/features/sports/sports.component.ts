import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { SportService } from '../../core/services/sport.service';
import { DeporteResponse, DeporteRequest } from '../../core/models/sport.model';
import { ProblemDetail } from '../../core/models/problem-detail.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
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
      animation: apex-fade-up 0.3s ease both;
    }
    /* Page hero */
    .page-hero {
      background: linear-gradient(135deg, #0f0c29 0%, #1e1b4b 50%, #0a1628 100%);
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
      top: -50px; right: -50px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,102,204,0.2) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-text { position: relative; z-index: 1; }
    .page-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: white;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }
    .page-subtitle {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      margin: 0;
    }
    .new-btn {
      flex-shrink: 0;
      background: white !important;
      color: var(--apex-ink) !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25) !important;
      position: relative; z-index: 1;
    }
    /* Content card */
    .content-card {
      background: var(--apex-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--apex-ink-10);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }
    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px 16px;
      text-align: center;
    }
    .empty-icon-wrap {
      width: 72px; height: 72px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--apex-blue-light), #E0EDFF);
      display: flex; align-items: center; justify-content: center;
    }
    .empty-icon-wrap mat-icon {
      font-size: 36px; width: 36px; height: 36px;
      color: var(--apex-blue);
    }
    .empty-state p {
      font-size: 14px;
      color: var(--apex-ink-40);
      margin: 0;
    }
    /* Sports list */
    .sports-list { display: flex; flex-direction: column; }
    .sport-row {
      display: flex;
      align-items: center;
      padding: 14px 24px;
      gap: 14px;
      border-bottom: 1px solid var(--apex-ink-10);
      transition: background 0.15s;
    }
    .sport-row:last-child { border-bottom: none; }
    .sport-row:hover { background: var(--apex-bg); }
    .sport-row-icon {
      width: 38px; height: 38px;
      border-radius: var(--radius-md);
      background: #FFF3E0;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sport-row-icon mat-icon {
      color: #E65100; font-size: 18px; width: 18px; height: 18px;
    }
    .sport-info { flex: 1; min-width: 0; }
    .sport-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--apex-ink);
      margin: 0 0 3px;
    }
    .sport-meta {
      font-size: 12px;
      color: var(--apex-ink-40);
      margin: 0 0 2px;
      display: flex; align-items: center; gap: 4px;
    }
    .sport-desc {
      font-size: 12px;
      color: var(--apex-ink-40);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 400px;
    }
    .sport-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
    /* Inline add/edit form */
    .edit-form {
      padding: 16px 24px;
      background: var(--apex-blue-light);
      border-bottom: 1px solid var(--apex-ink-10);
    }
    .edit-form-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--apex-ink);
      margin: 0 0 12px;
    }
    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
    }
    .field-name { flex: 2 1 200px; }
    .field-players { flex: 1 1 120px; }
    .field-desc { width: 100%; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 4px;
    }
    @media (max-width: 600px) {
      .sports-page { gap: 14px; }
      .page-hero { padding: 20px 20px; border-radius: var(--radius-lg); }
      .sport-row { padding: 12px 16px; }
      .sport-desc { max-width: 200px; }
      .new-btn { width: 100%; justify-content: center; }
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
          <button mat-raised-button class="new-btn" (click)="openAddForm()">
            <mat-icon>add</mat-icon>
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
                <button mat-button type="button" (click)="cancelForm()" [disabled]="saving()">Cancelar</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                  @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px;vertical-align:middle" /> }
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="content-card">
          <div class="loading-container">
            <mat-spinner diameter="44" />
          </div>
        </div>
      } @else if (sports().length === 0) {
        <div class="content-card">
          <div class="empty-state">
            <div class="empty-icon-wrap">
              <mat-icon>sports</mat-icon>
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
                      <button mat-button type="button" (click)="cancelForm()" [disabled]="saving()">Cancelar</button>
                      <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                        @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px;vertical-align:middle" /> }
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              } @else {
                <div class="sport-row">
                  <div class="sport-row-icon">
                    <mat-icon>sports</mat-icon>
                  </div>
                  <div class="sport-info">
                    <p class="sport-name">{{ sport.nombre }}</p>
                    <p class="sport-meta">
                      <mat-icon style="font-size:13px;width:13px;height:13px">group</mat-icon>
                      {{ sport.jugadoresDefault }} jugadores por defecto
                    </p>
                    @if (sport.descripcion) {
                      <p class="sport-desc">{{ sport.descripcion }}</p>
                    }
                  </div>
                  @if (isAdmin()) {
                    <div class="sport-actions">
                      <button mat-icon-button matTooltip="Editar"
                        (click)="openEditForm(sport)" [disabled]="saving()">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Eliminar"
                        (click)="deleteSport(sport)" [disabled]="saving()">
                        <mat-icon>delete_outline</mat-icon>
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
  private readonly authSvc = inject(AuthService);
  private readonly sportSvc = inject(SportService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly sports = signal<DeporteResponse[]>([]);
  readonly showAddForm = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly isAdmin = computed(() => this.authSvc.currentUser()?.rol === 'ADMIN');

  readonly sportForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    jugadoresDefault: [2, [Validators.required, Validators.min(1), Validators.max(100)]],
    descripcion: [''],
  });

  ngOnInit(): void {
    this.loadSports();
  }

  private loadSports(): void {
    this.loading.set(true);
    this.sportSvc.listAll().subscribe({
      next: list => { this.sports.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Form controls ─────────────────────────────────────────────────────────
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

  // ── Submit add ────────────────────────────────────────────────────────────
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

  // ── Submit edit ───────────────────────────────────────────────────────────
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

  // ── Delete ────────────────────────────────────────────────────────────────
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
