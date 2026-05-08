export interface LoginRequest {
  email: string;
  password: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  ruta: string;
  icono?: string | null;
}

export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  rolNombre: string;
  estado: string;
  modulos: Modulo[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
