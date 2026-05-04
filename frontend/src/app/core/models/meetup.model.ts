export type EstadoQuedada = 'ABIERTA' | 'COMPLETA' | 'FINALIZADA' | 'CANCELADA';
export type EstadoAsistencia = 'PENDIENTE' | 'CONFIRMADO' | 'RETIRADO' | 'AUSENTE';

export interface ParticipanteResponse {
  idUsuario: number;
  nombre: string;
  urlFotoPerfil: string | null;
  estadoAsistencia: EstadoAsistencia;
}

export interface ComentarioSummaryResponse {
  id: number;
  idUsuario: number;
  nombreUsuario: string;
  contenido: string;
  fechaCreacion: string;
}

export interface QuedadaSummaryResponse {
  id: number;
  idOrganizador: number;
  nombreOrganizador: string;
  idDeporte: number;
  nombreDeporte: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  ubicacionNombre: string;
  ubicacionLatitud: number;
  ubicacionLongitud: number;
  numJugadoresTotal: number;
  numParticipantesActivos: number;
  esPublica: boolean;
  descripcion: string | null;
  estado: EstadoQuedada;
}

export interface QuedadaDetailResponse extends QuedadaSummaryResponse {
  participantes: ParticipanteResponse[];
  comentarios: ComentarioSummaryResponse[];
}

export interface QuedadaRequest {
  idDeporte: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  ubicacionNombre: string;
  ubicacionLatitud: number;
  ubicacionLongitud: number;
  numJugadoresTotal: number;
  esPublica?: boolean;
  descripcion?: string;
}

export interface QuedadaPatchRequest {
  idDeporte?: number;
  fechaHoraInicio?: string;
  fechaHoraFin?: string;
  ubicacionNombre?: string;
  ubicacionLatitud?: number;
  ubicacionLongitud?: number;
  numJugadoresTotal?: number;
  esPublica?: boolean;
  descripcion?: string;
}

export interface MeetupFilters {
  idDeporte?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoQuedada;
  lat?: number;
  lon?: number;
  radioKm?: number;
}
