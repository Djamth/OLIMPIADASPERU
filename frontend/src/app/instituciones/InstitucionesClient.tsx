"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { institucionService } from "@/services/crudServices";
import type { Institucion, InstitucionRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useState } from "react";

const emptyForm: InstitucionRequest = {
  nombre: "",
  codigoModular: "",
  region: "",
  ciudad: "",
  direccion: "",
  telefono: "",
  email: "",
};

export function InstitucionesClient() {
  const loader = useCallback(() => institucionService.list(), []);
  const { data, loading, reload } = useAsyncList<Institucion>(loader);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Institucion | null>(null);
  const [form, setForm] = useState<InstitucionRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.nombre, item.codigoModular, item.region, item.ciudad, item.email ?? "", item.telefono ?? ""]
      .some((value) => value.toLowerCase().includes(query)),
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (item: Institucion) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      codigoModular: item.codigoModular,
      region: item.region,
      ciudad: item.ciudad,
      direccion: item.direccion ?? "",
      telefono: item.telefono ?? "",
      email: item.email ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Institucion creada";
      if (editing) {
        await institucionService.update(editing.id, form);
        message = "Institucion actualizada";
      } else {
        await institucionService.create(form);
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

  const remove = async (item: Institucion) => {
    const result = await alerts.confirm("Eliminar institucion", `Se eliminara ${item.nombre}.`);
    if (!result.isConfirmed) return;
    try {
      await institucionService.remove(item.id);
      await alerts.success("Institucion eliminada");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Instituciones"
        description="Administra colegios o instituciones participantes."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={startCreate}><i className="bi bi-plus-circle me-2" />Nueva institucion</button>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin instituciones" description="Registra la primera institucion para empezar a crear equipos." icon="bi-building" />
      ) : (
        <div className="surface-card p-4">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar institucion, codigo, region..."
          />
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Codigo</th>
                  <th>Region</th>
                  <th>Contacto</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.nombre}</td>
                    <td>{item.codigoModular}</td>
                    <td>{item.region} / {item.ciudad}</td>
                    <td className="text-soft">{item.email || item.telefono || "Sin contacto"}</td>
                    <td className="crud-actions text-end">
                      <button className="btn btn-sm btn-outline-primary me-2 icon-button" onClick={() => startEdit(item)} aria-label="Editar">
                        <i className="bi bi-pencil-square" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger icon-button" onClick={() => remove(item)} aria-label="Eliminar">
                        <i className="bi bi-trash3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar institucion" : "Nueva institucion"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Codigo modular</label>
            <input className="form-control" value={form.codigoModular} onChange={(e) => setForm({ ...form, codigoModular: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Region</label>
            <input className="form-control" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Ciudad</label>
            <input className="form-control" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required />
          </div>
          <div className="col-12">
            <label className="form-label">Direccion</label>
            <input className="form-control" value={form.direccion ?? ""} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Telefono</label>
            <input className="form-control" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
      </FormModal>
    </>
  );
}
