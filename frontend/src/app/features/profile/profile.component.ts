import {
  Component,
  OnInit,
  inject,
  signal,
  effect,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { UserService, MeetupRole } from '../../core/services/user.service';
import { SportService } from '../../core/services/sport.service';
import { UsuarioPreferenciaResponse, UsuarioPreferenciaRequest } from '../../core/models/user.model';
import { QuedadaSummaryResponse } from '../../core/models/meetup.model';
import { DeporteResponse } from '../../core/models/sport.model';
import { ProblemDetail } from '../../core/models/problem-detail.model';
import { MeetupCardComponent } from '../../shared/components/meetup-card.component';
import {
  AddSportDialogComponent,
  AddSportDialogData,
} from './add-sport-dialog/add-sport-dialog.component';

const NIVEL_LABELS = ['', 'Principiante', 'Amateur', 'Intermedio', 'Avanzado', 'Experto'];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
    LucideAngularModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTooltipModule,
    MeetupCardComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly authSvc  = inject(AuthService);
  private readonly userSvc  = inject(UserService);
  private readonly sportSvc = inject(SportService);
  private readonly router   = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog   = inject(MatDialog);
  private readonly fb       = inject(FormBuilder);

  // ── Exposed ────────────────────────────────────────────────────────────
  readonly currentUser = this.authSvc.currentUser;

  // ── Tab state ──────────────────────────────────────────────────────────
  readonly activeTab       = signal(0);
  readonly activeMeetupTab = signal(0);

  // ── Profile form ───────────────────────────────────────────────────────
  readonly profileForm = this.fb.group({
    nombre:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    urlFotoPerfil: ['', Validators.maxLength(500)],
  });
  readonly savingProfile = signal(false);
  readonly locationSet   = signal(false);
  private _lat: number | null = null;
  private _lon: number | null = null;

  // ── Sports ─────────────────────────────────────────────────────────────
  readonly sports      = signal<UsuarioPreferenciaResponse[]>([]);
  readonly allSports   = signal<DeporteResponse[]>([]);
  readonly savingSports = signal(false);

  // ── Meetups ────────────────────────────────────────────────────────────
  readonly myMeetups        = signal<QuedadaSummaryResponse[]>([]);
  readonly myMeetupsTotal   = signal(0);
  readonly myMeetupsPage    = signal(0);
  readonly myMeetupsLoading = signal(false);
  readonly myMeetupsPageSize = 20;
  private currentMeetupRole: MeetupRole = 'TODAS';
  private meetupsTabOpened = false;

  constructor() {
    effect(() => {
      const user = this.authSvc.currentUser();
      if (user) this.sports.set(user.deportes);
    });
  }

  ngOnInit(): void {
    const user = this.authSvc.currentUser();
    if (user) {
      this.profileForm.patchValue({ nombre: user.nombre, urlFotoPerfil: user.urlFotoPerfil ?? '' });
      if (user.ubicacionLatitud != null) {
        this._lat = user.ubicacionLatitud;
        this._lon = user.ubicacionLongitud;
        this.locationSet.set(true);
      }
    }
    this.sportSvc.listAll().subscribe({ next: s => this.allSports.set(s), error: () => {} });
  }

  // ── Tab navigation ─────────────────────────────────────────────────────
  setActiveTab(index: number): void {
    this.activeTab.set(index);
    this.onOuterTabChange(index);
  }

  setMeetupRoleTab(index: number): void {
    this.activeMeetupTab.set(index);
    this.onMeetupRoleTabChange(index);
  }

  onOuterTabChange(index: number): void {
    if (index === 2 && !this.meetupsTabOpened) {
      this.meetupsTabOpened = true;
      this.loadMyMeetups(0, 'ORGANIZADAS');
    }
  }

  onMeetupRoleTabChange(index: number): void {
    const roles: MeetupRole[] = ['ORGANIZADAS', 'APUNTADAS', 'TODAS'];
    this.loadMyMeetups(0, roles[index] ?? 'TODAS');
  }

  // ── Fiabilidad ─────────────────────────────────────────────────────────
  scoreClass(): string {
    const s = this.currentUser()?.fiabilidadScore ?? 0;
    if (s > 80) return 'score-green';
    if (s >= 50) return 'score-amber';
    return 'score-red';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  }

  // ── Location ───────────────────────────────────────────────────────────
  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.snackBar.open('Geolocalización no disponible', 'Cerrar', { duration: 3000 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this._lat = pos.coords.latitude;
        this._lon = pos.coords.longitude;
        this.locationSet.set(true);
        this.snackBar.open('Ubicación obtenida ✓', 'Cerrar', { duration: 2000 });
      },
      () => this.snackBar.open('No se pudo obtener la ubicación', 'Cerrar', { duration: 3000 })
    );
  }

  clearLocation(): void { this._lat = null; this._lon = null; this.locationSet.set(false); }

  coordsDisplay(): string {
    if (this._lat == null || this._lon == null) return '';
    return `${this._lat.toFixed(5)}, ${this._lon.toFixed(5)}`;
  }

  // ── Profile save ───────────────────────────────────────────────────────
  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    const v = this.profileForm.value;
    this.userSvc.updateMe({
      nombre: v.nombre ?? undefined,
      urlFotoPerfil: v.urlFotoPerfil || undefined,
      ubicacionLatitud: this._lat ?? undefined,
      ubicacionLongitud: this._lon ?? undefined,
    }).subscribe({
      next: () => {
        this.authSvc.loadCurrentUser().subscribe();
        this.snackBar.open('Perfil actualizado ✓', 'Cerrar', { duration: 2500 });
        this.savingProfile.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al guardar', 'Cerrar', { duration: 4000 });
        this.savingProfile.set(false);
      },
    });
  }

  // ── Sports ─────────────────────────────────────────────────────────────
  openAddSportDialog(): void {
    const ref = this.dialog.open<AddSportDialogComponent, AddSportDialogData, UsuarioPreferenciaRequest>(
      AddSportDialogComponent,
      { data: { allSports: this.allSports(), existingIds: this.sports().map(s => s.idDeporte) }, width: '420px' }
    );
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const requests: UsuarioPreferenciaRequest[] = [
        ...this.sports().map(s => ({ idDeporte: s.idDeporte, nivel: s.nivel, rolPreferido: s.rolPreferido || undefined })),
        result,
      ];
      this.saveSports(requests);
    });
  }

  removeSport(idDeporte: number): void {
    const requests = this.sports().filter(s => s.idDeporte !== idDeporte)
      .map(s => ({ idDeporte: s.idDeporte, nivel: s.nivel, rolPreferido: s.rolPreferido || undefined }));
    this.saveSports(requests);
  }

  private saveSports(requests: UsuarioPreferenciaRequest[]): void {
    this.savingSports.set(true);
    this.userSvc.updateMySports(requests).subscribe({
      next: updated => {
        this.sports.set(updated);
        this.authSvc.loadCurrentUser().subscribe();
        this.snackBar.open('Deportes guardados ✓', 'Cerrar', { duration: 2500 });
        this.savingSports.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al guardar deportes', 'Cerrar', { duration: 4000 });
        this.savingSports.set(false);
      },
    });
  }

  nivelLabel(nivel: number): string { return NIVEL_LABELS[nivel] ?? ''; }
  nivelStars(nivel: number): string { return '★'.repeat(nivel) + '☆'.repeat(5 - nivel); }

  // ── My meetups ─────────────────────────────────────────────────────────
  loadMyMeetups(page: number, role: MeetupRole): void {
    this.myMeetupsLoading.set(true);
    this.currentMeetupRole = role;
    this.userSvc.getMyMeetups(role, page, this.myMeetupsPageSize).subscribe({
      next: result => {
        this.myMeetups.set(result.content);
        this.myMeetupsTotal.set(result.totalElements);
        this.myMeetupsPage.set(page);
        this.myMeetupsLoading.set(false);
      },
      error: () => this.myMeetupsLoading.set(false),
    });
  }

  onMeetupsPageChange(e: PageEvent): void {
    this.loadMyMeetups(e.pageIndex, this.currentMeetupRole);
  }

  goToMeetup(id: number): void { this.router.navigate(['/meetups', id]); }
}
