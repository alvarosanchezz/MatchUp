import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'warn' | 'accent';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule],
  styles: [`
    .dlg-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 0 0;
    }
    .btn-cancel {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 8px 16px;
      background: transparent;
      color: var(--ink-muted);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      font-size: 14px; font-weight: 500;
      font-family: 'Inter', system-ui, sans-serif;
      cursor: pointer;
      transition: background var(--t-fast), color var(--t-fast);
    }
    .btn-cancel:hover { background: var(--bg-2); color: var(--ink); }
    .btn-confirm {
      display: inline-flex; align-items: center; gap: 5px;
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
    .btn-confirm:hover { opacity: 0.88; }
    .btn-confirm.is-danger {
      background: var(--danger);
      color: white;
    }
  `],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions>
      <div class="dlg-actions">
        <button class="btn-cancel" mat-dialog-close>Cancelar</button>
        <button
          [class]="'btn-confirm' + (data.confirmColor === 'warn' ? ' is-danger' : '')"
          [mat-dialog-close]="true">
          {{ data.confirmLabel ?? 'Confirmar' }}
        </button>
      </div>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
