import { Badge } from "@/components/common/Badge";
import type {
  DashboardMetric,
  DashboardRecentResult,
  DashboardUpcomingMatch,
} from "@/types/admin";
import { ArrowRight, CalendarDays, ChevronRight, Clock3, Shield, Trophy, UsersRound, Medal } from "lucide-react";
import { MatchCard, ResultCard } from "./PublicPortalCards";
import { PublicPortalNavbar } from "./PublicPortalNavbar";
import { StandingsTable } from "./StandingsTable";
import { formatPublicDate, type StandingRow } from "./publicPortalUtils";

const metricIcons = [UsersRound, Shield, CalendarDays, Medal];

type HeroSectionProps = {
  nextMatch?: DashboardUpcomingMatch;
};

export function HeroSection({ nextMatch }: HeroSectionProps) {
  return (
    <section id="inicio" className="public-scroll-section relative isolate min-h-screen overflow-hidden bg-[#061225] text-white">
      <div className="absolute inset-0 bg-[url('/images/public-hero-athlete.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_38%,rgba(11,77,255,0.10),transparent_28%),linear-gradient(90deg,rgba(3,7,18,0.94)_0%,rgba(3,7,18,0.68)_38%,rgba(3,7,18,0.18)_68%,rgba(3,7,18,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#061225] to-transparent" />
      <div className="absolute bottom-12 right-[8%] hidden h-28 w-28 rounded-full bg-[url('/images/public-ball.png')] bg-cover bg-center opacity-70 shadow-[0_28px_80px_rgba(14,165,233,0.35)] ring-1 ring-white/15 lg:block" />
      <div className="absolute left-6 top-32 hidden text-[13rem] font-black uppercase leading-none tracking-normal text-white/[0.035] xl:block">
        Olimpiadas
      </div>

      <PublicPortalNavbar />

      <div className="public-section-inner relative z-10 mx-auto grid min-h-[calc(100vh-6.75rem)] max-w-7xl items-center gap-10 px-5 pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-2xl pt-16 lg:pt-0">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-400">Bienvenido</p>
          <h1 className="mt-4 max-w-xl text-5xl font-black uppercase leading-[0.96] tracking-normal text-white sm:text-7xl lg:text-8xl">
            Olimpiadas Peru
          </h1>
          <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-slate-300">
            Sigue la programacion, resultados, clasificacion y estadisticas del torneo interno en tiempo real.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex h-12 items-center justify-center rounded-full bg-red-600 px-8 text-sm font-black text-white shadow-[0_20px_50px_rgba(220,38,38,0.35)] transition hover:-translate-y-0.5 hover:bg-red-500" href="#clasificacion">
              Ver clasificacion
              <ArrowRight className="ml-2" size={18} />
            </a>
            <a className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-8 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15" href="#resultados">
              Ultimos resultados
            </a>
          </div>
        </div>

        <div className="hidden justify-end lg:flex">
          <div className="w-full max-w-sm border border-white/10 bg-slate-950/55 p-5 shadow-[0_35px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Proximo encuentro</p>
            {nextMatch ? (
              <>
                <h2 className="mt-4 text-2xl font-black leading-tight text-white">{nextMatch.encuentro}</h2>
                <div className="mt-5 grid gap-3 text-sm font-bold text-slate-300">
                  <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-3 py-3">
                    <CalendarDays size={18} className="text-sky-300" />
                    {formatPublicDate(nextMatch.fechaHora)}
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
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">Todavia no hay encuentros programados.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventSummarySection({ metrics, loading }: { metrics: DashboardMetric[]; loading: boolean }) {
  return (
    <section className="public-scroll-section relative flex min-h-screen items-center overflow-hidden bg-[#061225] px-5 py-20 text-white lg:px-8">
      <div className="absolute inset-0 bg-[url('/images/public-stadium-bg.png')] bg-cover bg-center opacity-55" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,18,37,0.96),rgba(6,18,37,0.78)_46%,rgba(6,18,37,0.94)),radial-gradient(circle_at_72%_45%,rgba(11,77,255,0.24),transparent_34%)]" />
      <div className="public-section-inner relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
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
          {metrics.slice(0, 3).map((metric) => (
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
  );
}

export function FeaturedResultsSection({ results, loading }: { results: DashboardRecentResult[]; loading: boolean }) {
  return (
    <section className="public-scroll-section flex min-h-screen items-center bg-slate-50 px-5 py-20 lg:px-8">
      <div className="public-section-inner mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-3">
        {results.slice(0, 3).map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
        {!loading && results.length === 0 && (
          <div className="border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500 md:col-span-3">
            No hay resultados publicados todavia.
          </div>
        )}
      </div>
    </section>
  );
}

export function StandingsSection({ standings, loading }: { standings: StandingRow[]; loading: boolean }) {
  return (
    <section id="clasificacion" className="public-scroll-section relative flex min-h-screen items-center overflow-hidden bg-[#061225] px-5 py-20 lg:px-8">
      <div className="absolute inset-0 bg-[url('/images/public-ranking-bg.png')] bg-cover bg-center opacity-65" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,18,37,0.82),rgba(6,18,37,0.94)),radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.22),transparent_32%)]" />
      <div className="public-section-inner relative mx-auto w-full max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Tabla</p>
          <h2 className="mt-2 text-4xl font-black uppercase tracking-normal text-white">Clasificacion general</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
            Posiciones calculadas con los marcadores publicados del torneo.
          </p>
        </div>

        <StandingsTable standings={standings} loading={loading} />
      </div>
    </section>
  );
}

