import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  inject,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MeetupCardComponent } from '../../shared/components/meetup-card.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MeetupService } from '../../core/services/meetup.service';
import { SportService } from '../../core/services/sport.service';
import { QuedadaSummaryResponse, EstadoQuedada, MeetupFilters } from '../../core/models/meetup.model';
import { DeporteResponse } from '../../core/models/sport.model';
import { ProblemDetail } from '../../core/models/problem-detail.model';

// Leaflet default icon fix (webpack strips the asset URLs from the defaults)
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

const ESTADO_COLORS: Record<EstadoQuedada, string> = {
  ABIERTA: '#22c55e',
  COMPLETA: '#f97316',
  FINALIZADA: '#6b7280',
  CANCELADA: '#ef4444',
};

export const ESTADO_LABELS: Record<EstadoQuedada, string> = {
  ABIERTA: 'Abierta',
  COMPLETA: 'Completa',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

@Component({
  selector: 'app-meetups',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MeetupCardComponent,
    MatTabsModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSliderModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './meetups.component.html',
  styleUrl: './meetups.component.scss',
})
export class MeetupsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly meetupSvc = inject(MeetupService);
  private readonly sportSvc = inject(SportService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  readonly loading = signal(false);
  readonly meetups = signal<QuedadaSummaryResponse[]>([]);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly pageSize = 20;
  readonly sports = signal<DeporteResponse[]>([]);
  readonly locationSet = signal(false);

  readonly estados: EstadoQuedada[] = ['ABIERTA', 'COMPLETA', 'FINALIZADA', 'CANCELADA'];
  readonly estadoLabels = ESTADO_LABELS;

  readonly filterForm = this.fb.group({
    idDeporte: [null as number | null],
    fechaDesde: [null as Date | null],
    fechaHasta: [null as Date | null],
    estado: [null as EstadoQuedada | null],
    radioKm: [20],
    lat: [null as number | null],
    lon: [null as number | null],
  });

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  ngOnInit(): void {
    fixLeafletIcons();
    this.sportSvc.listAll().subscribe({ next: s => this.sports.set(s), error: () => {} });
    this.loadMeetups(0);
  }

  ngAfterViewInit(): void {
    // Defer map init so Angular Material tab layout is complete
    setTimeout(() => this.initMap(), 200);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  loadMeetups(page: number): void {
    this.loading.set(true);
    const v = this.filterForm.value;
    const filters: MeetupFilters = {};
    if (v.idDeporte) filters.idDeporte = v.idDeporte;
    if (v.fechaDesde) filters.fechaDesde = (v.fechaDesde as Date).toISOString().split('T')[0];
    if (v.fechaHasta) filters.fechaHasta = (v.fechaHasta as Date).toISOString().split('T')[0];
    if (v.estado) filters.estado = v.estado;
    if (v.lat != null && v.lon != null) {
      filters.lat = v.lat;
      filters.lon = v.lon;
      filters.radioKm = v.radioKm ?? 20;
    }

    this.meetupSvc.list(filters, page, this.pageSize).subscribe({
      next: result => {
        this.meetups.set(result.content);
        this.totalElements.set(result.totalElements);
        this.page.set(page);
        this.loading.set(false);
        this.refreshMapMarkers();
      },
      error: (err: HttpErrorResponse) => {
        const pd = err.error as ProblemDetail;
        this.snackBar.open(pd?.detail ?? 'Error al cargar quedadas', 'Cerrar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadMeetups(0);
  }

  clearFilters(): void {
    this.filterForm.reset({ radioKm: 20 });
    this.locationSet.set(false);
    this.loadMeetups(0);
  }

  onPageChange(event: PageEvent): void {
    this.loadMeetups(event.pageIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      // Invalidate size after the tab panel becomes visible
      setTimeout(() => this.map?.invalidateSize(), 100);
    }
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.snackBar.open('Geolocalización no disponible en este navegador', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.filterForm.patchValue({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        this.locationSet.set(true);
        this.snackBar.open('Ubicación obtenida ✓', 'Cerrar', { duration: 2000 });
      },
      () =>
        this.snackBar.open('No se pudo obtener tu ubicación', 'Cerrar', { duration: 3000 })
    );
  }

  goToDetail(id: number): void {
    this.router.navigate(['/meetups', id]);
  }

  stateLabel(estado: EstadoQuedada): string {
    return ESTADO_LABELS[estado] ?? estado;
  }

  stateClass(estado: EstadoQuedada): string {
    return `badge-${estado.toLowerCase()}`;
  }

  sliderValue(): number {
    return this.filterForm.get('radioKm')?.value ?? 20;
  }

  private initMap(): void {
    const container = this.mapContainerRef?.nativeElement;
    if (!container || this.map) return;

    this.map = L.map(container).setView([40.416775, -3.70379], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.refreshMapMarkers();
  }

  private refreshMapMarkers(): void {
    if (!this.map) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];

    for (const meetup of this.meetups()) {
      const color = ESTADO_COLORS[meetup.estado];
      const icon = L.divIcon({
        html: `<span class="map-pin" style="background:${color}"></span>`,
        className: 'map-pin-wrapper',
        iconSize: [18, 18],
        iconAnchor: [9, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([meetup.ubicacionLatitud, meetup.ubicacionLongitud], {
        icon,
      }).addTo(this.map!);

      marker.bindPopup(`
        <div class="map-popup">
          <strong>${meetup.nombreDeporte}</strong>
          <div class="popup-location">${meetup.ubicacionNombre}</div>
          <div class="popup-date">${new Date(meetup.fechaHoraInicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div class="popup-slots">${meetup.numParticipantesActivos}/${meetup.numJugadoresTotal} jugadores</div>
          <button class="popup-btn">Ver detalle</button>
        </div>
      `);

      // Wire up the popup button after the popup opens
      marker.on('popupopen', () => {
        const btn = marker
          .getPopup()
          ?.getElement()
          ?.querySelector('.popup-btn') as HTMLButtonElement | null;
        if (btn) {
          btn.onclick = () => this.router.navigate(['/meetups', meetup.id]);
        }
      });

      this.markers.push(marker);
    }
  }
}
