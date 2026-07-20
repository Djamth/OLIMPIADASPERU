"use client";

import { Badge } from "@/components/common/Badge";
import { CountryFlag } from "@/components/common/CountryFlag";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { useTableControls } from "@/hooks/useTableControls";
import { deporteService, estadisticaService, eventoService, reporteEjecutivoService } from "@/services/crudServices";
import type { Deporte, Evento, Goleador, RankingEquipo, ReporteEjecutivo } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { getSportMeta, SportChip } from "@/components/sports/SportUi";
import { ArrowRight, Award, BarChart3, CalendarDays, Download, FileSpreadsheet, Medal, Search, Sparkles, Trophy, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function getSportLabels(deporte?: string) {
  const normalized = (deporte ?? "").toUpperCase();
  if (normalized.includes("FUTBOL") || normalized.includes("FUTSAL")) {
    return { rankingFor: "GF", rankingAgainst: "GC", rankingTitle: "Puntos por equipo", individualTitle: "Goleadores", amount: "goles" };
  }
  if (normalized.includes("BASQUET")) {
    return { rankingFor: "PF", rankingAgainst: "PC", rankingTitle: "Puntos por equipo", individualTitle: "Encestadores", amount: "puntos" };
  }
  if (normalized.includes("VOLEY")) {
    return { rankingFor: "SF", rankingAgainst: "SC", rankingTitle: "Ranking por sets", individualTitle: "Sets por participante", amount: "sets" };
  }
  if (normalized.includes("PING")) {
    return { rankingFor: "PF/SF", rankingAgainst: "PC/SC", rankingTitle: "Ranking por puntos/sets", individualTitle: "Puntos/Sets por participante", amount: "puntos/sets" };
  }
  return { rankingFor: "AF", rankingAgainst: "AC", rankingTitle: "Ranking por deporte", individualTitle: "Estadísticas individuales", amount: "anotaciones" };
}

function StatTile({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint: string; icon: typeof Trophy }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={18} />
      </div>
      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</div>
      <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p>
    </article>
  );
}

