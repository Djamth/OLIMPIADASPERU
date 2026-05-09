"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { deporteService } from "@/services/crudServices";
import type { Deporte, DeporteRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useState } from "react";

const emptyForm: DeporteRequest = {
  nombre: "",
  descripcion: "",
  maximoEquiposPorGrupo: 4,
  numeroJugadores: 1,
};

export function DeportesClient() {
  const loader = useCallback(() => deporteService.list(), []);
  const { data, loading, reload } = useAsyncList<Deporte>(loader);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Deporte | null>(null);
  const [form, setForm] = useState<DeporteRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.nombre, item.descripcion ?? "", String(item.numeroJugadores), String(item.maximoEquiposPorGrupo)]
      .some((value) => value.toLowerCase().includes(query)),
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (item: Deporte) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? "",
      maximoEquiposPorGrupo: item.maximoEquiposPorGrupo,
      numeroJugadores: item.numeroJugadores,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Deporte creado";
      if (editing) {
        await deporteService.update(editing.id, form);
        message = "Deporte actualizado";
      } else {
        await deporteService.create(form);
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

  const remove = async (item: Deporte) => {
    const result = await alerts.confirm("Eliminar deporte", `Se eliminara ${item.nombre}.`);
    if (!result.isConfirmed) return;
    try {
      await deporteService.remove(item.id);
      await alerts.success("Deporte eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Deportes"
        description="Administra deportes oficiales, reglas de jugadores y capacidad de grupos."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={startCreate}><i className="bi bi-plus-circle me-2" />Nuevo deporte</button>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin deportes" description="Crea los deportes obligatorios para iniciar la competencia." icon="bi-trophy" />
      ) : (
        <div className="surface-card p-4">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar deporte o descripcion..."
          />
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Deporte</th>
                  <th>Descripcion</th>
                  <th>Jugadores</th>
                  <th>Max. por grupo</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.nombre}</td>
                    <td className="text-soft">{item.descripcion || "Sin descripcion"}</td>
                    <td><span className="badge bg-primary-subtle text-primary">{item.numeroJugadores}</span></td>
                    <td>{item.maximoEquiposPorGrupo}</td>
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

      <FormModal open={open} title={editing ? "Editar deporte" : "Nuevo deporte"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value.toUpperCase() })} required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Jugadores</label>
            <input type="number" min={1} className="form-control" value={form.numeroJugadores} onChange={(e) => setForm({ ...form, numeroJugadores: Number(e.target.value) })} required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Max. grupo</label>
            <input type="number" min={2} className="form-control" value={form.maximoEquiposPorGrupo} onChange={(e) => setForm({ ...form, maximoEquiposPorGrupo: Number(e.target.value) })} required />
          </div>
          <div className="col-12">
            <label className="form-label">Descripcion</label>
            <textarea className="form-control" rows={3} value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
        </div>
      </FormModal>
    </>
  );
}
