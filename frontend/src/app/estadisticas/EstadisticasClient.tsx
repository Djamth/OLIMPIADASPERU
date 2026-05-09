"use client";

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
          <select className="form-select" style={{ maxWidth: 260 }} value={deporteId} onChange={(e) => setDeporteId(Number(e.target.value))}>
            {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
          </select>
        }
      />

      {loading ? <LoadingState /> : ranking.length === 0 && goleadores.length === 0 ? (
        <EmptyState title="Sin estadisticas" description="Registra resultados para generar ranking y anotadores." icon="bi-graph-up-arrow" />
      ) : (
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="surface-card p-4 h-100">
              <h3 className="h5 mb-3">Ranking de equipos</h3>
              <TableToolbar
                query={rankingTable.query}
                onQueryChange={rankingTable.setQuery}
                pageSize={rankingTable.pageSize}
                onPageSizeChange={rankingTable.setPageSize}
                totalItems={rankingTable.totalItems}
                filteredItems={rankingTable.filteredItems}
                placeholder="Buscar equipo..."
              />
              <div className="table-responsive">
                <table className="table table-modern align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Equipo</th>
                      <th>PJ</th>
                      <th>V</th>
                      <th>E</th>
                      <th>D</th>
                      <th>GF</th>
                      <th>GC</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingTable.pageItems.map((item) => (
                      <tr key={item.equipo}>
                        <td className="fw-semibold">{item.equipo}</td>
                        <td>{item.partidosJugados}</td>
                        <td>{item.victorias}</td>
                        <td>{item.empates}</td>
                        <td>{item.derrotas}</td>
                        <td>{item.tantosFavor}</td>
                        <td>{item.tantosContra}</td>
                        <td><span className="badge text-bg-dark">{item.puntos}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls page={rankingTable.page} totalPages={rankingTable.totalPages} onPageChange={rankingTable.setPage} />
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="surface-card p-4 h-100">
              <h3 className="h5 mb-3">Anotadores</h3>
              <div className="list-group list-group-flush">
                {goleadores.map((item, index) => (
                  <div className="list-group-item px-0 d-flex justify-content-between align-items-center" key={`${item.nombre}-${index}`}>
                    <div>
                      <div className="fw-semibold">{item.nombre}</div>
                      <div className="small text-soft">Participante</div>
                    </div>
                    <span className="badge bg-danger">{item.anotaciones}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
