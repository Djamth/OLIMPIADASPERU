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

export function EstadisticasClient() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [deporteId, setDeporteId] = useState<number>(0);
  const [ranking, setRanking] = useState<RankingEquipo[]>([]);
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [loading, setLoading] = useState(true);
  const rankingTable = useTableControls(ranking, (item, query) =>
    [item.equipo, String(item.puntos), String(item.partidosJugados)].some((value) => value.toLowerCase().includes(query)),
  );

  const rankingColumns: DataTableColumn<RankingEquipo>[] = [
    { key: "equipo", header: "Equipo", render: (item) => <span className="font-bold text-slate-950">{item.equipo}</span> },
    { key: "pj", header: "PJ", render: (item) => item.partidosJugados },
    { key: "v", header: "V", render: (item) => item.victorias },
    { key: "e", header: "E", render: (item) => item.empates },
    { key: "d", header: "D", render: (item) => item.derrotas },
    { key: "gf", header: "GF", render: (item) => item.tantosFavor },
    { key: "gc", header: "GC", render: (item) => item.tantosContra },
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
      .catch((error) => alerts.error("Error al cargar estadisticas", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [deporteId]);

  return (
    <>
      <PageHeader
        title="Estadisticas"
        description="Consulta ranking de equipos y tabla de anotadores por deporte."
        action={
          <select className={`${fieldClass} max-w-64`} value={deporteId} onChange={(e) => setDeporteId(Number(e.target.value))}>
            {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
          </select>
        }
      />

      {loading ? <LoadingState /> : ranking.length === 0 && goleadores.length === 0 ? (
        <EmptyState title="Sin estadisticas" description="Registra resultados para generar ranking y anotadores." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <h3 className="mb-3 text-lg font-extrabold text-slate-950">Ranking de equipos</h3>
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
              <h3 className="mb-3 text-lg font-extrabold text-slate-950">Anotadores</h3>
              <div className="divide-y divide-slate-100">
                {goleadores.map((item, index) => (
                  <div className="flex items-center justify-between gap-3 py-3" key={`${item.nombre}-${index}`}>
                    <div>
                      <div className="font-bold text-slate-950">{item.nombre}</div>
                      <div className="text-xs font-semibold text-slate-500">Participante</div>
                    </div>
                    <Badge tone="red">{item.anotaciones}</Badge>
                  </div>
                ))}
              </div>
          </div>
        </div>
      )}
    </>
  );
}
