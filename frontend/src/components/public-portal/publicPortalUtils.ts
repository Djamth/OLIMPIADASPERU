import type { DashboardRecentResult } from "@/types/admin";

export type StandingRow = {
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
};

export function formatPublicDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha por definir";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getMatchParts(encuentro: string) {
  const [local, visitante] = encuentro.split(" vs ");
  return {
    local: local?.trim() || "Equipo local",
    visitante: visitante?.trim() || "Equipo visitante",
  };
}

export function buildPublicStandings(results: DashboardRecentResult[]) {
  const table = new Map<string, StandingRow>();

  const ensure = (team: string) => {
    if (!table.has(team)) {
      table.set(team, { team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
    }
    return table.get(team)!;
  };

  results.forEach((result) => {
    const { local, visitante } = getMatchParts(result.encuentro);
    const home = ensure(local);
    const away = ensure(visitante);

    home.p += 1;
    away.p += 1;
    home.gf += result.puntajeLocal;
    home.ga += result.puntajeVisitante;
    away.gf += result.puntajeVisitante;
    away.ga += result.puntajeLocal;

    if (result.puntajeLocal > result.puntajeVisitante) {
      home.w += 1;
      away.l += 1;
      home.pts += 3;
    } else if (result.puntajeLocal < result.puntajeVisitante) {
      away.w += 1;
      home.l += 1;
      away.pts += 3;
    } else {
      home.d += 1;
      away.d += 1;
      home.pts += 1;
      away.pts += 1;
    }
  });

  return Array.from(table.values())
    .sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga))
    .slice(0, 7);
}

export function statusTone(estado: string): "blue" | "green" | "red" | "amber" | "slate" {
  if (estado === "PROGRAMADO") return "blue";
  if (estado === "FINALIZADO") return "green";
  if (estado === "REPROGRAMADO") return "amber";
  return "slate";
}
