"use client";

import { Badge } from "@/components/common/Badge";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { fieldClass } from "@/components/common/formStyles";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useTableControls } from "@/hooks/useTableControls";
import { deporteService, estadisticaService } from "@/services/crudServices";
import type { Deporte, Goleador, RankingEquipo } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { SecondaryButton } from "@/components/common/Buttons";

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
  const [deporteId, setDeporteId] = useState<number>(0);
  const [ranking, setRanking] = useState<RankingEquipo[]>([]);
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [loading, setLoading] = useState(true);
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
    deporteService.list()
      .then((items) => {
        setDeportes(items);
        setDeporteId(items[0]?.id ?? 0);
      })
      .catch((error) => alerts.error("Error al cargar deportes", getErrorMessage(error)));
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

  const downloadReport = async (format: "pdf" | "excel") => {
    if (!deporteId) return;
    setDownloading(format);
    try {
      await estadisticaService.descargarReporte(deporteId, format);
      await alerts.success("Reporte generado", `El archivo ${format.toUpperCase()} se descargo correctamente.`);
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
        description="Consulta puntos por equipo, ranking por deporte y estadísticas individuales."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select className={`${fieldClass} max-w-64`} value={deporteId} onChange={(e) => setDeporteId(Number(e.target.value))}>
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
