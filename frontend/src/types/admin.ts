import type { Modulo } from "@/types/auth";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  institucionId?: number | null;
  institucionNombre?: string | null;
  estado: "ACTIVO" | "INACTIVO" | string;
}

export interface UsuarioCreateRequest {
  nombre: string;
  email: string;
  password: string;
  rolId: number;
  institucionId?: number | null;
}

export interface UsuarioUpdateRequest {
  nombre: string;
  email: string;
  rolId: number;
  institucionId?: number | null;
  estado: "ACTIVO" | "INACTIVO" | string;
}

export interface Rol {
  id: number;
  nombre: string;
  estado: "ACTIVO" | "INACTIVO" | string;
}

export interface RolRequest {
  nombre: string;
  estado: "ACTIVO" | "INACTIVO" | string;
}

export interface RolModulos {
  rolId: number;
  rolNombre: string;
  modulos: Modulo[];
}

export interface Accion {
  id: number;
  codigo: string;
  nombre: string;
  permisosAsignados: number;
}

export interface AccionRequest {
  codigo: string;
  nombre: string;
}

export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  tone: "primary" | "success" | "warning" | "danger" | string;
}

export interface DashboardProgress {
  label: string;
  value: number;
}

export interface DashboardUpcomingMatch {
  id: number;
  deporte: string;
  encuentro: string;
  fechaHora: string;
  sede: string;
  estado: string;
}

export interface DashboardRecentResult {
  id: number;
  deporte: string;
  encuentro: string;
  puntajeLocal: number;
  puntajeVisitante: number;
  ganador: string;
  observaciones?: string | null;
}

export interface DashboardActivity {
  id: number;
  usuario: string;
  accion: string;
  descripcion: string;
  fecha: string;
}

export interface DashboardSportChart {
  deporte: string;
  equipos: number;
  participantes: number;
  partidos: number;
  resultados: number;
}

export interface DashboardAlert {
  tipo: string;
  titulo: string;
  detalle: string;
  severidad: "danger" | "warning" | "info" | string;
  referencia: string;
}

export interface DashboardCountrySummary {
  pais: string;
  bandera: string;
  categoria: string;
  equipos: number;
  participantes: number;
  partidos: number;
  resultados: number;
}

export interface DashboardResumen {
  metricas: DashboardMetric[];
  avanceFuncional: DashboardProgress[];
  proximasContiendas: DashboardUpcomingMatch[];
  ultimosResultados: DashboardRecentResult[];
  actividadReciente: DashboardActivity[];
  graficasPorDeporte: DashboardSportChart[];
  alertas: DashboardAlert[];
  resumenPorPais: DashboardCountrySummary[];
}

export interface PublicDashboardResumen {
  metricas: DashboardMetric[];
  proximasContiendas: DashboardUpcomingMatch[];
  ultimosResultados: DashboardRecentResult[];
}

export interface Auditoria {
  id: number;
  usuarioId?: number | null;
  usuarioNombre: string;
  usuarioEmail?: string | null;
  accion: string;
  descripcion: string;
  fecha: string;
}

export interface Notificacion {
  id: number;
  tipo: "INSCRIPCION" | "PROGRAMACION" | "RESULTADO" | "SISTEMA" | string;
  titulo: string;
  mensaje: string;
  referencia?: string | null;
  leido: boolean;
  creadoEn: string;
}

export interface NotificacionResumen {
  noLeidas: number;
  items: Notificacion[];
}

export type NotificacionEstadoFiltro = "TODAS" | "NO_LEIDAS" | "LEIDAS";
