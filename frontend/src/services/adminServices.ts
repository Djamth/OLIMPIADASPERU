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

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const CACHE_TTL_MS = 45_000;
const adminCache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(path: string, params?: Record<string, string | number | undefined>) {
  const cleanParams = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  if (cleanParams.length === 0) return path;
  return `${path}?${JSON.stringify(cleanParams)}`;
}

function getCached<T>(key: string) {
  const cached = adminCache.get(key) as CacheEntry<T> | undefined;
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    adminCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS) {
  adminCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

async function cachedGet<T>(path: string, params?: Record<string, string | number | undefined>, ttlMs = CACHE_TTL_MS) {
  const key = getCacheKey(path, params);
  const cached = getCached<T>(key);
  if (cached) return cached;
  const { data } = await api.get<T>(path, { params });
  setCached(key, data, ttlMs);
  return data;
}

function invalidateAdminCache(path: string) {
  Array.from(adminCache.keys()).forEach((key) => {
    if (key === path || key.startsWith(`${path}?`) || key.startsWith(`${path}/`)) {
      adminCache.delete(key);
    }
  });
}

export const usuarioService = {
  async list() {
    return cachedGet<Usuario[]>("/api/usuarios");
  },
  async create(payload: UsuarioCreateRequest) {
    const { data } = await api.post<Usuario>("/api/usuarios", payload);
    invalidateAdminCache("/api/usuarios");
    return data;
  },
  async update(id: number, payload: UsuarioUpdateRequest) {
    const { data } = await api.put<Usuario>(`/api/usuarios/${id}`, payload);
    invalidateAdminCache("/api/usuarios");
    return data;
  },
  async remove(id: number) {
    await api.delete(`/api/usuarios/${id}`);
    invalidateAdminCache("/api/usuarios");
  },
};

export const rolService = {
  async list() {
    return cachedGet<Rol[]>("/api/roles");
  },
  async create(payload: RolRequest) {
    const { data } = await api.post<Rol>("/api/roles", payload);
    invalidateAdminCache("/api/roles");
    return data;
  },
  async update(id: number, payload: RolRequest) {
    const { data } = await api.put<Rol>(`/api/roles/${id}`, payload);
    invalidateAdminCache("/api/roles");
    return data;
  },
  async remove(id: number) {
    await api.delete(`/api/roles/${id}`);
    invalidateAdminCache("/api/roles");
  },
  async modulos(id: number) {
    return cachedGet<RolModulos>(`/api/roles/${id}/modulos`);
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
    invalidateAdminCache("/api/roles");
    return data;
  },
};

export const moduloService = {
  async list() {
    return cachedGet<Modulo[]>("/api/modulos", undefined, 5 * 60_000);
  },
};

export const accionService = {
  async list() {
    return cachedGet<Accion[]>("/api/acciones", undefined, 5 * 60_000);
  },
  async create(payload: AccionRequest) {
    const { data } = await api.post<Accion>("/api/acciones", payload);
    invalidateAdminCache("/api/acciones");
    return data;
  },
  async update(id: number, payload: AccionRequest) {
    const { data } = await api.put<Accion>(`/api/acciones/${id}`, payload);
    invalidateAdminCache("/api/acciones");
    return data;
  },
  async remove(id: number) {
    await api.delete(`/api/acciones/${id}`);
    invalidateAdminCache("/api/acciones");
  },
};

export const dashboardService = {
  async resumen() {
    return cachedGet<DashboardResumen>("/api/dashboard/resumen", undefined, 30_000);
  },
};

export const publicDashboardService = {
  async resumen() {
    return cachedGet<PublicDashboardResumen>("/api/public/resumen", undefined, 30_000);
  },
};

export const auditoriaService = {
  async list() {
    return cachedGet<Auditoria[]>("/api/auditoria", undefined, 30_000);
  },
};

export const notificacionService = {
  async resumen() {
    return cachedGet<NotificacionResumen>("/api/notificaciones", undefined, 20_000);
  },
  async historial(params?: { tipo?: string; estado?: string }) {
    return cachedGet<NotificacionResumen>("/api/notificaciones/historial", params, 20_000);
  },
  async marcarComoLeida(id: number) {
    await api.patch(`/api/notificaciones/${id}/leida`);
    invalidateAdminCache("/api/notificaciones");
  },
  async marcarTodasComoLeidas() {
    await api.patch("/api/notificaciones/leidas");
    invalidateAdminCache("/api/notificaciones");
  },
};
