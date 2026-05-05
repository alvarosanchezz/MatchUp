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
    .sports-page {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 64px 16px;
      color: rgba(0,0,0,0.45);
      text-align: center;
    }
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }
    .sports-list {
      display: flex;
      flex-direction: column;
    }
    .sport-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      gap: 12px;
    }
    .sport-info {
      flex: 1;
      min-width: 0;
    }
    .sport-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 2px;
    }
    .sport-meta {
      font-size: 13px;
      color: rgba(0,0,0,0.55);
      margin: 0 0 2px;
    }
    .sport-desc {
      font-size: 13px;
      color: rgba(0,0,0,0.45);
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
      padding: 16px;
      background: rgba(103,80,164,0.04);
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .edit-form-title {
      font-size: 15px;
      font-weight: 600;
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
      margin-top: 8px;
    }
    @media (max-width: 600px) {
      .sports-page { padding: 12px; }
      .page-title { font-size: 1.3rem; }
      .sport-desc { max-width: 200px; }
    }
  `],
  template: `
    <div class="sports-page">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Deportes</h1>
        @if (isAdmin()) {
          <button mat-raised-button color="primary" (click)="openAddForm()">
            <mat-icon>add</mat-icon>
            Añadir deporte
          </button>
        }
      </div>

      <!-- Inline add form -->
      @if (showAddForm()) {
        <div class="edit-form">
          <p class="edit-form-title">Nuevo deporte</p>
          <form [formGroup]="sportForm" (ngSubmit)="submitAdd()">
            <div class="form-row">
              <mat-form-field class="field-name">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" />
                @if (sportForm.get('nombre')?.hasError('required') && sportForm.get('nombre')?.touched) {
                  <mat-error>El nombre es obligatorio</mat-error>
                }
              </mat-form-field>
              <mat-form-field class="field-players">
                <mat-label>Jugadores por defecto</mat-label>
                <input matInput type="number" formControlName="jugadoresDefault" min="1" />
                @if (sportForm.get('jugadoresDefault')?.hasError('required') && sportForm.get('jugadoresDefault')?.touched) {
                  <mat-error>Campo obligatorio</mat-error>
                }
              </mat-form-field>
              <mat-form-field class="field-desc">
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
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48" />
        </div>
      } @else if (sports().length === 0) {
        <div class="empty-state">
          <mat-icon>sports</mat-icon>
          <p>No hay deportes registrados todavía</p>
        </div>
      } @else {
        <mat-card>
          <div class="sports-list">
            @for (sport of sports(); track sport.id; let last = $last) {
              <!-- Inline edit form -->
              @if (editingId() === sport.id) {
                <div class="edit-form" style="margin:8px 16px">
                  <p class="edit-form-title">Editar — {{ sport.nombre }}</p>
                  <form [formGroup]="sportForm" (ngSubmit)="submitEdit(sport.id)">
                    <div class="form-row">
                      <mat-form-field class="field-name">
                        <mat-label>Nombre</mat-label>
                        <input matInput formControlName="nombre" />
                        @if (sportForm.get('nombre')?.hasError('required') && sportForm.get('nombre')?.touched) {
                          <mat-error>El nombre es obligatorio</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field class="field-players">
                        <mat-label>Jugadores por defecto</mat-label>
                        <input matInput type="number" formControlName="jugadoresDefault" min="1" />
                      </mat-form-field>
                      <mat-form-field class="field-desc">
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
                  <div class="sport-info">
                    <p class="sport-name">{{ sport.nombre }}</p>
                    <p class="sport-meta">
                      <mat-icon style="font-size:14px;width:14px;height:14px;vertical-align:middle">group</mat-icon>
                      {{ sport.jugadoresDefault }} jugadores por defecto
                    </p>
                    @if (sport.descripcion) {
                      <p class="sport-desc">{{ sport.descripcion }}</p>
                    }
                  </div>
                  @if (isAdmin()) {
                    <div class="sport-actions">
                      <button mat-icon-button
                        matTooltip="Editar"
                        (click)="openEditForm(sport)"
                        [disabled]="saving()">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn"
                        matTooltip="Eliminar"
                        (click)="deleteSport(sport)"
                        [disabled]="saving()">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }
              @if (!last) { <mat-divider /> }
            }
          </div>
        </mat-card>
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
