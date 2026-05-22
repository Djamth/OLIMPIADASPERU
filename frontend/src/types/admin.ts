import type { Modulo } from "@/types/auth";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  estado: "ACTIVO" | "INACTIVO" | string;
}

export interface UsuarioCreateRequest {
  nombre: string;
  email: string;
  password: string;
  rolId: number;
}

export interface UsuarioUpdateRequest {
  nombre: string;
  email: string;
  rolId: number;
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

export interface DashboardResumen {
  metricas: DashboardMetric[];
  avanceFuncional: DashboardProgress[];
  proximasContiendas: DashboardUpcomingMatch[];
}
