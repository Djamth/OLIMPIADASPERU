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
  Resultado,
  ResultadoRequest,
} from "@/types/catalogs";

function crudService<T, R>(path: string) {
  return {
    async list(params?: Record<string, string | number | undefined>) {
      const { data } = await api.get<T[]>(path, { params });
      return data;
    },
    async create(payload: R) {
      const { data } = await api.post<T>(path, payload);
      return data;
    },
    async update(id: number, payload: R) {
      const { data } = await api.put<T>(`${path}/${id}`, payload);
      return data;
    },
    async remove(id: number) {
      await api.delete(`${path}/${id}`);
    },
  };
}

export const deporteService = crudService<Deporte, DeporteRequest>("/api/deportes");
export const institucionService = crudService<Institucion, InstitucionRequest>("/api/instituciones");
export const equipoService = crudService<Equipo, EquipoRequest>("/api/equipos");
export const participanteService = crudService<Participante, ParticipanteRequest>("/api/participantes");
export const inscripcionService = crudService<Inscripcion, InscripcionRequest>("/api/inscripciones");
export const programacionService = crudService<Partido, PartidoRequest>("/api/programaciones");
export const resultadoService = crudService<Resultado, ResultadoRequest>("/api/resultados");

export const sorteoService = {
  async generarGrupos(deporteId: number) {
    const { data } = await api.post<Grupo[]>(`/api/sorteos/deporte/${deporteId}/grupos`);
    return data;
  },
  async listarGrupos(deporteId: number) {
    const { data } = await api.get<Grupo[]>(`/api/sorteos/deporte/${deporteId}/grupos`);
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
};
