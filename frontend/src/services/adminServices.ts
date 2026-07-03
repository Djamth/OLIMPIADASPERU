import { api } from "@/services/api";
import type { Modulo } from "@/types/auth";
import type {
  Accion,
  AccionRequest,
  Auditoria,
  DashboardResumen,
  NotificacionResumen,
  PublicDashboardResumen,
  Rol,
  RolModulos,
  RolRequest,
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
} from "@/types/admin";

export const usuarioService = {
  async list() {
    const { data } = await api.get<Usuario[]>("/api/usuarios");
    return data;
  },
  async create(payload: UsuarioCreateRequest) {
    const { data } = await api.post<Usuario>("/api/usuarios", payload);
    return data;
  },
  async update(id: number, payload: UsuarioUpdateRequest) {
    const { data } = await api.put<Usuario>(`/api/usuarios/${id}`, payload);
    return data;
  },
  async remove(id: number) {
    await api.delete(`/api/usuarios/${id}`);
  },
};

export const rolService = {
  async list() {
    const { data } = await api.get<Rol[]>("/api/roles");
    return data;
  },
  async create(payload: RolRequest) {
    const { data } = await api.post<Rol>("/api/roles", payload);
    return data;
  },
  async update(id: number, payload: RolRequest) {
    const { data } = await api.put<Rol>(`/api/roles/${id}`, payload);
    return data;
  },
  async remove(id: number) {
    await api.delete(`/api/roles/${id}`);
  },
  async modulos(id: number) {
    const { data } = await api.get<RolModulos>(`/api/roles/${id}/modulos`);
    return data;
  },
  async asignarModulos(id: number, permisos: Array<{
    moduloId: number;
    acciones?: string[];
    puedeVer: boolean;
    puedeCrear: boolean;
    puedeEditar: boolean;
    puedeEliminar: boolean;
    puedeExportar: boolean;
  }>) {
    const { data } = await api.put<RolModulos>(`/api/roles/${id}/modulos`, { permisos });
    return data;
  },
};

export const moduloService = {
  async list() {
    const { data } = await api.get<Modulo[]>("/api/modulos");
    return data;
  },
};

export const accionService = {
  async list() {
    const { data } = await api.get<Accion[]>("/api/acciones");
    return data;
  },
  async create(payload: AccionRequest) {
    const { data } = await api.post<Accion>("/api/acciones", payload);
    return data;
  },
  async update(id: number, payload: AccionRequest) {
    const { data } = await api.put<Accion>(`/api/acciones/${id}`, payload);
    return data;
  },
  async remove(id: number) {
    await api.delete(`/api/acciones/${id}`);
  },
};

export const dashboardService = {
  async resumen() {
    const { data } = await api.get<DashboardResumen>("/api/dashboard/resumen");
    return data;
  },
};

export const publicDashboardService = {
  async resumen() {
    const { data } = await api.get<PublicDashboardResumen>("/api/public/resumen");
    return data;
  },
};

export const auditoriaService = {
  async list() {
    const { data } = await api.get<Auditoria[]>("/api/auditoria");
    return data;
  },
};

export const notificacionService = {
  async resumen() {
    const { data } = await api.get<NotificacionResumen>("/api/notificaciones");
    return data;
  },
  async historial(params?: { tipo?: string; estado?: string }) {
    const { data } = await api.get<NotificacionResumen>("/api/notificaciones/historial", { params });
    return data;
  },
  async marcarComoLeida(id: number) {
    await api.patch(`/api/notificaciones/${id}/leida`);
  },
  async marcarTodasComoLeidas() {
    await api.patch("/api/notificaciones/leidas");
  },
};
