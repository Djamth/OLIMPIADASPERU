"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { participanteService, programacionService, resultadoService } from "@/services/crudServices";
import type { Participante, Partido, Resultado, ResultadoAnotacionRequest, ResultadoRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const emptyForm: ResultadoRequest = {
  partidoId: 0,
  puntajeLocal: 0,
  puntajeVisitante: 0,
  observaciones: "",
  anotaciones: [],
};

export function ResultadosClient() {
  const loader = useCallback(() => resultadoService.list(), []);
  const { data, loading, reload } = useAsyncList<Resultado>(loader);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resultado | null>(null);
  const [form, setForm] = useState<ResultadoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.equipoLocal, item.equipoVisitante, item.deporte, item.observaciones ?? "", String(item.puntajeLocal), String(item.puntajeVisitante)]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([programacionService.list(), participanteService.list()])
      .then(([partidosData, participantesData]) => {
        setPartidos(partidosData);
        setParticipantes(participantesData);
      })
      .catch((error) => alerts.error("Error al cargar datos", getErrorMessage(error)));
  }, []);

  const setAnotacion = (index: number, patch: Partial<ResultadoAnotacionRequest>) => {
    const anotaciones = [...(form.anotaciones ?? [])];
    anotaciones[index] = { ...anotaciones[index], ...patch };
    setForm({ ...form, anotaciones });
  };

  const addAnotacion = () => {
    setForm({
      ...form,
      anotaciones: [...(form.anotaciones ?? []), { participanteId: participantes[0]?.id ?? 0, cantidad: 1 }],
    });
  };

  const removeAnotacion = (index: number) => {
    setForm({
      ...form,
      anotaciones: (form.anotaciones ?? []).filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, partidoId: partidos[0]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Resultado) => {
    setEditing(item);
    setForm({
      partidoId: item.partidoId,
      puntajeLocal: item.puntajeLocal,
      puntajeVisitante: item.puntajeVisitante,
      observaciones: item.observaciones ?? "",
      anotaciones: item.anotaciones.map((anotacion) => ({
        participanteId: anotacion.participanteId,
        cantidad: anotacion.cantidad,
      })),
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Resultado registrado";
      if (editing) {
        await resultadoService.update(editing.id, form);
        message = "Resultado actualizado";
      } else {
        await resultadoService.create(form);
      }
      setOpen(false);
      await reload();
      await alerts.success(message);
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item: Resultado) => {
    const result = await alerts.confirm("Eliminar resultado", `${item.equipoLocal} vs ${item.equipoVisitante}.`);
    if (!result.isConfirmed) return;
    try {
      await resultadoService.remove(item.id);
      await alerts.success("Resultado eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Resultados"
        description="Carga marcadores y observaciones de cada partido."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={startCreate}><i className="bi bi-plus-circle me-2" />Registrar resultado</button>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin resultados" description="Registra el marcador cuando finalice una contienda." icon="bi-bar-chart-line" />
      ) : (
        <div className="surface-card p-4">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar resultado, equipo o deporte..."
          />
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Partido</th>
                  <th>Deporte</th>
                  <th>Marcador</th>
                  <th>Anotaciones</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.equipoLocal} vs {item.equipoVisitante}<div className="small text-soft">{item.observaciones || "Sin observaciones"}</div></td>
                    <td>{item.deporte}</td>
                    <td><span className="badge text-bg-dark">{item.puntajeLocal} - {item.puntajeVisitante}</span></td>
                    <td>{item.anotaciones?.length ?? 0}</td>
                    <td className="crud-actions text-end">
                      <button className="btn btn-sm btn-outline-primary me-2 icon-button" onClick={() => startEdit(item)} aria-label="Editar"><i className="bi bi-pencil-square" /></button>
                      <button className="btn btn-sm btn-outline-danger icon-button" onClick={() => remove(item)} aria-label="Eliminar"><i className="bi bi-trash3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar resultado" : "Registrar resultado"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Partido</label>
            <select className="form-select" value={form.partidoId} onChange={(e) => setForm({ ...form, partidoId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {partidos.map((item) => <option value={item.id} key={item.id}>{item.equipoLocalNombre} vs {item.equipoVisitanteNombre} - {item.deporteNombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Puntaje local</label>
            <input type="number" min={0} className="form-control" value={form.puntajeLocal} onChange={(e) => setForm({ ...form, puntajeLocal: Number(e.target.value) })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Puntaje visitante</label>
            <input type="number" min={0} className="form-control" value={form.puntajeVisitante} onChange={(e) => setForm({ ...form, puntajeVisitante: Number(e.target.value) })} required />
          </div>
          <div className="col-12">
            <label className="form-label">Observaciones</label>
            <textarea className="form-control" rows={3} value={form.observaciones ?? ""} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
              <label className="form-label mb-0">Anotaciones</label>
              <button type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={addAnotacion}>
                <i className="bi bi-plus-circle me-2" />
                Agregar
              </button>
            </div>
            {(form.anotaciones ?? []).length === 0 ? (
              <div className="alert alert-info mb-0">Puedes registrar el marcador sin anotadores o agregarlos por participante.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {(form.anotaciones ?? []).map((anotacion, index) => (
                  <div className="row g-2 align-items-center" key={index}>
                    <div className="col-md-8">
                      <select
                        className="form-select"
                        value={anotacion.participanteId}
                        onChange={(e) => setAnotacion(index, { participanteId: Number(e.target.value) })}
                        required
                      >
                        <option value={0} disabled>Seleccionar participante</option>
                        {participantes.map((item) => (
                          <option value={item.id} key={item.id}>
                            {item.apellidos}, {item.nombres} - {item.equipoNombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        value={anotacion.cantidad}
                        onChange={(e) => setAnotacion(index, { cantidad: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-md-1 text-end">
                      <button type="button" className="btn btn-outline-danger icon-button" onClick={() => removeAnotacion(index)} aria-label="Quitar anotacion">
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormModal>
    </>
  );
}
