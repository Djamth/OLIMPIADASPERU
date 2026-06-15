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
  ruc: "",
  tipo: "COLEGIO",
  nivelEducativo: "",
  region: "",
  ciudad: "",
  direccion: "",
  telefono: "",
  email: "",
  administradorNombre: "",
  administradorEmail: "",
};

export function InstitucionesClient() {
  const loader = useCallback(() => institucionService.list(), []);
  const { data, loading, reload } = useAsyncList<Institucion>(loader);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Institucion | null>(null);
  const [form, setForm] = useState<InstitucionRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.nombre, item.codigoModular, item.ruc ?? "", item.region, item.ciudad, item.email ?? "", item.telefono ?? ""]
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
      ruc: item.ruc ?? "",
      tipo: item.tipo ?? "COLEGIO",
      nivelEducativo: item.nivelEducativo ?? "",
      region: item.region,
      ciudad: item.ciudad,
      direccion: item.direccion ?? "",
      telefono: item.telefono ?? "",
      email: item.email ?? "",
      administradorNombre: item.administradorNombre ?? "",
      administradorEmail: item.administradorEmail ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Institución creada";
      if (editing) {
        await institucionService.update(editing.id, form);
        message = "Institución actualizada";
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
    const result = await alerts.confirm("Eliminar institución", `Se eliminará ${item.nombre}.`);
    if (!result.isConfirmed) return;
    try {
      await institucionService.remove(item.id);
      await alerts.success("Institución eliminada");
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
      header: "Identificacion",
      render: (item) => <div>{item.codigoModular}<p className="text-xs text-slate-500">{item.ruc || "Sin RUC"}</p></div>,
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
        action={<PrimaryActionButton onClick={startCreate}>Nueva institución</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin instituciones" description="Registra la primera institución para empezar a crear equipos." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar institución, código, región..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar institución" : "Nueva institución"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-8">
            <label className={labelClass}>Nombre</label>
            <input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Codigo modular</label>
            <input className={fieldClass} value={form.codigoModular} onChange={(e) => setForm({ ...form, codigoModular: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>RUC</label>
            <input className={fieldClass} value={form.ruc ?? ""} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Tipo</label>
            <select className={fieldClass} value={form.tipo ?? "COLEGIO"} onChange={(e) => setForm({ ...form, tipo: e.target.value as InstitucionRequest["tipo"] })}>
              <option value="COLEGIO">Colegio</option>
              <option value="UNIVERSIDAD">Universidad</option>
              <option value="EMPRESA">Empresa</option>
              <option value="OTRA">Otra</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Nivel educativo</label>
            <input className={fieldClass} value={form.nivelEducativo ?? ""} onChange={(e) => setForm({ ...form, nivelEducativo: e.target.value })} />
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
          <div className="md:col-span-6">
            <label className={labelClass}>Administrador del evento</label>
            <input className={fieldClass} value={form.administradorNombre ?? ""} onChange={(e) => setForm({ ...form, administradorNombre: e.target.value })} />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Email del administrador</label>
            <input type="email" className={fieldClass} value={form.administradorEmail ?? ""} onChange={(e) => setForm({ ...form, administradorEmail: e.target.value })} />
          </div>
        </div>
      </FormModal>
    </>
  );
}
