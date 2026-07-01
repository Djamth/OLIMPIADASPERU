export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  codigo: string;
  nuevaPassword: string;
}

export interface PerfilUpdateRequest {
  nombre: string;
  email: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  nuevaPassword: string;
}

export interface ApiMessageResponse {
  mensaje: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  ruta: string;
  icono?: string | null;
  puedeVer?: boolean | null;
  puedeCrear?: boolean | null;
  puedeEditar?: boolean | null;
  puedeEliminar?: boolean | null;
  puedeExportar?: boolean | null;
}

export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  rolNombre: string;
  institucionId?: number | null;
  institucionNombre?: string | null;
  estado: string;
  modulos: Modulo[];
  accessToken?: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}
