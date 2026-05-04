export interface RatingRequest {
  idValorado: number;
  nivelNota: number;
  deportividadNota: number;
}

export interface RatingResponse {
  id: number;
  idQuedada: number;
  idValorador: number;
  nombreValorador: string;
  idValorado: number;
  nombreValorado: string;
  nivelNota: number;
  deportividadNota: number;
  fechaCreacion: string;
}