export function UpcomingMatchesSection({ matches, loading }: { matches: DashboardUpcomingMatch[]; loading: boolean }) {
  return (
    <section id="encuentros" className="public-scroll-section relative flex min-h-screen items-center overflow-hidden bg-[#061225] px-5 py-20 text-white lg:px-8">
      <div className="absolute inset-0 bg-[url('/images/public-sports-texture-bg.png')] bg-cover bg-center opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061225]/80 via-[#061225]/92 to-[#061225]" />
      <div className="public-section-inner relative mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Evento</p>
            <h2 className="mt-2 text-4xl font-black uppercase tracking-normal">Proximos encuentros</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-7 text-slate-300">
            Programacion oficial del torneo por deporte, sede y horario.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {!loading && matches.length === 0 && (
            <div className="border border-white/10 bg-white/5 p-5 text-sm font-bold text-slate-300">
              No hay encuentros programados para mostrar.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ResultsSection({ results, loading }: { results: DashboardRecentResult[]; loading: boolean }) {
  return (
    <section id="resultados" className="public-scroll-section flex min-h-screen items-center bg-slate-50 px-5 py-20 lg:px-8">
      <div className="public-section-inner mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">Marcadores</p>
            <h2 className="mt-2 text-4xl font-black uppercase tracking-normal text-slate-950">Ultimos resultados</h2>
          </div>
          <a className="inline-flex items-center text-sm font-black text-blue-700" href="#clasificacion">
            Ver tabla completa <ChevronRight size={18} />
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.slice(0, 6).map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
          {!loading && results.length === 0 && (
            <div className="border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
              No hay resultados publicados todavia.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function StatsSection({ metrics, loading }: { metrics: DashboardMetric[]; loading: boolean }) {
  return (
    <section id="estadisticas" className="public-scroll-section relative flex min-h-screen items-center overflow-hidden bg-white px-5 py-20 lg:px-8">
      <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-100 blur-3xl" />
      <div className="public-section-inner relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">Estadisticas</p>
          <h2 className="mt-2 text-4xl font-black uppercase tracking-normal text-slate-950">
            Rendimiento del torneo
          </h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
            Indicadores publicos del avance deportivo: equipos, participantes, partidos y resultados registrados.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => {
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
              Cargando informacion publica...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
