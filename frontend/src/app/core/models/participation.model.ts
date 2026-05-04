import { EstadoAsistencia } from './meetup.model';

export interface ParticipacionResponse {
  idUsuario: number;
  nombreUsuario: string;
  idQuedada: number;
  estadoAsistencia: EstadoAsistencia;
  fechaConfirmacion: string | null;
}
