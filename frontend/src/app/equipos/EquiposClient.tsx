"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { equipoService, institucionService } from "@/services/crudServices";
import type { CategoriaEquipo, Equipo, EquipoRequest, Genero, Institucion } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const categorias: CategoriaEquipo[] = ["SUB_12", "SUB_15", "SUB_17", "LIBRE"];
const generos: Genero[] = ["MASCULINO", "FEMENINO", "MIXTO"];

const emptyForm: EquipoRequest = {
  nombre: "",
  categoria: "SUB_17",
  genero: "MASCULINO",
  entrenador: "",
  institucionId: 0,
};

export function EquiposClient() {
  const loader = useCallback(() => equipoService.list(), []);
  const { data, loading, reload } = useAsyncList<Equipo>(loader);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [form, setForm] = useState<EquipoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.nombre, item.institucionNombre, item.categoria, item.genero, item.entrenador]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    institucionService.list().then(setInstituciones).catch((error) => alerts.error("Error al cargar instituciones", getErrorMessage(error)));
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, institucionId: instituciones[0]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Equipo) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      categoria: item.categoria,
      genero: item.genero,
      entrenador: item.entrenador,
      institucionId: item.institucionId,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Equipo creado";
      if (editing) {
        await equipoService.update(editing.id, form);
        message = "Equipo actualizado";
      } else {
        await equipoService.create(form);
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

  const remove = async (item: Equipo) => {
    const result = await alerts.confirm("Eliminar equipo", `Se eliminara ${item.nombre}.`);
    if (!result.isConfirmed) return;
    try {
      await equipoService.remove(item.id);
      await alerts.success("Equipo eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Equipos"
        description="Gestiona equipos por institucion, categoria, genero y entrenador."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={startCreate}><i className="bi bi-plus-circle me-2" />Nuevo equipo</button>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin equipos" description="Crea equipos para registrar participantes e inscripciones." icon="bi-people" />
      ) : (
        <div className="surface-card p-4">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar equipo, institucion, entrenador..."
          />
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Institucion</th>
                  <th>Categoria</th>
                  <th>Genero</th>
                  <th>Entrenador</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.nombre}</td>
                    <td>{item.institucionNombre}</td>
                    <td><span className="badge bg-primary-subtle text-primary">{item.categoria}</span></td>
                    <td>{item.genero}</td>
                    <td className="text-soft">{item.entrenador}</td>
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

      <FormModal open={open} title={editing ? "Editar equipo" : "Nuevo equipo"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Entrenador</label>
            <input className="form-control" value={form.entrenador} onChange={(e) => setForm({ ...form, entrenador: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Institucion</label>
            <select className="form-select" value={form.institucionId} onChange={(e) => setForm({ ...form, institucionId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {instituciones.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Categoria</label>
            <select className="form-select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaEquipo })}>
              {categorias.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Genero</label>
            <select className="form-select" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as Genero })}>
              {generos.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </FormModal>
    </>
  );
}
