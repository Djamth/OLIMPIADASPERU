"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { deporteService, equipoService, inscripcionService } from "@/services/crudServices";
import type { Deporte, Equipo, EstadoInscripcion, Inscripcion, InscripcionRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const estados: EstadoInscripcion[] = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];
const today = new Date().toISOString().slice(0, 10);

const emptyForm: InscripcionRequest = {
  equipoId: 0,
  deporteId: 0,
  estado: "PENDIENTE",
  fechaInscripcion: today,
};

export function InscripcionesClient() {
  const loader = useCallback(() => inscripcionService.list(), []);
  const { data, loading, reload } = useAsyncList<Inscripcion>(loader);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inscripcion | null>(null);
  const [form, setForm] = useState<InscripcionRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.equipoNombre, item.deporteNombre, item.estado, item.fechaInscripcion]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([equipoService.list(), deporteService.list()])
      .then(([equiposData, deportesData]) => {
        setEquipos(equiposData);
        setDeportes(deportesData);
      })
      .catch((error) => alerts.error("Error al cargar catalogos", getErrorMessage(error)));
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, equipoId: equipos[0]?.id ?? 0, deporteId: deportes[0]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Inscripcion) => {
    setEditing(item);
    setForm({
      equipoId: item.equipoId,
      deporteId: item.deporteId,
      estado: item.estado,
      fechaInscripcion: item.fechaInscripcion,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Inscripcion creada";
      if (editing) {
        await inscripcionService.update(editing.id, form);
        message = "Inscripcion actualizada";
      } else {
        await inscripcionService.create(form);
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

  const remove = async (item: Inscripcion) => {
    const result = await alerts.confirm("Eliminar inscripcion", `${item.equipoNombre} sera retirado de ${item.deporteNombre}.`);
    if (!result.isConfirmed) return;
    try {
      await inscripcionService.remove(item.id);
      await alerts.success("Inscripcion eliminada");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Inscripciones"
        description="Controla equipos inscritos por deporte y estado de confirmacion."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={startCreate}><i className="bi bi-plus-circle me-2" />Nueva inscripcion</button>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin inscripciones" description="Inscribe equipos para poder sortear grupos y programar partidos." icon="bi-clipboard-check" />
      ) : (
        <div className="surface-card p-4">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar equipo, deporte o estado..."
          />
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Deporte</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.equipoNombre}</td>
                    <td>{item.deporteNombre}</td>
                    <td><span className={`badge ${item.estado === "CONFIRMADA" ? "text-bg-success" : item.estado === "CANCELADA" ? "text-bg-danger" : "text-bg-warning"}`}>{item.estado}</span></td>
                    <td className="text-soft">{item.fechaInscripcion}</td>
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

      <FormModal open={open} title={editing ? "Editar inscripcion" : "Nueva inscripcion"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Equipo</label>
            <select className="form-select" value={form.equipoId} onChange={(e) => setForm({ ...form, equipoId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Deporte</label>
            <select className="form-select" value={form.deporteId} onChange={(e) => setForm({ ...form, deporteId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoInscripcion })}>
              {estados.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Fecha</label>
            <input type="date" className="form-control" value={form.fechaInscripcion} onChange={(e) => setForm({ ...form, fechaInscripcion: e.target.value })} required />
          </div>
        </div>
      </FormModal>
    </>
  );
}
