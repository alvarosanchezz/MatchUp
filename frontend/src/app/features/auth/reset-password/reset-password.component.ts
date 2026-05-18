import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProblemDetail } from '../../../core/models/problem-detail.model';

const passwordMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw      = group.get('newPassword')?.value;
  const confirm = group.get('confirmarPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    LucideAngularModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly snackBar    = inject(MatSnackBar);

  loading      = false;
  showPassword = false;
  showConfirm  = false;
  tokenMissing = false;

  form = this.fb.group(
    {
      newPassword:       ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmarPassword: ['', Validators.required],
    },
    { validators: passwordMatch }
  );

  ngOnInit(): void {
    if (!this.route.snapshot.queryParamMap.get('token')) {
      this.tokenMissing = true;
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const token = this.route.snapshot.queryParamMap.get('token')!;
    const { newPassword } = this.form.getRawValue();
    this.loading = true;
    this.authService.resetPassword({ token, newPassword: newPassword! }).subscribe({
      next: () => {
        this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/auth/login']);
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
