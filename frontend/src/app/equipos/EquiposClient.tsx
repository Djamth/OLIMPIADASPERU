"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
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

  const columns: DataTableColumn<Equipo>[] = [
    { key: "equipo", header: "Equipo", render: (item) => <span className="font-bold text-slate-950">{item.nombre}</span> },
    { key: "institucion", header: "Institucion", render: (item) => item.institucionNombre },
    { key: "categoria", header: "Categoria", render: (item) => <Badge>{item.categoria}</Badge> },
    { key: "genero", header: "Genero", render: (item) => item.genero },
    { key: "entrenador", header: "Entrenador", render: (item) => <span className="text-slate-500">{item.entrenador}</span> },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Equipos"
        description="Gestiona equipos por institucion, categoria, genero y entrenador."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo equipo</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin equipos" description="Crea equipos para registrar participantes e inscripciones." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar equipo, institucion, entrenador..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar equipo" : "Nuevo equipo"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Nombre</label>
            <input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Entrenador</label>
            <input className={fieldClass} value={form.entrenador} onChange={(e) => setForm({ ...form, entrenador: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Institucion</label>
            <select className={fieldClass} value={form.institucionId} onChange={(e) => setForm({ ...form, institucionId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {instituciones.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className={labelClass}>Categoria</label>
            <select className={fieldClass} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaEquipo })}>
              {categorias.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className={labelClass}>Genero</label>
            <select className={fieldClass} value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as Genero })}>
              {generos.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </FormModal>
    </>
  );
}
