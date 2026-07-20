import type { Resultado } from "@/types/catalogs";

export type ResultSportLabels = {
  plural: string;
  singular: string;
  title: string;
  helper: string;
};

export type QuickStat = {
  label: string;
  value: string | number;
  hint: string;
};

export type TimelineEvent = {
  id: string;
  minute: string;
  title: string;
  description: string;
  accent: "blue" | "green" | "amber" | "slate";
};

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getSportLabels(deporte?: string): ResultSportLabels {
  const normalized = (deporte ?? "").toUpperCase();
  if (normalized.includes("FUTBOL") || normalized.includes("FUTSAL")) {
    return { plural: "goles", singular: "gol", title: "Goleadores", helper: "Registra quién anotó y cuántos goles hizo." };
  }
  if (normalized.includes("BASQUET")) {
    return { plural: "puntos", singular: "punto", title: "Encestadores", helper: "Registra puntos individuales para obtener encestadores." };
  }
  if (normalized.includes("VOLEY")) {
    return { plural: "sets", singular: "set", title: "Sets por participante", helper: "Registra participación en sets ganados o puntos destacados." };
  }
  if (normalized.includes("PING")) {
    return { plural: "puntos/sets", singular: "punto/set", title: "Puntos/Sets individuales", helper: "Registra puntos o sets ganados por participante." };
  }
  return { plural: "anotaciones", singular: "anotacion", title: "Estadisticas individuales", helper: "Registra el aporte individual por participante." };
}

export function getEstimatedDurationLabel(deporte?: string) {
  const normalized = (deporte ?? "").toUpperCase();
  if (normalized.includes("FUTBOL") || normalized.includes("FUTSAL")) return "90 min";
  if (normalized.includes("BASQUET")) return "40 min";
  if (normalized.includes("VOLEY")) return "3-5 sets";
  if (normalized.includes("PING")) return "hasta 7 sets";
  return "Duracion reglamentaria";
}

export function getResultWinnerLabel(result: Resultado) {
  if (result.puntajeLocal > result.puntajeVisitante) return result.equipoLocal;
  if (result.puntajeLocal < result.puntajeVisitante) return result.equipoVisitante;
  return "Empate";
}

export function getResultShareLabel(result: Resultado) {
  return `${result.equipoLocal} ${result.puntajeLocal}-${result.puntajeVisitante} ${result.equipoVisitante}`;
}

export function buildQuickStats(result: Resultado): QuickStat[] {
  const labels = getSportLabels(result.deporte);
  const totalAnotaciones = result.anotaciones.length;
  const totalScore = result.puntajeLocal + result.puntajeVisitante;
  const scorerCount = new Set(result.anotaciones.map((item) => item.participanteId)).size;
  const scoreDiff = Math.abs(result.puntajeLocal - result.puntajeVisitante);
  const homeShare = totalScore === 0 ? 50 : Math.max(35, Math.min(65, Math.round(50 + (result.puntajeLocal - result.puntajeVisitante) * 4 + totalAnotaciones * 1.5)));
  const awayShare = 100 - homeShare;

  return [
    { label: "Duracion", value: getEstimatedDurationLabel(result.deporte), hint: "Estimacion segun el deporte" },
    { label: "Marcador total", value: totalScore, hint: "Suma de ambos equipos" },
    { label: `Anotadores`, value: scorerCount, hint: `Participantes con ${labels.plural}` },
    { label: "Diferencia", value: scoreDiff, hint: "Brecha en el marcador" },
    { label: "Posesion local", value: `${homeShare}%`, hint: `Visitante ${awayShare}%` },
    { label: "Eventos", value: totalAnotaciones, hint: "Anotaciones registradas" },
  ];
}

export function buildChronology(result: Resultado): TimelineEvent[] {
  const labels = getSportLabels(result.deporte);
  const timeline: TimelineEvent[] = [
    {
      id: `kickoff-${result.id}`,
      minute: "0'",
      title: "Inicio del encuentro",
      description: `${result.equipoLocal} recibe a ${result.equipoVisitante}.`,
      accent: "slate",
    },
  ];

  if (result.anotaciones.length === 0) {
    timeline.push({
      id: `no-events-${result.id}`,
      minute: "-",
      title: `Sin ${labels.plural}`,
      description: `No se registraron ${labels.plural} individuales en este encuentro.`,
      accent: "amber",
    });
  } else {
    result.anotaciones.forEach((item, index) => {
      const minute = `${String(Math.min(90, 8 + index * 9)).padStart(2, "0")}'`;
      timeline.push({
        id: `${item.participanteId}-${index}`,
        minute,
        title: `${item.participanteNombreCompleto}`,
        description: `${item.cantidad} ${item.cantidad === 1 ? labels.singular : labels.plural} para ${item.equipoNombre}.`,
        accent: index % 2 === 0 ? "blue" : "green",
      });
    });
  }

  timeline.push({
    id: `final-${result.id}`,
    minute: "FT",
    title: "Cierre oficial",
    description: `Marcador final ${result.puntajeLocal}-${result.puntajeVisitante}.`,
    accent: result.puntajeLocal === result.puntajeVisitante ? "amber" : "slate",
  });

  return timeline;
}

export function buildGroupSummary(result: Resultado) {
  const local = result.anotaciones.filter((item) => normalizeText(item.equipoNombre) === normalizeText(result.equipoLocal));
  const visitante = result.anotaciones.filter((item) => normalizeText(item.equipoNombre) === normalizeText(result.equipoVisitante));

  return {
    local,
    visitante,
  };
}
