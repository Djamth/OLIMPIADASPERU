"use client";

import { Badge } from "@/components/common/Badge";
import { publicDashboardService } from "@/services/adminServices";
import type {
  DashboardRecentResult,
  DashboardUpcomingMatch,
  PublicDashboardResumen,
} from "@/types/admin";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Medal,
  Search,
  Shield,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const metricIcons = [UsersRound, Shield, CalendarDays, Medal];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha por definir";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getMatchParts(encuentro: string) {
  const [local, visitante] = encuentro.split(" vs ");
  return {
    local: local?.trim() || "Equipo local",
    visitante: visitante?.trim() || "Equipo visitante",
  };
}

function buildTable(results: DashboardRecentResult[]) {
  const table = new Map<
    string,
    { team: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }
  >();

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

function statusTone(estado: string): "blue" | "green" | "red" | "amber" | "slate" {
  if (estado === "PROGRAMADO") return "blue";
  if (estado === "FINALIZADO") return "green";
  if (estado === "REPROGRAMADO") return "amber";
  return "slate";
}

function MatchCard({ match }: { match: DashboardUpcomingMatch }) {
  const { local, visitante } = getMatchParts(match.encuentro);

  return (
    <article className="group border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_65px_rgba(15,23,42,0.14)]">
      <div className="mb-5 flex items-center justify-between">
        <Badge tone="blue">{match.deporte}</Badge>
        <Badge tone={statusTone(match.estado)}>{match.estado}</Badge>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="min-w-0 text-right">
          <p className="truncate text-lg font-black text-slate-950">{local}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Local</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">VS</div>
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-slate-950">{visitante}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Visitante</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <CalendarDays size={17} className="text-blue-700" />
          {formatDate(match.fechaHora)}
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <Trophy size={17} className="text-red-600" />
          {match.sede}
        </div>
      </div>
    </article>
  );
}

function ResultCard({ result }: { result: DashboardRecentResult }) {
  const { local, visitante } = getMatchParts(result.encuentro);

  return (
    <article className="border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <div className="mb-4 flex items-center justify-between">
        <Badge tone="slate">{result.deporte}</Badge>
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Resultado</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <p className="truncate text-right text-sm font-black text-slate-700">{local}</p>
        <strong className="text-3xl font-black text-blue-700">
          {result.puntajeLocal} - {result.puntajeVisitante}
        </strong>
        <p className="truncate text-sm font-black text-slate-700">{visitante}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">Ganador: {result.ganador}</p>
    </article>
  );
}

export default function PublicHomePage() {
  const [summary, setSummary] = useState<PublicDashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicDashboardService
      .resumen()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  const proximasContiendas = useMemo(() => summary?.proximasContiendas ?? [], [summary]);
  const ultimosResultados = useMemo(() => summary?.ultimosResultados ?? [], [summary]);
  const nextMatch = proximasContiendas[0];
  const standings = useMemo(() => buildTable(ultimosResultados), [ultimosResultados]);

  return (
    <main className="min-h-screen bg-[#061225] text-slate-950">
      <section id="inicio" className="relative isolate min-h-screen overflow-hidden bg-[#061225] text-white">
        <div className="absolute inset-0 bg-[url('/images/public-hero-athlete.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_38%,rgba(11,77,255,0.10),transparent_28%),linear-gradient(90deg,rgba(3,7,18,0.94)_0%,rgba(3,7,18,0.68)_38%,rgba(3,7,18,0.18)_68%,rgba(3,7,18,0.78)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#061225] to-transparent" />
        <div className="absolute bottom-12 right-[8%] hidden h-28 w-28 rounded-full bg-[url('/images/public-ball.png')] bg-cover bg-center opacity-70 shadow-[0_28px_80px_rgba(14,165,233,0.35)] ring-1 ring-white/15 lg:block" />
        <div className="absolute left-6 top-32 hidden text-[13rem] font-black uppercase leading-none tracking-normal text-white/[0.035] xl:block">
          Olimpiadas
        </div>

        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-7 lg:px-8">
          <a className="flex items-center gap-3" href="#inicio" aria-label="Olimpiadas Perú">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-[0_18px_50px_rgba(239,68,68,0.35)]">
              <Trophy size={24} />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.16em]">Olimpiadas Perú</span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300">Portal deportivo</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-[11px] font-black uppercase tracking-[0.18em] text-slate-300 lg:flex">
            <a className="text-red-400 transition hover:text-white" href="#inicio">Inicio</a>
            <a className="transition hover:text-white" href="#encuentros">Evento</a>
            <a className="transition hover:text-white" href="#resultados">Resultados</a>
            <a className="transition hover:text-white" href="#clasificacion">Clasificación</a>
            <a className="transition hover:text-white" href="#estadisticas">Estadísticas</a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-11 w-56 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-sm font-semibold text-slate-300 backdrop-blur-xl">
              <Search size={16} />
              <span>Buscar evento...</span>
            </div>
            <a className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-red-600" href="#encuentros" aria-label="Ver encuentros">
              <CalendarDays size={18} />
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6.75rem)] max-w-7xl items-center gap-10 px-5 pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="max-w-2xl pt-16 lg:pt-0">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-400">Bienvenido</p>
            <h1 className="mt-4 max-w-xl text-5xl font-black uppercase leading-[0.96] tracking-normal text-white sm:text-7xl lg:text-8xl">
              Olimpiadas Perú
            </h1>
            <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-slate-300">
              Sigue la programación, resultados, clasificación y estadísticas del torneo interno en tiempo real.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex h-12 items-center justify-center rounded-full bg-red-600 px-8 text-sm font-black text-white shadow-[0_20px_50px_rgba(220,38,38,0.35)] transition hover:-translate-y-0.5 hover:bg-red-500" href="#clasificacion">
                Ver clasificación
                <ArrowRight className="ml-2" size={18} />
              </a>
              <a className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-8 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15" href="#resultados">
                Últimos resultados
              </a>
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="w-full max-w-sm border border-white/10 bg-slate-950/55 p-5 shadow-[0_35px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Próximo encuentro</p>
              {nextMatch ? (
                <>
                  <h2 className="mt-4 text-2xl font-black leading-tight text-white">{nextMatch.encuentro}</h2>
                  <div className="mt-5 grid gap-3 text-sm font-bold text-slate-300">
                    <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-3 py-3">
                      <CalendarDays size={18} className="text-sky-300" />
                      {formatDate(nextMatch.fechaHora)}
                    </div>
                    <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-3 py-3">
                      <Trophy size={18} className="text-red-400" />
                      {nextMatch.sede}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <Badge tone="blue">{nextMatch.deporte}</Badge>
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{nextMatch.estado}</span>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">Todavía no hay encuentros programados.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#061225] px-5 py-16 text-white lg:px-8">
        <div className="absolute inset-0 bg-[url('/images/public-stadium-bg.png')] bg-cover bg-center opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,18,37,0.96),rgba(6,18,37,0.78)_46%,rgba(6,18,37,0.94)),radial-gradient(circle_at_72%_45%,rgba(11,77,255,0.24),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Evento principal</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black uppercase leading-tight tracking-normal">
              Toda la olimpiada en un solo portal deportivo
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
              Consulta programacion, resultados y clasificacion sin entrar al panel administrativo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {(summary?.metricas ?? []).slice(0, 3).map((metric) => (
              <div className="border border-white/10 bg-white/10 p-4 backdrop-blur-xl" key={metric.title}>
                <div className="text-3xl font-black">{metric.value}</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-300">{metric.title}</div>
              </div>
            ))}
            {loading && (
              <div className="border border-white/10 bg-white/10 p-4 text-sm font-bold text-slate-300 backdrop-blur-xl">
                Cargando resumen publico...
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {ultimosResultados.slice(0, 3).map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
          {!loading && ultimosResultados.length === 0 && (
            <div className="border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500 md:col-span-3">
              No hay resultados publicados todavía.
            </div>
          )}
        </div>
      </section>

      <section id="clasificacion" className="relative overflow-hidden bg-[#061225] px-5 py-20 lg:px-8">
        <div className="absolute inset-0 bg-[url('/images/public-ranking-bg.png')] bg-cover bg-center opacity-65" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,18,37,0.82),rgba(6,18,37,0.94)),radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.22),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Tabla</p>
            <h2 className="mt-2 text-4xl font-black uppercase tracking-normal text-white">Clasificación general</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
              Posiciones calculadas con los marcadores publicados del torneo.
            </p>
          </div>

          <div className="overflow-hidden border border-white/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Pos</th>
                    <th className="px-5 py-4">Equipo</th>
                    <th className="px-5 py-4">PJ</th>
                    <th className="px-5 py-4">G</th>
                    <th className="px-5 py-4">E</th>
                    <th className="px-5 py-4">D</th>
                    <th className="px-5 py-4">GF</th>
                    <th className="px-5 py-4">GC</th>
                    <th className="px-5 py-4">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.map((item, index) => (
                    <tr className="font-bold text-slate-700" key={item.team}>
                      <td className="px-5 py-4 text-slate-400">{index + 1}</td>
                      <td className="px-5 py-4 font-black text-slate-950">{item.team}</td>
                      <td className="px-5 py-4">{item.p}</td>
                      <td className="px-5 py-4">{item.w}</td>
                      <td className="px-5 py-4">{item.d}</td>
                      <td className="px-5 py-4">{item.l}</td>
                      <td className="px-5 py-4">{item.gf}</td>
                      <td className="px-5 py-4">{item.ga}</td>
                      <td className="px-5 py-4 font-black text-blue-700">{item.pts}</td>
                    </tr>
                  ))}
                  {!loading && standings.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm font-bold text-slate-500" colSpan={9}>
                        La tabla se formará cuando existan resultados publicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="encuentros" className="relative overflow-hidden bg-[#061225] px-5 py-20 text-white lg:px-8">
        <div className="absolute inset-0 bg-[url('/images/public-sports-texture-bg.png')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061225]/80 via-[#061225]/92 to-[#061225]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Evento</p>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-normal">Proximos encuentros</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-7 text-slate-300">
              Programación oficial del torneo por deporte, sede y horario.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {proximasContiendas.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {!loading && proximasContiendas.length === 0 && (
              <div className="border border-white/10 bg-white/5 p-5 text-sm font-bold text-slate-300">
                No hay encuentros programados para mostrar.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="resultados" className="bg-slate-50 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">Marcadores</p>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-normal text-slate-950">Últimos resultados</h2>
            </div>
            <a className="inline-flex items-center text-sm font-black text-blue-700" href="#clasificacion">
              Ver tabla completa <ChevronRight size={18} />
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ultimosResultados.slice(0, 6).map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
            {!loading && ultimosResultados.length === 0 && (
              <div className="border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
                No hay resultados publicados todavía.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="estadisticas" className="relative overflow-hidden bg-white px-5 py-20 lg:px-8">
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-100 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">Estadísticas</p>
            <h2 className="mt-2 text-4xl font-black uppercase tracking-normal text-slate-950">
              Rendimiento del torneo
            </h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
              Indicadores públicos del avance deportivo: equipos, participantes, partidos y resultados registrados.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(summary?.metricas ?? []).map((metric, index) => {
              const Icon = metricIcons[index] ?? Trophy;
              return (
                <article className="border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)]" key={metric.title}>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center bg-blue-50 text-blue-700">
                      <Icon size={21} />
                    </span>
                    <Clock3 size={17} className="text-slate-300" />
                  </div>
                  <div className="text-3xl font-black text-slate-950">{metric.value}</div>
                  <div className="mt-1 text-sm font-black text-slate-700">{metric.title}</div>
                  <div className="mt-3 text-xs font-black uppercase text-emerald-600">{metric.change}</div>
                </article>
              );
            })}
            {loading && (
              <div className="border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500 sm:col-span-2 xl:col-span-4">
                Cargando información pública...
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
