import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProblemDetail } from '../../../core/models/problem-detail.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    LucideAngularModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar    = inject(MatSnackBar);

  loading = false;
  sent    = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.authService.forgotPassword({ email: this.form.getRawValue().email! }).subscribe({
      next: () => {
        this.loading = false;
        this.sent    = true;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const body = err.error as ProblemDetail;
        this.snackBar.open(
          body?.detail ?? 'Ha ocurrido un error. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 5000 }
        );
      },
    });
  }
}
