export type Genero = "MASCULINO" | "FEMENINO" | "MIXTO";
export type CategoriaEquipo = "SUB_12" | "SUB_15" | "SUB_17" | "LIBRE";
export type EstadoInscripcion = "PENDIENTE" | "CONFIRMADA" | "CANCELADA";
export type EstadoPartido = "PROGRAMADO" | "EN_JUEGO" | "FINALIZADO" | "REPROGRAMADO";

export interface Deporte {
  id: number;
  nombre: string;
  descripcion?: string | null;
  maximoEquiposPorGrupo: number;
  numeroJugadores: number;
}

export type DeporteRequest = Omit<Deporte, "id">;

export interface Institucion {
  id: number;
  nombre: string;
  codigoModular: string;
  region: string;
  ciudad: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export type InstitucionRequest = Omit<Institucion, "id">;

export interface Equipo {
  id: number;
  nombre: string;
  categoria: CategoriaEquipo;
  genero: Genero;
  entrenador: string;
  institucionId: number;
  institucionNombre: string;
}

export interface EquipoRequest {
  nombre: string;
  categoria: CategoriaEquipo;
  genero: Genero;
  entrenador: string;
  institucionId: number;
}

export interface Participante {
  id: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  genero: Genero;
  fechaNacimiento: string;
  codigoEstudiante: string;
  equipoId: number;
  equipoNombre: string;
  institucionId: number;
  institucionNombre: string;
}

export interface ParticipanteRequest {
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  genero: Genero;
  fechaNacimiento: string;
  codigoEstudiante: string;
  equipoId: number;
}

export interface Inscripcion {
  id: number;
  equipoId: number;
  equipoNombre: string;
  deporteId: number;
  deporteNombre: string;
  estado: EstadoInscripcion;
  fechaInscripcion: string;
}

export interface InscripcionRequest {
  equipoId: number;
  deporteId: number;
  estado: EstadoInscripcion;
  fechaInscripcion: string;
}

export interface GrupoEquipo {
  equipoId: number;
  equipoNombre: string;
  posicion: number;
}

export interface Grupo {
  id: number;
  nombre: string;
  deporteId: number;
  deporteNombre: string;
  equipos: GrupoEquipo[];
}

export interface Partido {
  id: number;
  grupoId?: number | null;
  grupoNombre?: string | null;
  deporteId: number;
  deporteNombre: string;
  equipoLocalId: number;
  equipoLocalNombre: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre: string;
  fechaHora: string;
  sede: string;
  estado: EstadoPartido;
}

export interface PartidoRequest {
  grupoId?: number | null;
  deporteId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  fechaHora: string;
  sede: string;
  estado: EstadoPartido;
}

export interface ResultadoAnotacionRequest {
  participanteId: number;
  cantidad: number;
}

export interface ResultadoAnotacion {
  participanteId: number;
  participanteNombreCompleto: string;
  equipoId: number;
  equipoNombre: string;
  cantidad: number;
}

export interface Resultado {
  id: number;
  partidoId: number;
  deporte: string;
  equipoLocal: string;
  equipoVisitante: string;
  puntajeLocal: number;
  puntajeVisitante: number;
  observaciones?: string | null;
  anotaciones: ResultadoAnotacion[];
}

export interface ResultadoRequest {
  partidoId: number;
  puntajeLocal: number;
  puntajeVisitante: number;
  observaciones?: string | null;
  anotaciones?: ResultadoAnotacionRequest[];
}

export interface Goleador {
  nombre: string;
  anotaciones: number;
}

export interface RankingEquipo {
  equipo: string;
  partidosJugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  puntos: number;
  tantosFavor: number;
  tantosContra: number;
}
