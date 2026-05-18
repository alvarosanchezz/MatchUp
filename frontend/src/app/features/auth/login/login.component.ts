import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProblemDetail } from '../../../core/models/problem-detail.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    LucideAngularModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);
  private readonly snackBar    = inject(MatSnackBar);

  loading      = false;
  showPassword = false;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { email, password } = this.form.getRawValue();
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.authService.loadCurrentUser().subscribe({
          next:  () => this.navigateAfterAuth(),
          error: () => this.navigateAfterAuth(),
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.handleError(err);
      },
    });
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/meetups';
    this.router.navigateByUrl(returnUrl);
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
