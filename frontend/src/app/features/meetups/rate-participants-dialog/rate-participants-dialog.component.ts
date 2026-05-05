import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QuedadaDetailResponse } from '../../../core/models/meetup.model';

export interface RateParticipantsDialogData {
  meetup: QuedadaDetailResponse;
}

@Component({
  selector: 'app-rate-participants-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Valorar participantes</h2>
    <mat-dialog-content>
      <p style="color: rgba(0,0,0,0.6)">Sistema de valoración — próximamente en Bloque 6</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class RateParticipantsDialogComponent {
  readonly data = inject<RateParticipantsDialogData>(MAT_DIALOG_DATA);
}
