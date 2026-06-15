export type Genero = "MASCULINO" | "FEMENINO" | "MIXTO";
export type CategoriaEquipo = "SUB_12" | "SUB_15" | "SUB_17" | "LIBRE";
export type EstadoInscripcion = "PENDIENTE" | "CONFIRMADA" | "CANCELADA";
export type EstadoPartido = "PROGRAMADO" | "EN_JUEGO" | "FINALIZADO" | "REPROGRAMADO";
export type TipoInstitucion = "COLEGIO" | "UNIVERSIDAD" | "EMPRESA" | "OTRA";
export type EstadoEvento = "BORRADOR" | "INSCRIPCIONES" | "EN_CURSO" | "FINALIZADO";
export type RolParticipante = "JUGADOR" | "CAPITAN" | "SUPLENTE";

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
  ruc?: string | null;
  tipo?: TipoInstitucion | null;
  nivelEducativo?: string | null;
  region: string;
  ciudad: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  administradorNombre?: string | null;
  administradorEmail?: string | null;
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
  categoriaEventoId?: number | null;
  categoriaEventoNombre?: string | null;
  eventoId?: number | null;
  eventoNombre?: string | null;
  paisId?: number | null;
  paisNombre?: string | null;
  bandera?: string | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  deporteId?: number | null;
  deporteNombre?: string | null;
}

export interface EquipoRequest {
  nombre: string;
  categoria: CategoriaEquipo;
  genero: Genero;
  entrenador: string;
  institucionId: number;
  categoriaEventoId: number;
  deporteId: number;
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
  rolEquipo?: RolParticipante | null;
  numeroCamiseta?: number | null;
  fotografiaUrl?: string | null;
  categoriaEventoId?: number | null;
  categoriaEventoNombre?: string | null;
  paisNombre?: string | null;
  bandera?: string | null;
  deporteId?: number | null;
  deporteNombre?: string | null;
}

export interface ParticipanteRequest {
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  genero: Genero;
  fechaNacimiento: string;
  codigoEstudiante: string;
  equipoId: number;
  rolEquipo?: RolParticipante;
  numeroCamiseta?: number | null;
  fotografiaUrl?: string | null;
}

export interface PlantillaEquipo {
  id: number;
  participanteId: number;
  participanteNombre: string;
  equipoId: number;
  equipoNombre: string;
  deporteId?: number | null;
  deporteNombre?: string | null;
  categoriaEventoId?: number | null;
  categoriaEventoNombre?: string | null;
  paisNombre?: string | null;
  rol: RolParticipante;
  numeroCamiseta?: number | null;
}

export interface PlantillaEquipoRequest {
  participanteId: number;
  equipoId: number;
  rol: RolParticipante;
  numeroCamiseta?: number | null;
}

export interface Inscripcion {
  id: number;
  equipoId: number;
  equipoNombre: string;
  deporteId: number;
  deporteNombre: string;
  estado: EstadoInscripcion;
  fechaInscripcion: string;
  eventoId?: number | null;
  eventoNombre?: string | null;
  categoriaEventoId?: number | null;
  categoriaEventoNombre?: string | null;
  paisNombre?: string | null;
  bandera?: string | null;
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
  eventoId?: number | null;
  eventoNombre?: string | null;
  deporteId: number;
  deporteNombre: string;
  equipos: GrupoEquipo[];
}

export interface Pais {
  id: number;
  nombre: string;
  codigo: string;
  bandera: string;
  colorPrimario: string;
  colorSecundario: string;
  datoCultural?: string | null;
  activo: boolean;
}

export type PaisRequest = Omit<Pais, "id">;

export interface Evento {
  id: number;
  nombre: string;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoEvento;
  institucionId: number;
  institucionNombre: string;
}

export type EventoRequest = Omit<Evento, "id" | "institucionNombre">;

export interface CategoriaEvento {
  id: number;
  nombre: string;
  nivel?: string | null;
  descripcion?: string | null;
  eventoId: number;
  eventoNombre: string;
  institucionId: number;
  institucionNombre: string;
  paisId: number;
  paisNombre: string;
  paisCodigo: string;
  bandera: string;
  colorPrimario: string;
  colorSecundario: string;
}

export interface CategoriaEventoRequest {
  nombre: string;
  nivel?: string | null;
  descripcion?: string | null;
  eventoId: number;
  paisId?: number | null;
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
  participanteId: number;
  nombre: string;
  equipoId: number;
  equipo: string;
  deporte: string;
  indicador: string;
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
