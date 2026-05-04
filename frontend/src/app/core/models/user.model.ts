export type RolUsuario = 'USER' | 'ADMIN';

export interface UsuarioPreferenciaResponse {
  idDeporte: number;
  nombreDeporte: string;
  nivel: number;
  rolPreferido: string;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  ubicacionLatitud: number | null;
  ubicacionLongitud: number | null;
  fiabilidadScore: number;
  fechaRegistro: string;
  urlFotoPerfil: string | null;
  rol: RolUsuario;
  deportes: UsuarioPreferenciaResponse[];
}

export interface UsuarioPublicResponse {
  id: number;
  nombre: string;
  ubicacionLatitud: number | null;
  ubicacionLongitud: number | null;
  fiabilidadScore: number;
  fechaRegistro: string;
  urlFotoPerfil: string | null;
  rol: RolUsuario;
  deportes: UsuarioPreferenciaResponse[];
}

export interface UsuarioUpdateRequest {
  nombre?: string;
  ubicacionLatitud?: number;
  ubicacionLongitud?: number;
  urlFotoPerfil?: string;
}

export interface UsuarioPreferenciaRequest {
  idDeporte: number;
  nivel: number;
  rolPreferido?: string;
}
