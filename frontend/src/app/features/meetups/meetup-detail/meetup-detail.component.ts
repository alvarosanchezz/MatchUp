import {
  Component,
  OnDestroy,
  Input,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import * as L from 'leaflet';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { MeetupService } from '../../../core/services/meetup.service';
import { ParticipationService } from '../../../core/services/participation.service';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  QuedadaDetailResponse,
  EstadoQuedada,
  EstadoAsistencia,
} from '../../../core/models/meetup.model';
import { ComentarioResponse } from '../../../core/models/comment.model';
import { ProblemDetail } from '../../../core/models/problem-detail.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog.component';
import {
  RateParticipantsDialogComponent,
} from '../rate-participants-dialog/rate-participants-dialog.component';

export const ESTADO_LABELS: Record<EstadoQuedada, string> = {
  ABIERTA: 'Abierta',
  COMPLETA: 'Completa',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

export const ASISTENCIA_LABELS: Record<EstadoAsistencia, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado ✓',
  RETIRADO: 'Retirado',
  AUSENTE: 'Ausente ✗',
};

function fixLeafletIcons(): void {
  const icon = L.icon({
    iconUrl: 'assets/marker-icon.png',
    iconRetinaUrl: 'assets/marker-icon-2x.png',
    shadowUrl: 'assets/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.Marker.prototype.options.icon = icon;
}

@Component({
  selector: 'app-meetup-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './meetup-detail.component.html',
  styleUrl: './meetup-detail.component.scss',
})
export class MeetupDetailComponent implements OnDestroy {
  private readonly meetupSvc = inject(MeetupService);
  private readonly participationSvc = inject(ParticipationService);
  private readonly commentSvc = inject(CommentService);
  private readonly authSvc = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  @ViewChild('miniMap') miniMapRef!: ElementRef<HTMLDivElement>;

  // ── State ──────────────────────────────────────────────────────────────
  readonly loading = signal(false);
  readonly meetup = signal<QuedadaDetailResponse | null>(null);
  readonly actionLoading = signal(false);

  readonly comments = signal<ComentarioResponse[]>([]);
  readonly commentTotal = signal(0);
  readonly commentPage = signal(0);
  readonly commentsLoading = signal(false);
  readonly commentSubmitting = signal(false);
  readonly commentPageSize = 20;

  readonly commentForm = this.fb.group({
    contenido: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  private miniMap: L.Map | null = null;
  private _meetupId!: number;

  // ── Input binding ──────────────────────────────────────────────────────
  @Input()
  set id(value: string) {
    this._meetupId = +value;
    fixLeafletIcons();
    this.loadDetail();
    this.loadComments(0);
  }

  // ── Computed role helpers ──────────────────────────────────────────────
  readonly isOrganizer = computed(() => {
    const user = this.authSvc.currentUser();
    const m = this.meetup();
    return !!user && !!m && user.id === m.idOrganizador;
  });

  readonly myParticipation = computed(() => {
    const user = this.authSvc.currentUser();
    const m = this.meetup();
    if (!user || !m) return null;
    return m.participantes.find(p => p.idUsuario === user.id) ?? null;
  });

  readonly canJoin = computed(() => {
    const m = this.meetup();
    if (!m || m.estado !== 'ABIERTA') return false;
    if (this.isOrganizer()) return false;
    const myPart = this.myParticipation();
    if (myPart) return false; // already has a record (including RETIRADO)
    return m.numParticipantesActivos < m.numJugadoresTotal;
  });

  readonly canLeave = computed(() => {
    const myPart = this.myParticipation();
    return !this.isOrganizer() && myPart?.estadoAsistencia === 'PENDIENTE';
  });

  readonly canComment = computed(() => {
    const m = this.meetup();
    if (!m || m.estado === 'CANCELADA') return false;
    if (this.isOrganizer()) return true;
    const p = this.myParticipation();
    return p != null && p.estadoAsistencia !== 'RETIRADO' && p.estadoAsistencia !== 'AUSENTE';
  });

  readonly canRate = computed(() => {
    const m = this.meetup();
    if (!m || m.estado !== 'FINALIZADA') return false;
    return this.myParticipation()?.estadoAsistencia === 'CONFIRMADO';
  });

  readonly hasActions = computed(() => {
    const m = this.meetup();
    if (!m) return false;
    if (this.isOrganizer()) {
      return ['ABIERTA', 'COMPLETA', 'FINALIZADA'].includes(m.estado);
    }
    return this.canJoin() || this.canLeave() || this.canRate();
  });

  readonly pendingParticipants = computed(() => {
    const m = this.meetup();
    if (!m) return [];
    return m.participantes.filter(p => p.estadoAsistencia === 'PENDIENTE');
  });

  // ── Labels ────────────────────────────────────────────────────────────
  readonly estadoLabels = ESTADO_LABELS;

  estadoLabel(e: EstadoQuedada): string {
    return ESTADO_LABELS[e] ?? e;
  }

  asistenciaLabel(e: EstadoAsistencia): string {
    return ASISTENCIA_LABELS[e] ?? e;
  }

  canDeleteComment(c: ComentarioResponse): boolean {
    const user = this.authSvc.currentUser();
    return !!user && (user.id === c.idUsuario || user.rol === 'ADMIN');
  }

  // ── Data loading ──────────────────────────────────────────────────────
  loadDetail(): void {
    this.loading.set(true);
    this.meetupSvc.getById(this._meetupId).subscribe({
      next: detail => {
        this.meetup.set(detail);
        this.loading.set(false);
        setTimeout(() => this.initMiniMap(detail.ubicacionLatitud, detail.ubicacionLongitud, detail.ubicacionNombre), 150);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'No se pudo cargar la quedada', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/meetups']);
      },
    });
  }

  loadComments(page: number): void {
    this.commentsLoading.set(true);
    this.commentSvc.list(this._meetupId, page, this.commentPageSize).subscribe({
      next: result => {
        this.comments.set(result.content);
        this.commentTotal.set(result.totalElements);
        this.commentPage.set(page);
        this.commentsLoading.set(false);
      },
      error: () => this.commentsLoading.set(false),
    });
  }

  onCommentPageChange(e: PageEvent): void {
    this.loadComments(e.pageIndex);
  }

  // ── Actions ───────────────────────────────────────────────────────────
  joinMeetup(): void {
    this.actionLoading.set(true);
    this.participationSvc.join(this._meetupId).subscribe({
      next: () => {
        this.snackBar.open('¡Te has apuntado! 🎉', 'Cerrar', { duration: 3000 });
        this.loadDetail();
        this.actionLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'No se pudo apuntar', 'Cerrar', { duration: 4000 });
        this.actionLoading.set(false);
      },
    });
  }

  leaveMeetup(): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Desapuntarse',
          message: '¿Seguro que quieres desapuntarte de esta quedada?',
          confirmLabel: 'Desapuntarme',
          confirmColor: 'warn',
        },
      }
    );
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.actionLoading.set(true);
      this.participationSvc.leave(this._meetupId).subscribe({
        next: () => {
          this.snackBar.open('Te has desapuntado', 'Cerrar', { duration: 3000 });
          this.loadDetail();
          this.actionLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          const pd = err.error as ProblemDetail;
          this.snackBar.open(pd?.detail ?? 'Error al desapuntarte', 'Cerrar', { duration: 4000 });
          this.actionLoading.set(false);
        },
      });
    });
  }

  cancelMeetup(): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Cancelar quedada',
          message: 'Esta acción cancelará la quedada para todos los participantes. ¿Continuar?',
          confirmLabel: 'Sí, cancelar',
          confirmColor: 'warn',
        },
      }
    );
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.actionLoading.set(true);
      this.meetupSvc.cancel(this._meetupId).subscribe({
        next: () => {
          this.snackBar.open('Quedada cancelada', 'Cerrar', { duration: 3000 });
          this.loadDetail();
          this.actionLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          const pd = err.error as ProblemDetail;
          this.snackBar.open(pd?.detail ?? 'Error al cancelar', 'Cerrar', { duration: 4000 });
          this.actionLoading.set(false);
        },
      });
    });
  }

  finalizeMeetup(): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Finalizar quedada',
          message: 'Marcarás la quedada como finalizada. Después podrás confirmar la asistencia de cada participante.',
          confirmLabel: 'Finalizar',
          confirmColor: 'primary',
        },
      }
    );
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.actionLoading.set(true);
      this.meetupSvc.finalize(this._meetupId).subscribe({
        next: detail => {
          this.meetup.set(detail);
          this.snackBar.open('Quedada finalizada ✓', 'Cerrar', { duration: 3000 });
          this.actionLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          const pd = err.error as ProblemDetail;
          this.snackBar.open(pd?.detail ?? 'Error al finalizar', 'Cerrar', { duration: 4000 });
          this.actionLoading.set(false);
        },
      });
    });
  }

  confirmAttendance(userId: number): void {
    this.participationSvc.confirm(this._meetupId, userId).subscribe({
      next: () => {
        this.snackBar.open('Asistencia confirmada ✓', 'Cerrar', { duration: 2500 });
        this.loadDetail();
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al confirmar', 'Cerrar', { duration: 4000 });
      },
    });
  }

  markNoShow(userId: number): void {
    this.participationSvc.markNoShow(this._meetupId, userId).subscribe({
      next: () => {
        this.snackBar.open('Participante marcado como ausente', 'Cerrar', { duration: 2500 });
        this.loadDetail();
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al marcar ausencia', 'Cerrar', { duration: 4000 });
      },
    });
  }

  submitComment(): void {
    if (this.commentForm.invalid) return;
    this.commentSubmitting.set(true);
    const contenido = this.commentForm.value.contenido!;
    this.commentSvc.create(this._meetupId, { contenido }).subscribe({
      next: () => {
        this.commentForm.reset();
        this.snackBar.open('Comentario publicado', 'Cerrar', { duration: 2000 });
        this.loadComments(0);
        this.commentSubmitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al publicar', 'Cerrar', { duration: 4000 });
        this.commentSubmitting.set(false);
      },
    });
  }

  deleteComment(commentId: number): void {
    this.commentSvc.delete(this._meetupId, commentId).subscribe({
      next: () => {
        this.snackBar.open('Comentario eliminado', 'Cerrar', { duration: 2000 });
        this.loadComments(this.commentPage());
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al eliminar', 'Cerrar', { duration: 4000 });
      },
    });
  }

  openRateDialog(): void {
    const m = this.meetup();
    if (!m) return;
    this.dialog.open(RateParticipantsDialogComponent, {
      data: { meetup: m },
      width: '560px',
    });
  }

  // ── Mini Leaflet map ──────────────────────────────────────────────────
  private initMiniMap(lat: number, lon: number, title: string): void {
    const container = this.miniMapRef?.nativeElement;
    if (!container || this.miniMap) return;

    this.miniMap = L.map(container, {
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.miniMap);

    L.marker([lat, lon])
      .addTo(this.miniMap)
      .bindPopup(title)
      .openPopup();
  }

  ngOnDestroy(): void {
    this.miniMap?.remove();
    this.miniMap = null;
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w.charAt(0).toUpperCase())
      .join('');
  }
}
