"use client";

import { Badge } from "@/components/common/Badge";
import { SecondaryButton } from "@/components/common/Buttons";
import { CountryFlag } from "@/components/common/CountryFlag";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { fieldClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useTableControls } from "@/hooks/useTableControls";
import { deporteService, estadisticaService, eventoService, reporteEjecutivoService } from "@/services/crudServices";
import type { Deporte, Evento, Goleador, RankingEquipo, ReporteEjecutivo } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { Award, CalendarDays, Download, FileSpreadsheet, Medal, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

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
  const selectedDeporte = deportes.find((item) => item.id === deporteId);
  const labels = getSportLabels(selectedDeporte?.nombre);
  const rankingTable = useTableControls(ranking, (item, query) =>
    [item.equipo, String(item.puntos), String(item.partidosJugados)].some((value) => value.toLowerCase().includes(query)),
  );

  const rankingColumns: DataTableColumn<RankingEquipo>[] = [
    { key: "equipo", header: "Equipo", render: (item) => <span className="font-bold text-slate-950">{item.equipo}</span> },
    { key: "pj", header: "PJ", render: (item) => item.partidosJugados },
    { key: "v", header: "V", render: (item) => item.victorias },
    { key: "e", header: "E", render: (item) => item.empates },
    { key: "d", header: "D", render: (item) => item.derrotas },
    { key: "gf", header: labels.rankingFor, render: (item) => item.tantosFavor },
    { key: "gc", header: labels.rankingAgainst, render: (item) => item.tantosContra },
    { key: "pts", header: "Pts", render: (item) => <Badge tone="slate">{item.puntos}</Badge> },
  ];

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

  return (
    <>
      <PageHeader
        title="Estadísticas"
        description="Consulta puntos por equipo, ranking por país, medallero y estadísticas individuales."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select className={`${fieldClass} max-w-64`} value={eventoId} onChange={(event) => setEventoId(Number(event.target.value))}>
              {eventos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
            <select className={`${fieldClass} max-w-64`} value={deporteId} onChange={(event) => setDeporteId(Number(event.target.value))}>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
            <SecondaryButton disabled={!deporteId || Boolean(downloading)} onClick={() => void downloadReport("pdf")}>
              <Download size={16} />
              {downloading === "pdf" ? "Generando..." : "PDF"}
            </SecondaryButton>
            <SecondaryButton disabled={!deporteId || Boolean(downloading)} onClick={() => void downloadReport("excel")}>
              <FileSpreadsheet size={16} />
              {downloading === "excel" ? "Generando..." : "Excel"}
            </SecondaryButton>
          </div>
        }
      />

      {reportLoading ? <LoadingState /> : reporte && (
        <section className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Award className="text-blue-700" size={20} />
              <h3 className="text-lg font-black text-slate-950">Ranking por país</h3>
            </div>
            <div className="space-y-2">
              {reporte.rankingPaises.slice(0, 6).map((item, index) => (
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.paisId}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-black text-white">#{index + 1}</span>
                    <CountryFlag code={item.bandera} countryName={item.pais} />
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

          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Medal className="text-amber-500" size={20} />
              <h3 className="text-lg font-black text-slate-950">Medallero</h3>
            </div>
            <div className="space-y-2">
              {reporte.medallero.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">Registra resultados para calcular medallas.</p>
              ) : reporte.medallero.map((item) => (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.paisId}>
                  <div className="flex min-w-0 items-center gap-2">
                    <CountryFlag code={item.bandera} countryName={item.pais} />
                    <span className="truncate text-sm font-black text-slate-950">{item.pais}</span>
                  </div>
                  <span className="text-sm font-black text-slate-700">O {item.oro} · P {item.plata} · B {item.bronce}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <UsersRound className="text-emerald-600" size={20} />
              <h3 className="text-lg font-black text-slate-950">Participantes por institución</h3>
            </div>
            <div className="space-y-2">
              {reporte.participantesPorInstitucion.map((item) => (
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.institucionId}>
                  <div>
                    <p className="text-sm font-black text-slate-950">{item.institucion}</p>
                    <p className="text-xs font-semibold text-slate-500">{item.equipos} equipos</p>
                  </div>
                  <Badge tone="green">{item.participantes} participantes</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="text-blue-700" size={20} />
              <h3 className="text-lg font-black text-slate-950">Fixture completo</h3>
            </div>
            <div className="max-h-80 space-y-2 overflow-auto pr-1">
              {reporte.fixture.map((item) => (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2" key={item.partidoId}>
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
      )}

      {loading ? <LoadingState /> : ranking.length === 0 && goleadores.length === 0 ? (
        <EmptyState title="Sin estadísticas" description="Registra resultados para generar ranking y anotadores." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-3">
              <h3 className="text-lg font-extrabold text-slate-950">{labels.rankingTitle}</h3>
              <p className="text-xs font-semibold text-slate-500">
                PJ: partidos jugados, V/E/D: victorias, empates y derrotas, Pts: puntaje acumulado.
              </p>
            </div>
            <TableToolbar
              query={rankingTable.query}
              onQueryChange={rankingTable.setQuery}
              pageSize={rankingTable.pageSize}
              onPageSizeChange={rankingTable.setPageSize}
              totalItems={rankingTable.totalItems}
              filteredItems={rankingTable.filteredItems}
              placeholder="Buscar equipo..."
            />
            <DataTable columns={rankingColumns} items={rankingTable.pageItems} getRowKey={(item) => item.equipo} />
            <PaginationControls page={rankingTable.page} totalPages={rankingTable.totalPages} onPageChange={rankingTable.setPage} />
          </div>

          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-3">
              <h3 className="text-lg font-extrabold text-slate-950">{labels.individualTitle}</h3>
              <p className="text-xs font-semibold text-slate-500">
                Acumulado por participante a partir del detalle registrado en Resultados.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {goleadores.map((item, index) => (
                <div className="flex items-center justify-between gap-3 py-3" key={`${item.participanteId}-${index}`}>
                  <div>
                    <div className="font-bold text-slate-950">{item.nombre}</div>
                    <div className="text-xs font-semibold text-slate-500">{item.equipo} · {item.indicador}</div>
                  </div>
                  <Badge tone="red">{item.anotaciones} {labels.amount}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
