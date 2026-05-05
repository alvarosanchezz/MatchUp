import { Component, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { DeporteResponse } from '../../../core/models/sport.model';
import { UsuarioPreferenciaRequest } from '../../../core/models/user.model';

export interface AddSportDialogData {
  allSports: DeporteResponse[];
  existingIds: number[];
}

const NIVEL_LABELS = ['', 'Principiante', 'Amateur', 'Intermedio', 'Avanzado', 'Experto'];

@Component({
  selector: 'app-add-sport-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
  ],
  template: `
    <h2 mat-dialog-title>Añadir deporte</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field class="full">
          <mat-label>Deporte *</mat-label>
          <mat-select formControlName="idDeporte">
            @for (s of availableSports; track s.id) {
              <mat-option [value]="s.id">{{ s.nombre }}</mat-option>
            }
            @if (availableSports.length === 0) {
              <mat-option disabled>Ya tienes todos los deportes añadidos</mat-option>
            }
          </mat-select>
          @if (form.get('idDeporte')?.hasError('required') && form.get('idDeporte')?.touched) {
            <mat-error>Selecciona un deporte</mat-error>
          }
        </mat-form-field>

        <div class="nivel-row">
          <span class="nivel-label">Nivel: <strong>{{ nivelLabel() }}</strong></span>
          <mat-slider min="1" max="5" step="1" discrete class="nivel-slider">
            <input matSliderThumb formControlName="nivel" />
          </mat-slider>
          <div class="nivel-stars">{{ nivelStars() }}</div>
        </div>

        <mat-form-field class="full">
          <mat-label>Rol preferido (opcional)</mat-label>
          <input matInput formControlName="rolPreferido" placeholder="Ej: Portero, Alero, Defensa…" maxlength="100" />
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        Añadir
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 12px; min-width: 320px; padding-top: 8px; }
    .full { width: 100%; }
    .nivel-row { display: flex; flex-direction: column; gap: 4px; }
    .nivel-label { font-size: 14px; color: rgba(0,0,0,.7); }
    .nivel-slider { width: 100%; }
    .nivel-stars { font-size: 20px; letter-spacing: 2px; color: #f59e0b; }
  `],
})
export class AddSportDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddSportDialogComponent>);
  readonly data = inject<AddSportDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    idDeporte: [null as number | null, Validators.required],
    nivel: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    rolPreferido: [''],
  });

  get availableSports(): DeporteResponse[] {
    return this.data.allSports.filter(s => !this.data.existingIds.includes(s.id));
  }

  nivelLabel = computed(() => {
    const n = this.form.get('nivel')?.value ?? 3;
    return NIVEL_LABELS[n] ?? '';
  });

  nivelStars = computed(() => {
    const n = this.form.get('nivel')?.value ?? 3;
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const result: UsuarioPreferenciaRequest = {
      idDeporte: v.idDeporte!,
      nivel: v.nivel!,
      rolPreferido: v.rolPreferido || undefined,
    };
    this.dialogRef.close(result);
  }
}
