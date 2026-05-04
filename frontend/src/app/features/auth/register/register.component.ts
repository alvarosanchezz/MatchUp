import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ProblemDetail } from '../../../core/models/problem-detail.model';

const passwordMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmarPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  loading = false;
  showPassword = false;
  showConfirm = false;

  form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmarPassword: ['', Validators.required],
    },
    { validators: passwordMatch }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { nombre, email, password } = this.form.getRawValue();

    this.authService.register({ nombre: nombre!, email: email!, password: password! }).subscribe({
      next: () => {
        this.authService.loadCurrentUser().subscribe({
          next: () => this.router.navigate(['/meetups']),
          error: () => this.router.navigate(['/meetups']),
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.handleError(err);
      },
    });
  }

  private handleError(err: HttpErrorResponse): void {
    const body = err.error as ProblemDetail;
    if (err.status === 400 && body?.errors?.length) {
      for (const e of body.errors) {
        this.form.get(e.field)?.setErrors({ serverError: e.message });
      }
    } else {
      this.snackBar.open(
        body?.detail ?? 'Ha ocurrido un error. Inténtalo de nuevo.',
        'Cerrar',
        { duration: 5000 }
      );
    }
  }
}
