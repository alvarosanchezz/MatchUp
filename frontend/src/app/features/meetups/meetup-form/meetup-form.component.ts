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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import * as L from 'leaflet';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { MeetupService } from '../../../core/services/meetup.service';
import { SportService } from '../../../core/services/sport.service';
import { QuedadaRequest, QuedadaPatchRequest } from '../../../core/models/meetup.model';
import { DeporteResponse } from '../../../core/models/sport.model';
import { ProblemDetail } from '../../../core/models/problem-detail.model';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function combineDateTime(date: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(h, m, 0, 0);
  return result;
}

function formatLocalDateTime(date: Date): string {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${M}-${d}T${h}:${m}:00`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const dateRangeValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const fechaInicio = form.get('fechaInicio')?.value as Date | null;
  const horaInicio = form.get('horaInicio')?.value as string | null;
  const fechaFin = form.get('fechaFin')?.value as Date | null;
  const horaFin = form.get('horaFin')?.value as string | null;
  if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) return null;
  const start = combineDateTime(fechaInicio, horaInicio);
  const end = combineDateTime(fechaFin, horaFin);
  return end <= start ? { fechaFinAnterior: true } : null;
};

// ── Nominatim ─────────────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-meetup-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './meetup-form.component.html',
  styleUrl: './meetup-form.component.scss',
})
export class MeetupFormComponent implements OnDestroy {
  private readonly meetupSvc = inject(MeetupService);
  private readonly sportSvc = inject(SportService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  // ── State ─────────────────────────────────────────────────────────────
  isEditMode = false;
  private _meetupId: number | null = null;

  readonly loadingData = signal(false);
  readonly submitting = signal(false);
  readonly sports = signal<DeporteResponse[]>([]);
  readonly searchResults = signal<NominatimResult[]>([]);
  readonly formSubmitted = signal(false);

  readonly searchCtrl = new FormControl('');

  readonly form = this.fb.group(
    {
      idDeporte: [null as number | null, Validators.required],
      fechaInicio: [null as Date | null, Validators.required],
      horaInicio: ['10:00', Validators.required],
      fechaFin: [null as Date | null, Validators.required],
      horaFin: ['12:00', Validators.required],
      ubicacionNombre: ['', [Validators.required, Validators.maxLength(255)]],
      ubicacionLatitud: [null as number | null, Validators.required],
      ubicacionLongitud: [null as number | null, Validators.required],
      numJugadoresTotal: [10, [Validators.required, Validators.min(1)]],
      esPublica: [true],
      descripcion: ['', Validators.maxLength(2000)],
    },
    { validators: [dateRangeValidator] }
  );

  private map: L.Map | null = null;
  private mapMarker: L.Marker | null = null;

  readonly locationSet = computed(() => {
    return this.form.get('ubicacionLatitud')?.value != null;
  });

  // ── Input binding (edit mode) ─────────────────────────────────────────
  @Input()
  set id(value: string) {
    this._meetupId = +value;
    this.isEditMode = true;
    fixLeafletIcons();
    this.loadExistingMeetup();
    this.loadSports();
    setTimeout(() => this.initMap(), 200);
  }

  // ── Constructor: Nominatim debounce + sports load ─────────────────────
  constructor() {
    // Load sports for create mode
    this.loadSports();
    fixLeafletIcons();
    setTimeout(() => this.initMap(), 200);

    // Debounced Nominatim search
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(q => {
          if (!q || typeof q !== 'string' || q.length < 3) return of([]);
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
          return this.http.get<NominatimResult[]>(url).pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed()
      )
      .subscribe(results => this.searchResults.set(results));
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  // ── Data ──────────────────────────────────────────────────────────────
  private loadSports(): void {
    this.sportSvc.listAll().subscribe({ next: s => this.sports.set(s), error: () => {} });
  }

  private loadExistingMeetup(): void {
    if (!this._meetupId) return;
    this.loadingData.set(true);
    this.meetupSvc.getById(this._meetupId).subscribe({
      next: detail => {
        const start = new Date(detail.fechaHoraInicio);
        const end = new Date(detail.fechaHoraFin);
        this.form.patchValue({
          idDeporte: detail.idDeporte,
          fechaInicio: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
          horaInicio: formatTime(start),
          fechaFin: new Date(end.getFullYear(), end.getMonth(), end.getDate()),
          horaFin: formatTime(end),
          ubicacionNombre: detail.ubicacionNombre,
          ubicacionLatitud: detail.ubicacionLatitud,
          ubicacionLongitud: detail.ubicacionLongitud,
          numJugadoresTotal: detail.numJugadoresTotal,
          esPublica: detail.esPublica,
          descripcion: detail.descripcion ?? '',
        });
        this.loadingData.set(false);
        setTimeout(() => this.moveMapTo(detail.ubicacionLatitud, detail.ubicacionLongitud), 300);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'No se pudo cargar la quedada', 'Cerrar', { duration: 4000 });
        this.loadingData.set(false);
        this.router.navigate(['/meetups']);
      },
    });
  }

  // ── Sport selection → auto-fill numJugadores ──────────────────────────
  onSportChange(sportId: number): void {
    const sport = this.sports().find(s => s.id === sportId);
    if (sport) {
      this.form.get('numJugadoresTotal')?.setValue(sport.jugadoresDefault);
    }
  }

  // ── Nominatim ─────────────────────────────────────────────────────────
  displayFn(r: NominatimResult | null): string {
    return r?.display_name ?? '';
  }

  onLocationSelect(event: MatAutocompleteSelectedEvent): void {
    const r = event.option.value as NominatimResult;
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    // Use first segment as the short name
    const nombre = r.display_name.split(',')[0].trim();
    this.form.patchValue({
      ubicacionNombre: nombre,
      ubicacionLatitud: lat,
      ubicacionLongitud: lon,
    });
    this.searchResults.set([]);
    this.moveMapTo(lat, lon);
  }

  // ── Leaflet map ───────────────────────────────────────────────────────
  private initMap(): void {
    const container = this.mapContainerRef?.nativeElement;
    if (!container || this.map) return;

    this.map = L.map(container).setView([40.416775, -3.70379], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Click on map → set marker + update form
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.form.patchValue({
        ubicacionLatitud: +e.latlng.lat.toFixed(6),
        ubicacionLongitud: +e.latlng.lng.toFixed(6),
      });
      this.placeMarker(e.latlng.lat, e.latlng.lng);
    });
  }

  private moveMapTo(lat: number, lon: number): void {
    if (!this.map) return;
    this.map.setView([lat, lon], 15);
    this.placeMarker(lat, lon);
  }

  private placeMarker(lat: number, lon: number): void {
    if (!this.map) return;
    if (this.mapMarker) {
      this.mapMarker.setLatLng([lat, lon]);
    } else {
      this.mapMarker = L.marker([lat, lon], { draggable: true }).addTo(this.map);
      // Drag marker → update form
      this.mapMarker.on('dragend', () => {
        const pos = this.mapMarker!.getLatLng();
        this.form.patchValue({
          ubicacionLatitud: +pos.lat.toFixed(6),
          ubicacionLongitud: +pos.lng.toFixed(6),
        });
      });
    }
  }

  // ── Form helpers ──────────────────────────────────────────────────────
  get fechaFinAnterior(): boolean {
    return this.form.hasError('fechaFinAnterior');
  }

  fieldError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && (ctrl.touched || this.formSubmitted()));
  }

  coordsDisplay(): string {
    const lat = this.form.get('ubicacionLatitud')?.value;
    const lon = this.form.get('ubicacionLongitud')?.value;
    if (lat == null || lon == null) return '';
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }

  // ── Submit ────────────────────────────────────────────────────────────
  submit(): void {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Revisa los campos del formulario', 'Cerrar', { duration: 3000 });
      return;
    }

    const v = this.form.value;
    const start = combineDateTime(v.fechaInicio!, v.horaInicio!);
    const end = combineDateTime(v.fechaFin!, v.horaFin!);

    const body: QuedadaRequest = {
      idDeporte: v.idDeporte!,
      fechaHoraInicio: formatLocalDateTime(start),
      fechaHoraFin: formatLocalDateTime(end),
      ubicacionNombre: v.ubicacionNombre!,
      ubicacionLatitud: v.ubicacionLatitud!,
      ubicacionLongitud: v.ubicacionLongitud!,
      numJugadoresTotal: v.numJugadoresTotal!,
      esPublica: v.esPublica ?? true,
      descripcion: v.descripcion || undefined,
    };

    this.submitting.set(true);

    const request$ = this.isEditMode && this._meetupId
      ? this.meetupSvc.update(this._meetupId, body as QuedadaPatchRequest)
      : this.meetupSvc.create(body);

    request$.subscribe({
      next: detail => {
        this.snackBar.open(
          this.isEditMode ? 'Quedada actualizada ✓' : '¡Quedada creada! 🎉',
          'Cerrar',
          { duration: 3000 }
        );
        this.router.navigate(['/meetups', detail.id]);
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al guardar la quedada', 'Cerrar', { duration: 5000 });
        this.submitting.set(false);
      },
    });
  }
}
