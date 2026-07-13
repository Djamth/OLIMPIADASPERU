"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass, textareaClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { ModuleKpis } from "@/components/common/ModuleKpis";
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
  const { data, loading, reload } = useAsyncList<Deporte>(loader, {
    cacheKey: "deportes:list",
    ttlMs: 5 * 60_000,
  });
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

  const columns: DataTableColumn<Deporte>[] = [
    { key: "deporte", header: "Deporte", render: (item) => <span className="font-bold text-slate-950">{item.nombre}</span> },
    { key: "descripcion", header: "Descripción", render: (item) => <span className="text-slate-500">{item.descripcion || "Sin descripción"}</span> },
    { key: "jugadores", header: "Jugadores", render: (item) => <Badge>{item.numeroJugadores}</Badge> },
    { key: "grupo", header: "Max. por grupo", render: (item) => item.maximoEquiposPorGrupo },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  const totalJugadoresBase = data.reduce((total, item) => total + item.numeroJugadores, 0);
  const promedioJugadores = data.length ? Math.round(totalJugadoresBase / data.length) : 0;
  const capacidadGrupos = data.reduce((total, item) => total + item.maximoEquiposPorGrupo, 0);

  return (
    <>
      <PageHeader
        title="Deportes"
        description="Administra deportes oficiales, reglas de jugadores y capacidad de grupos."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo deporte</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin deportes" description="Crea los deportes obligatorios para iniciar la competencia." />
      ) : (
        <div className="module-panel">
          <ModuleKpis
            items={[
              { label: "Deportes", value: data.length, hint: "Disciplinas configuradas", tone: "blue" },
              { label: "Jugadores base", value: totalJugadoresBase, hint: "Suma de plantillas mínimas", tone: "green" },
              { label: "Promedio", value: promedioJugadores, hint: "Jugadores por deporte", tone: "slate" },
              { label: "Capacidad grupos", value: capacidadGrupos, hint: "Equipos máximos acumulados", tone: "amber" },
            ]}
          />
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar deporte o descripción..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar deporte" : "Nuevo deporte"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Nombre</label>
            <input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value.toUpperCase() })} required />
          </div>
          <div className="md:col-span-3">
            <label className={labelClass}>Jugadores</label>
            <input type="number" min={1} className={fieldClass} value={form.numeroJugadores} onChange={(e) => setForm({ ...form, numeroJugadores: Number(e.target.value) })} required />
          </div>
          <div className="md:col-span-3">
            <label className={labelClass}>Max. grupo</label>
            <input type="number" min={2} className={fieldClass} value={form.maximoEquiposPorGrupo} onChange={(e) => setForm({ ...form, maximoEquiposPorGrupo: Number(e.target.value) })} required />
          </div>
          <div className="md:col-span-12">
            <label className={labelClass}>Descripción</label>
            <textarea className={textareaClass} rows={3} value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
        </div>
      </FormModal>
    </>
  );
}
