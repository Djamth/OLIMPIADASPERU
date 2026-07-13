"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { ModuleKpis } from "@/components/common/ModuleKpis";
import { PageHeader } from "@/components/common/PageHeader";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { accionService } from "@/services/adminServices";
import type { Accion, AccionRequest } from "@/types/admin";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { KeyRound } from "lucide-react";
import { useCallback, useState } from "react";

const emptyForm: AccionRequest = {
  codigo: "",
  nombre: "",
};

const baseActions = new Set(["VER", "CREAR", "EDITAR", "ELIMINAR", "EXPORTAR"]);

export function AccionesClient() {
  const loader = useCallback(() => accionService.list(), []);
  const { data, loading, reload } = useAsyncList<Accion>(loader, {
    cacheKey: "acciones:list",
    ttlMs: 5 * 60_000,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Accion | null>(null);
  const [form, setForm] = useState<AccionRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const table = useTableControls(data, (item, query) =>
    [item.codigo, item.nombre, String(item.permisosAsignados)].some((value) => value.toLowerCase().includes(query)),
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (item: Accion) => {
    setEditing(item);
    setForm({ codigo: item.codigo, nombre: item.nombre });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await accionService.update(editing.id, form);
        await alerts.success("Acción actualizada");
      } else {
        await accionService.create(form);
        await alerts.success("Acción creada");
      }
      setOpen(false);
      await reload();
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item: Accion) => {
    if (item.permisosAsignados > 0) {
      await alerts.error("Acción en uso", `La acción ${item.codigo} tiene ${item.permisosAsignados} permiso(s) asignado(s).`);
      return;
    }

    const result = await alerts.confirm("Eliminar acción", `Se eliminará ${item.codigo}.`);
    if (!result.isConfirmed) return;

    try {
      await accionService.remove(item.id);
      await alerts.success("Acción eliminada");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Accion>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <KeyRound size={18} />
          </div>
          <div>
            <div className="font-black text-slate-950">{item.codigo}</div>
            <div className="text-xs font-semibold text-slate-400">{baseActions.has(item.codigo) ? "Acción base" : "Acción personalizada"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "nombre",
      header: "Nombre",
      render: (item) => <span className="font-semibold text-slate-600">{item.nombre}</span>,
    },
    {
      key: "uso",
      header: "Permisos",
      render: (item) => <Badge tone={item.permisosAsignados > 0 ? "blue" : "slate"}>{item.permisosAsignados} asignados</Badge>,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} />,
    },
  ];

  const accionesBase = data.filter((item) => baseActions.has(item.codigo)).length;
  const accionesPersonalizadas = data.length - accionesBase;
  const permisosAsignados = data.reduce((total, item) => total + item.permisosAsignados, 0);

  return (
    <>
      <PageHeader
        title="Acciones"
        description="Administra el catálogo de operaciones funcionales usadas por el control de permisos."
        action={<PrimaryActionButton onClick={startCreate}>Nueva acción</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin acciones" description="Crea acciones para definir permisos granulares por módulo." />
      ) : (
        <div className="module-panel">
          <ModuleKpis
            items={[
              { label: "Acciones", value: data.length, hint: "Operaciones del sistema", tone: "blue" },
              { label: "Base", value: accionesBase, hint: "Permisos estándar", tone: "green" },
              { label: "Personalizadas", value: accionesPersonalizadas, hint: "Extensiones del equipo", tone: "amber" },
              { label: "Asignaciones", value: permisosAsignados, hint: "Usos en perfiles", tone: "slate" },
            ]}
          />
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar acción, código o uso..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar acción" : "Nueva acción"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Código</label>
            <input
              className={fieldClass}
              value={form.codigo}
              onChange={(event) => setForm({ ...form, codigo: event.target.value.toUpperCase().replaceAll(" ", "_") })}
              placeholder="APROBAR"
              disabled={Boolean(editing && editing.permisosAsignados > 0)}
              title={editing && editing.permisosAsignados > 0 ? "No se puede cambiar el código de una acción en uso" : undefined}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              className={fieldClass}
              value={form.nombre}
              onChange={(event) => setForm({ ...form, nombre: event.target.value })}
              placeholder="Aprobar"
              required
            />
          </div>
        </div>
      </FormModal>
    </>
  );
}
