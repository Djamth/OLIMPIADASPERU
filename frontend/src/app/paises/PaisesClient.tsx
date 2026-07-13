"use client";

import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { CountryFlag } from "@/components/common/CountryFlag";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { paisService } from "@/services/crudServices";
import type { Pais, PaisRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useState } from "react";

const emptyForm: PaisRequest = {
  nombre: "",
  codigo: "",
  bandera: "",
  colorPrimario: "#1565C0",
  colorSecundario: "#FFFFFF",
  datoCultural: "",
  activo: true,
};

export function PaisesClient() {
  const loader = useCallback(() => paisService.list(), []);
  const { data, loading, reload } = useAsyncList<Pais>(loader, {
    cacheKey: "paises:list",
    ttlMs: 5 * 60_000,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pais | null>(null);
  const [form, setForm] = useState<PaisRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.nombre, item.codigo, item.bandera, item.datoCultural ?? ""]
      .some((value) => value.toLowerCase().includes(query)),
  );

  const openForm = (item?: Pais) => {
    setEditing(item ?? null);
    setForm(item ? {
      nombre: item.nombre,
      codigo: item.codigo,
      bandera: item.bandera,
      colorPrimario: item.colorPrimario,
      colorSecundario: item.colorSecundario,
      datoCultural: item.datoCultural ?? "",
      activo: item.activo,
    } : emptyForm);
    setOpen(true);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editing) await paisService.update(editing.id, form);
      else await paisService.create(form);
      setOpen(false);
      await reload();
      await alerts.success(editing ? "País actualizado" : "País creado");
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item: Pais) => {
    const result = await alerts.confirm("Eliminar país", `Se eliminará ${item.nombre} si no está asignado.`);
    if (!result.isConfirmed) return;
    try {
      await paisService.remove(item.id);
      await reload();
      await alerts.success("País eliminado");
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const toggle = async (item: Pais) => {
    try {
      await paisService.update(item.id, { ...item, activo: !item.activo });
      await reload();
    } catch (error) {
      await alerts.error("No se pudo cambiar el estado", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Pais>[] = [
    {
      key: "pais",
      header: "País",
      render: (item) => (
        <div className="flex items-center gap-3">
          <CountryFlag code={item.bandera} countryName={item.nombre} className="text-2xl" />
          <div><p className="font-black text-slate-950">{item.nombre}</p><p className="text-xs text-slate-500">{item.codigo} / {item.bandera.toUpperCase()}</p></div>
        </div>
      ),
    },
    {
      key: "colores",
      header: "Colores",
      render: (item) => <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-md ring-1 ring-slate-200" style={{ backgroundColor: item.colorPrimario }} /><span className="h-6 w-6 rounded-md ring-1 ring-slate-200" style={{ backgroundColor: item.colorSecundario }} /></div>,
    },
    { key: "dato", header: "Dato cultural", render: (item) => <span className="text-slate-600">{item.datoCultural || "Sin información"}</span> },
    {
      key: "estado",
      header: "Activo",
      render: (item) => (
        <button type="button" role="switch" aria-checked={item.activo} onClick={() => toggle(item)}
          className={`relative h-6 w-11 rounded-full transition ${item.activo ? "bg-blue-600" : "bg-slate-300"}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${item.activo ? "left-6" : "left-1"}`} />
        </button>
      ),
    },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => openForm(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader title="Catálogo de países" description="Gestiona banderas, colores e identidades disponibles para las categorías."
        action={<PrimaryActionButton onClick={() => openForm()}>Nuevo país</PrimaryActionButton>} />
      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin países" description="Registra países para habilitar la asignación automática." />
      ) : (
        <section className="module-panel">
          <TableToolbar query={table.query} onQueryChange={table.setQuery} pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize} totalItems={table.totalItems}
            filteredItems={table.filteredItems} placeholder="Buscar país o código ISO..." />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </section>
      )}

      <FormModal open={open} title={editing ? "Editar país" : "Nuevo país"} onClose={() => setOpen(false)}
        onSubmit={save} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className={labelClass}>Nombre</label><input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
          <div><label className={labelClass}>Código ISO3</label><input className={fieldClass} maxLength={3} placeholder="PER" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} required /></div>
          <div><label className={labelClass}>Código bandera ISO2</label><input className={fieldClass} maxLength={2} placeholder="pe" value={form.bandera} onChange={(e) => setForm({ ...form, bandera: e.target.value.toLowerCase() })} required /></div>
          <div className="flex items-end gap-3"><CountryFlag code={form.bandera} countryName={form.nombre} className="mb-2 text-4xl" /><span className="mb-3 text-sm font-semibold text-slate-500">Vista previa</span></div>
          <div><label className={labelClass}>Color principal</label><input type="color" className={`${fieldClass} h-11`} value={form.colorPrimario} onChange={(e) => setForm({ ...form, colorPrimario: e.target.value })} /></div>
          <div><label className={labelClass}>Color secundario</label><input type="color" className={`${fieldClass} h-11`} value={form.colorSecundario} onChange={(e) => setForm({ ...form, colorSecundario: e.target.value })} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Dato cultural</label><textarea className={fieldClass} value={form.datoCultural ?? ""} onChange={(e) => setForm({ ...form, datoCultural: e.target.value })} /></div>
          <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Disponible para asignación</label>
        </div>
      </FormModal>
    </>
  );
}
