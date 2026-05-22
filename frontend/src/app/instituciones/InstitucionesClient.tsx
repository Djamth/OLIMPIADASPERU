"use client";

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

  const columns: DataTableColumn<Institucion>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (item) => <span className="font-bold text-slate-950">{item.nombre}</span>,
    },
    {
      key: "codigo",
      header: "Codigo",
      render: (item) => item.codigoModular,
    },
    {
      key: "region",
      header: "Region",
      render: (item) => `${item.region} / ${item.ciudad}`,
    },
    {
      key: "contacto",
      header: "Contacto",
      render: (item) => <span className="text-slate-500">{item.email || item.telefono || "Sin contacto"}</span>,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Instituciones"
        description="Administra colegios o instituciones participantes."
        action={<PrimaryActionButton onClick={startCreate}>Nueva institucion</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin instituciones" description="Registra la primera institucion para empezar a crear equipos." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar institucion, codigo, region..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar institucion" : "Nueva institucion"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-8">
            <label className={labelClass}>Nombre</label>
            <input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Codigo modular</label>
            <input className={fieldClass} value={form.codigoModular} onChange={(e) => setForm({ ...form, codigoModular: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Region</label>
            <input className={fieldClass} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Ciudad</label>
            <input className={fieldClass} value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required />
          </div>
          <div className="md:col-span-12">
            <label className={labelClass}>Direccion</label>
            <input className={fieldClass} value={form.direccion ?? ""} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Telefono</label>
            <input className={fieldClass} value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Email</label>
            <input type="email" className={fieldClass} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
      </FormModal>
    </>
  );
}