function RankingCard({
  item,
  index,
  maxPoints,
  labels,
}: {
  item: RankingEquipo;
  index: number;
  maxPoints: number;
  labels: ReturnType<typeof getSportLabels>;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-700 text-sm font-black text-white shadow-sm">#{index + 1}</span>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">{item.equipo}</p>
              <p className="text-xs font-semibold text-slate-500">{item.partidosJugados} partidos · {item.victorias} victorias · {item.empates} empates</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="blue">{labels.rankingFor} {item.tantosFavor}</Badge>
            <Badge tone="slate">{labels.rankingAgainst} {item.tantosContra}</Badge>
          </div>
        </div>

        <div className="min-w-[220px] rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <span>Puntos</span>
            <span>{item.puntos}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" style={{ width: `${Math.max(8, (item.puntos / maxPoints) * 100)}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}

function GoleadorCard({ item, maxScore, amount }: { item: Goleador; maxScore: number; amount: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">{item.nombre}</p>
          <p className="text-xs font-semibold text-slate-500">{item.equipo} · {item.indicador}</p>
        </div>
        <Badge tone="red">{item.anotaciones}</Badge>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${Math.max(10, (item.anotaciones / maxScore) * 100)}%` }} />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-500">{item.anotaciones} {amount}</p>
    </article>
  );
}

function ReportPanel({ report }: { report: ReporteEjecutivo }) {
  return (
    <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Award className="text-blue-700" size={20} />
          <h3 className="text-lg font-black text-slate-950">Ranking por país</h3>
        </div>
        <div className="space-y-2">
          {report.rankingPaises.slice(0, 6).map((item, index) => (
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.paisId}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-black text-white">#{index + 1}</span>
                <CountryFlag code={item.bandera} countryName={item.pais} className="h-5 w-5 rounded-full" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{item.pais}</p>
                  <p className="text-xs font-semibold text-slate-500">V {item.victorias} · E {item.empates} · D {item.derrotas}</p>
                </div>
              </div>
              <Badge tone="blue">{item.puntos} pts</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Medal className="text-amber-500" size={20} />
          <h3 className="text-lg font-black text-slate-950">Medallero</h3>
        </div>
        <div className="space-y-2">
          {report.medallero.length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">Registra resultados para calcular medallas.</p>
          ) : report.medallero.map((item) => (
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.paisId}>
              <div className="flex min-w-0 items-center gap-2">
                <CountryFlag code={item.bandera} countryName={item.pais} className="h-5 w-5 rounded-full" />
                <span className="truncate text-sm font-black text-slate-950">{item.pais}</span>
              </div>
              <span className="text-sm font-black text-slate-700">O {item.oro} · P {item.plata} · B {item.bronce}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UsersRound className="text-emerald-600" size={20} />
          <h3 className="text-lg font-black text-slate-950">Participantes por institución</h3>
        </div>
        <div className="space-y-2">
          {report.participantesPorInstitucion.map((item) => (
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.institucionId}>
              <div>
                <p className="text-sm font-black text-slate-950">{item.institucion}</p>
                <p className="text-xs font-semibold text-slate-500">{item.equipos} equipos</p>
              </div>
              <Badge tone="green">{item.participantes} participantes</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="text-blue-700" size={20} />
          <h3 className="text-lg font-black text-slate-950">Fixture completo</h3>
        </div>
        <div className="max-h-80 space-y-2 overflow-auto pr-1">
          {report.fixture.map((item) => (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.partidoId}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-slate-950">{item.equipoLocal} vs {item.equipoVisitante}</p>
                <Badge tone={item.estado === "FINALIZADO" ? "green" : "blue"}>{item.estado}</Badge>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">{item.deporte} · {item.grupo} · {item.sede}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EstadisticasClient() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [deporteId, setDeporteId] = useState<number>(0);
  const [eventoId, setEventoId] = useState<number>(0);
  const [ranking, setRanking] = useState<RankingEquipo[]>([]);
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [reporte, setReporte] = useState<ReporteEjecutivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "excel" | null>(null);
  const [downloadingExecutive, setDownloadingExecutive] = useState<"pdf" | "excel" | null>(null);
  const selectedDeporte = deportes.find((item) => item.id === deporteId);
  const labels = getSportLabels(selectedDeporte?.nombre);
  const rankingTable = useTableControls(ranking, (item, query) =>
    [item.equipo, String(item.puntos), String(item.partidosJugados)].some((value) => value.toLowerCase().includes(query)),
  );
  const sportChips = deportes.map((item) => ({ item, meta: getSportMeta(item.nombre) }));
  const maxRankPoints = Math.max(1, ...ranking.map((item) => item.puntos));
  const maxScorers = Math.max(1, ...goleadores.map((item) => item.anotaciones));

  useEffect(() => {
    Promise.all([deporteService.list(), eventoService.list()])
      .then(([deporteItems, eventoItems]) => {
        setDeportes(deporteItems);
        setDeporteId(deporteItems[0]?.id ?? 0);
        setEventos(eventoItems);
        setEventoId(eventoItems[0]?.id ?? 0);
      })
      .catch((error) => alerts.error("Error al cargar catálogos", getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!deporteId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([estadisticaService.ranking(deporteId), estadisticaService.goleadores(deporteId)])
      .then(([rankingData, goleadoresData]) => {
        setRanking(rankingData);
        setGoleadores(goleadoresData);
      })
      .catch((error) => alerts.error("Error al cargar estadísticas", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [deporteId]);

  useEffect(() => {
    if (!eventoId) return;
    setReportLoading(true);
    reporteEjecutivoService.obtener(eventoId)
      .then(setReporte)
      .catch((error) => alerts.error("Error al cargar reporte ejecutivo", getErrorMessage(error)))
      .finally(() => setReportLoading(false));
  }, [eventoId]);

  const downloadReport = async (format: "pdf" | "excel") => {
    if (!deporteId) return;
    setDownloading(format);
    try {
      await estadisticaService.descargarReporte(deporteId, format);
      await alerts.success("Reporte generado", `El archivo ${format.toUpperCase()} se descargó correctamente.`);
    } catch (error) {
      await alerts.error("No se pudo generar el reporte", getErrorMessage(error));
    } finally {
      setDownloading(null);
    }
  };

  const downloadExecutiveReport = async (format: "pdf" | "excel") => {
    if (!eventoId) return;
    setDownloadingExecutive(format);
    try {
      await reporteEjecutivoService.descargar(eventoId, format);
      await alerts.success("Reporte ejecutivo generado", `El archivo ${format.toUpperCase()} se descargó correctamente.`);
    } catch (error) {
      await alerts.error("No se pudo generar el reporte ejecutivo", getErrorMessage(error));
    } finally {
      setDownloadingExecutive(null);
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">Estadísticas deportivas</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-200 md:text-base">
              Explora rankings, goleadores y reportes .
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-100" type="button" onClick={() => void downloadReport("pdf")} disabled={!deporteId || Boolean(downloading)}>
              <Download size={16} />
              {downloading === "pdf" ? "Generando..." : "PDF deporte"}
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15" type="button" onClick={() => void downloadReport("excel")} disabled={!deporteId || Boolean(downloading)}>
              <FileSpreadsheet size={16} />
              {downloading === "excel" ? "Generando..." : "Excel deporte"}
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15" type="button" onClick={() => void downloadExecutiveReport("pdf")} disabled={!eventoId || Boolean(downloadingExecutive)}>
              <Download size={16} />
              {downloadingExecutive === "pdf" ? "Generando..." : "PDF ejecutivo"}
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15" type="button" onClick={() => void downloadExecutiveReport("excel")} disabled={!eventoId || Boolean(downloadingExecutive)}>
              <FileSpreadsheet size={16} />
              {downloadingExecutive === "excel" ? "Generando..." : "Excel ejecutivo"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Filtro rápido</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{selectedDeporte?.nombre ?? "Todos los deportes"}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Cambia de deporte con chips horizontales y sigue manteniendo el contexto del evento activo.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[240px_240px] xl:min-w-[520px]">
            <select className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none" value={eventoId} onChange={(event) => setEventoId(Number(event.target.value))}>
              {eventos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Buscar equipo, puntos o PJ..."
                value={rankingTable.query}
                onChange={(event) => rankingTable.setQuery(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <SportChip label="All Sports" icon={BarChart3} active={deporteId === 0} onClick={() => setDeporteId(0)} count={deportes.length} />
          {sportChips.map(({ item, meta }) => (
            <SportChip
              key={item.id}
              label={item.nombre}
              icon={meta.icon}
              active={deporteId === item.id}
              onClick={() => setDeporteId(item.id)}
              count={ranking.length}
            />
          ))}
        </div>
      </section>

      {reportLoading ? <LoadingState /> : reporte && <ReportPanel report={reporte} />}

      {loading ? (
        <LoadingState />
      ) : ranking.length === 0 && goleadores.length === 0 ? (
        <EmptyState title="Sin estadísticas" description="Registra resultados para generar ranking y anotadores." />
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(360px,1fr)]">
          <div className="space-y-4">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Equipos" value={ranking.length} hint="En el ranking" icon={Trophy} />
              <StatTile label="Puntos totales" value={ranking.reduce((sum, item) => sum + item.puntos, 0)} hint="Acumulado del deporte" icon={Award} />
              <StatTile label="Goleadores" value={goleadores.length} hint="Participantes destacados" icon={Medal} />
              <StatTile label="Eventos" value={eventos.length} hint="Disponibles en el selector" icon={CalendarDays} />
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-950">{labels.rankingTitle}</h3>
                  <p className="text-xs font-semibold text-slate-500">PJ: partidos jugados, V/E/D: victorias, empates y derrotas, Pts: puntaje acumulado.</p>
                </div>
                <Badge tone="slate">{rankingTable.filteredItems} visibles</Badge>
              </div>

              <div className="space-y-3">
                {rankingTable.pageItems.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    No hay equipos que coincidan con la búsqueda.
                  </div>
                ) : rankingTable.pageItems.map((item, index) => (
                  <RankingCard key={item.equipo} item={item} index={(rankingTable.page - 1) * rankingTable.pageSize + index} maxPoints={maxRankPoints} labels={labels} />
                ))}
              </div>

              <PaginationControls page={rankingTable.page} totalPages={rankingTable.totalPages} onPageChange={rankingTable.setPage} />
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Medal className="text-amber-500" size={20} />
                <div>
                  <h3 className="text-lg font-black text-slate-950">{labels.individualTitle}</h3>
                  <p className="text-xs font-semibold text-slate-500">Acumulado por participante a partir del detalle registrado en Resultados.</p>
                </div>
              </div>

              <div className="space-y-2">
                {goleadores.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-500">Registra resultados para visualizar el ranking individual.</p>
                ) : goleadores.map((item) => (
                  <GoleadorCard key={`${item.participanteId}-${item.nombre}`} item={item} maxScore={maxScorers} amount={labels.amount} />
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="text-blue-700" size={20} />
                <div>
                  <h3 className="text-lg font-black text-slate-950">Lectura rápida</h3>
                  <p className="text-xs font-semibold text-slate-500">Resumen visual del rendimiento del deporte seleccionado.</p>
                </div>
              </div>
              <div className="space-y-3">
                {ranking.slice(0, 4).map((item) => (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm" key={item.equipo}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950">{item.equipo}</p>
                        <p className="text-xs font-semibold text-slate-500">{item.victorias} victorias · {item.empates} empates · {item.derrotas} derrotas</p>
                      </div>
                      <Badge tone="blue">{item.puntos} pts</Badge>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" style={{ width: `${Math.max(8, (item.puntos / maxRankPoints) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
