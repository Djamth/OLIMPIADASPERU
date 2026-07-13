import { api } from "@/services/api";
import type {
  Deporte,
  DeporteRequest,
  Equipo,
  EquipoRequest,
  Goleador,
  Grupo,
  Inscripcion,
  InscripcionRequest,
  Institucion,
  InstitucionRequest,
  Participante,
  ParticipanteRequest,
  Partido,
  PartidoRequest,
  RankingEquipo,
  ReporteEjecutivo,
  Resultado,
  ResultadoRequest,
  Pais,
  PaisRequest,
  Evento,
  EventoRequest,
  CategoriaEvento,
  CategoriaEventoRequest,
  PlantillaEquipo,
  PlantillaEquipoRequest,
} from "@/types/catalogs";

type ListCacheEntry<T> = {
  data: T[];
  expiresAt: number;
};

const LIST_CACHE_TTL_MS = 60_000;
const listCache = new Map<string, ListCacheEntry<unknown>>();

function getListCacheKey(path: string, params?: Record<string, string | number | undefined>) {
  const cleanParams = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  if (cleanParams.length === 0) return path;
  return `${path}?${JSON.stringify(cleanParams)}`;
}

function getCachedList<T>(key: string) {
  const cached = listCache.get(key) as ListCacheEntry<T> | undefined;
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    listCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedList<T>(key: string, data: T[]) {
  listCache.set(key, {
    data,
    expiresAt: Date.now() + LIST_CACHE_TTL_MS,
  });
}

function invalidatePathCache(path: string) {
  Array.from(listCache.keys()).forEach((key) => {
    if (key === path || key.startsWith(`${path}?`)) {
      listCache.delete(key);
    }
  });
}

function crudService<T, R>(path: string) {
  return {
    async list(params?: Record<string, string | number | undefined>) {
      const cacheKey = getListCacheKey(path, params);
      const cached = getCachedList<T>(cacheKey);
      if (cached) return cached;
      const { data } = await api.get<T[]>(path, { params });
      setCachedList(cacheKey, data);
      return data;
    },
    async create(payload: R) {
      const { data } = await api.post<T>(path, payload);
      invalidatePathCache(path);
      return data;
    },
    async update(id: number, payload: R) {
      const { data } = await api.put<T>(`${path}/${id}`, payload);
      invalidatePathCache(path);
      return data;
    },
    async remove(id: number) {
      await api.delete(`${path}/${id}`);
      invalidatePathCache(path);
    },
  };
}

async function downloadBlob(path: string, fallbackName: string) {
  const response = await api.get<Blob>(path, { responseType: "blob" });
  const disposition = String(response.headers["content-disposition"] ?? "");
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const fileName = match?.[1] ?? fallbackName;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const deporteService = crudService<Deporte, DeporteRequest>("/api/deportes");
export const institucionService = crudService<Institucion, InstitucionRequest>("/api/instituciones");
export const equipoService = crudService<Equipo, EquipoRequest>("/api/equipos");
export const participanteService = crudService<Participante, ParticipanteRequest>("/api/participantes");
export const inscripcionService = crudService<Inscripcion, InscripcionRequest>("/api/inscripciones");
export const programacionService = crudService<Partido, PartidoRequest>("/api/programaciones");
export const resultadoService = crudService<Resultado, ResultadoRequest>("/api/resultados");
export const paisService = crudService<Pais, PaisRequest>("/api/paises");
export const eventoService = crudService<Evento, EventoRequest>("/api/eventos");
export const eventoHistoryService = {
  async createNextEdition(id: number, conservarPaises: boolean) {
    const { data } = await api.post<Evento>(`/api/eventos/${id}/siguiente-edicion`, { conservarPaises });
    return data;
  },
};
export const categoriaEventoService = crudService<CategoriaEvento, CategoriaEventoRequest>("/api/categorias-evento");
export const plantillaService = crudService<PlantillaEquipo, PlantillaEquipoRequest>("/api/plantillas");

export const sorteoService = {
  async generarGrupos(deporteId: number) {
    const { data } = await api.post<Grupo[]>(`/api/sorteos/deporte/${deporteId}/grupos`);
    return data;
  },
  async listarGrupos(deporteId: number) {
    const { data } = await api.get<Grupo[]>(`/api/sorteos/deporte/${deporteId}/grupos`);
    return data;
  },
  async generarGruposEvento(eventoId: number, deporteId: number) {
    const { data } = await api.post<Grupo[]>(`/api/sorteos/evento/${eventoId}/deporte/${deporteId}/grupos`);
    return data;
  },
  async listarGruposEvento(eventoId: number, deporteId: number) {
    const { data } = await api.get<Grupo[]>(`/api/sorteos/evento/${eventoId}/deporte/${deporteId}/grupos`);
    return data;
  },
};

export const estadisticaService = {
  async goleadores(deporteId: number) {
    const { data } = await api.get<Goleador[]>(`/api/estadisticas/deporte/${deporteId}/goleadores`);
    return data;
  },
  async ranking(deporteId: number) {
    const { data } = await api.get<RankingEquipo[]>(`/api/estadisticas/deporte/${deporteId}/ranking`);
    return data;
  },
  async descargarReporte(deporteId: number, formato: "pdf" | "excel") {
    const extension = formato === "excel" ? "xlsx" : "pdf";
    await downloadBlob(`/api/reportes/estadisticas/${deporteId}/${formato}`, `estadisticas-${deporteId}.${extension}`);
  },
};

export const reporteEjecutivoService = {
  async obtener(eventoId: number) {
    const { data } = await api.get<ReporteEjecutivo>(`/api/reportes/eventos/${eventoId}/ejecutivo`);
    return data;
  },
  async descargar(eventoId: number, formato: "pdf" | "excel") {
    const extension = formato === "excel" ? "xlsx" : "pdf";
    await downloadBlob(`/api/reportes/eventos/${eventoId}/ejecutivo/${formato}`, `reporte-ejecutivo-${eventoId}.${extension}`);
  },
};
