export interface DeporteResponse {
  id: number;
  nombre: string;
  jugadoresDefault: number;
  descripcion: string | null;
}

export interface DeporteRequest {
  nombre: string;
  jugadoresDefault: number;
  descripcion?: string;
}

export interface DeportePatchRequest {
  nombre?: string;
  jugadoresDefault?: number;
  descripcion?: string;
}
