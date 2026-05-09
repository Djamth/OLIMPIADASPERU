"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { deporteService, sorteoService } from "@/services/crudServices";
import type { Deporte, Grupo } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useEffect, useState } from "react";

export function SorteosClient() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [deporteId, setDeporteId] = useState<number>(0);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deporteService.list()
      .then((items) => {
        setDeportes(items);
        setDeporteId(items[0]?.id ?? 0);
      })
      .catch((error) => alerts.error("Error al cargar deportes", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!deporteId) return;
    sorteoService.listarGrupos(deporteId)
      .then(setGrupos)
      .catch(() => setGrupos([]));
  }, [deporteId]);

  const generar = async () => {
    const result = await alerts.confirm("Generar sorteo", "Se reemplazaran los grupos existentes del deporte seleccionado.");
    if (!result.isConfirmed || !deporteId) return;
    alerts.loading("Generando grupos");
    try {
      const data = await sorteoService.generarGrupos(deporteId);
      alerts.close();
      setGrupos(data);
      await alerts.success("Sorteo generado");
    } catch (error) {
      alerts.close();
      await alerts.error("No se pudo generar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Sorteos"
        description="Genera series aleatorias por deporte con equipos confirmados."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={generar} disabled={!deporteId}><i className="bi bi-shuffle me-2" />Generar sorteo</button>}
      />

      <div className="surface-card p-4 mb-4">
        <label className="form-label fw-semibold">Deporte</label>
        <select className="form-select" value={deporteId} onChange={(e) => setDeporteId(Number(e.target.value))}>
          {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
        </select>
      </div>

      {loading ? <LoadingState /> : grupos.length === 0 ? (
        <EmptyState title="Sin grupos generados" description="Genera el sorteo cuando tengas al menos dos equipos confirmados." icon="bi-shuffle" />
      ) : (
        <div className="row g-4">
          {grupos.map((grupo) => (
            <div className="col-12 col-lg-6 col-xl-4" key={grupo.id}>
              <div className="surface-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 mb-0">{grupo.nombre}</h3>
                  <span className="badge bg-primary-subtle text-primary">{grupo.deporteNombre}</span>
                </div>
                <ol className="list-group list-group-numbered">
                  {grupo.equipos.map((equipo) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={equipo.equipoId}>
                      {equipo.equipoNombre}
                      <span className="badge text-bg-light">Pos. {equipo.posicion}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
