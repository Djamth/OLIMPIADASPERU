"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { deporteService, equipoService, programacionService, sorteoService } from "@/services/crudServices";
import type { Deporte, Equipo, EstadoPartido, Grupo, Partido, PartidoRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const estados: EstadoPartido[] = ["PROGRAMADO", "REPROGRAMADO", "EN_JUEGO", "FINALIZADO"];

const emptyForm: PartidoRequest = {
  grupoId: null,
  deporteId: 0,
  equipoLocalId: 0,
  equipoVisitanteId: 0,
  fechaHora: "",
  sede: "",
  estado: "PROGRAMADO",
};

export function ProgramacionClient() {
  const loader = useCallback(() => programacionService.list(), []);
  const { data, loading, reload } = useAsyncList<Partido>(loader);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partido | null>(null);
  const [form, setForm] = useState<PartidoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.equipoLocalNombre, item.equipoVisitanteNombre, item.deporteNombre, item.grupoNombre ?? "", item.sede, item.estado, item.fechaHora]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([deporteService.list(), equipoService.list()])
      .then(([deportesData, equiposData]) => {
        setDeportes(deportesData);
        setEquipos(equiposData);
      })
      .catch((error) => alerts.error("Error al cargar catalogos", getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!form.deporteId) {
      setGrupos([]);
      return;
    }
    sorteoService.listarGrupos(form.deporteId).then(setGrupos).catch(() => setGrupos([]));
  }, [form.deporteId]);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, deporteId: deportes[0]?.id ?? 0, equipoLocalId: equipos[0]?.id ?? 0, equipoVisitanteId: equipos[1]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Partido) => {
    setEditing(item);
    setForm({
      grupoId: item.grupoId ?? null,
      deporteId: item.deporteId,
      equipoLocalId: item.equipoLocalId,
      equipoVisitanteId: item.equipoVisitanteId,
      fechaHora: item.fechaHora.slice(0, 16),
      sede: item.sede,
      estado: item.estado,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, grupoId: form.grupoId || null };
      let message = "Partido programado";
      if (editing) {
        await programacionService.update(editing.id, payload);
        message = "Partido actualizado";
      } else {
        await programacionService.create(payload);
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

  const remove = async (item: Partido) => {
    const result = await alerts.confirm("Eliminar partido", `${item.equipoLocalNombre} vs ${item.equipoVisitanteNombre}.`);
    if (!result.isConfirmed) return;
    try {
      await programacionService.remove(item.id);
      await alerts.success("Partido eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Programacion"
        description="Organiza partidos por deporte, grupo, sede y fecha."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={startCreate}><i className="bi bi-calendar-plus me-2" />Programar partido</button>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin partidos" description="Programa partidos cuando existan inscripciones confirmadas." icon="bi-calendar-event" />
      ) : (
        <div className="surface-card p-4">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar partido, deporte, sede..."
          />
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Partido</th>
                  <th>Deporte</th>
                  <th>Grupo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.equipoLocalNombre} vs {item.equipoVisitanteNombre}<div className="small text-soft">{item.sede}</div></td>
                    <td>{item.deporteNombre}</td>
                    <td>{item.grupoNombre ?? "Sin grupo"}</td>
                    <td className="text-soft">{item.fechaHora.replace("T", " ")}</td>
                    <td><span className="badge bg-primary-subtle text-primary">{item.estado}</span></td>
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

      <FormModal open={open} title={editing ? "Editar partido" : "Programar partido"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Deporte</label>
            <select className="form-select" value={form.deporteId} onChange={(e) => setForm({ ...form, deporteId: Number(e.target.value), grupoId: null })} required>
              <option value={0} disabled>Seleccionar</option>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Grupo</label>
            <select className="form-select" value={form.grupoId ?? 0} onChange={(e) => setForm({ ...form, grupoId: Number(e.target.value) || null })}>
              <option value={0}>Sin grupo</option>
              {grupos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Equipo local</label>
            <select className="form-select" value={form.equipoLocalId} onChange={(e) => setForm({ ...form, equipoLocalId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Equipo visitante</label>
            <select className="form-select" value={form.equipoVisitanteId} onChange={(e) => setForm({ ...form, equipoVisitanteId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Fecha y hora</label>
            <input type="datetime-local" className="form-control" value={form.fechaHora} onChange={(e) => setForm({ ...form, fechaHora: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPartido })}>
              {estados.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Sede</label>
            <input className="form-control" value={form.sede} onChange={(e) => setForm({ ...form, sede: e.target.value })} required />
          </div>
        </div>
      </FormModal>
    </>
  );
}
