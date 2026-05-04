export interface ComentarioRequest {
  contenido: string;
}

export interface ComentarioResponse {
  id: number;
  idQuedada: number;
  idUsuario: number;
  nombreUsuario: string;
  contenido: string;
  fechaCreacion: string;
}
