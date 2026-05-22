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
import { deporteService, equipoService, programacionService, sorteoService } from "@/services/crudServices";
import type { Deporte, Equipo, EstadoPartido, Grupo, Partido, PartidoRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const estados: EstadoPartido[] = ["PROGRAMADO", "REPROGRAMADO", "EN_JUEGO", "FINALIZADO"];

const emptyForm: PartidoRequest = {
  grupoId: null,
  deporteId: 0,
  equipoLocalId: 0,
  equipoVisitanteId: 0,
  fechaHora: "",
  sede: "",
  estado: "PROGRAMADO",
};

export function ProgramacionClient() {
  const loader = useCallback(() => programacionService.list(), []);
  const { data, loading, reload } = useAsyncList<Partido>(loader);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partido | null>(null);
  const [form, setForm] = useState<PartidoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.equipoLocalNombre, item.equipoVisitanteNombre, item.deporteNombre, item.grupoNombre ?? "", item.sede, item.estado, item.fechaHora]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([deporteService.list(), equipoService.list()])
      .then(([deportesData, equiposData]) => {
        setDeportes(deportesData);
        setEquipos(equiposData);
      })
      .catch((error) => alerts.error("Error al cargar catalogos", getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!form.deporteId) {
      setGrupos([]);
      return;
    }
    sorteoService.listarGrupos(form.deporteId).then(setGrupos).catch(() => setGrupos([]));
  }, [form.deporteId]);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, deporteId: deportes[0]?.id ?? 0, equipoLocalId: equipos[0]?.id ?? 0, equipoVisitanteId: equipos[1]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Partido) => {
    setEditing(item);
    setForm({
      grupoId: item.grupoId ?? null,
      deporteId: item.deporteId,
      equipoLocalId: item.equipoLocalId,
      equipoVisitanteId: item.equipoVisitanteId,
      fechaHora: item.fechaHora.slice(0, 16),
      sede: item.sede,
      estado: item.estado,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, grupoId: form.grupoId || null };
      let message = "Partido programado";
      if (editing) {
        await programacionService.update(editing.id, payload);
        message = "Partido actualizado";
      } else {
        await programacionService.create(payload);
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

  const remove = async (item: Partido) => {
    const result = await alerts.confirm("Eliminar partido", `${item.equipoLocalNombre} vs ${item.equipoVisitanteNombre}.`);
    if (!result.isConfirmed) return;
    try {
      await programacionService.remove(item.id);
      await alerts.success("Partido eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Partido>[] = [
    {
      key: "partido",
      header: "Partido",
      render: (item) => (
        <span className="font-bold text-slate-950">
          {item.equipoLocalNombre} vs {item.equipoVisitanteNombre}
          <span className="block text-xs font-semibold text-slate-500">{item.sede}</span>
        </span>
      ),
    },
    { key: "deporte", header: "Deporte", render: (item) => item.deporteNombre },
    { key: "grupo", header: "Grupo", render: (item) => item.grupoNombre ?? "Sin grupo" },
    { key: "fecha", header: "Fecha", render: (item) => <span className="text-slate-500">{item.fechaHora.replace("T", " ")}</span> },
    { key: "estado", header: "Estado", render: (item) => <Badge>{item.estado}</Badge> },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Programacion"
        description="Organiza partidos por deporte, grupo, sede y fecha."
        action={<PrimaryActionButton onClick={startCreate}>Programar partido</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin partidos" description="Programa partidos cuando existan inscripciones confirmadas." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar partido, deporte, sede..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar partido" : "Programar partido"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Deporte</label>
            <select className={fieldClass} value={form.deporteId} onChange={(e) => setForm({ ...form, deporteId: Number(e.target.value), grupoId: null })} required>
              <option value={0} disabled>Seleccionar</option>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Grupo</label>
            <select className={fieldClass} value={form.grupoId ?? 0} onChange={(e) => setForm({ ...form, grupoId: Number(e.target.value) || null })}>
              <option value={0}>Sin grupo</option>
              {grupos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo local</label>
            <select className={fieldClass} value={form.equipoLocalId} onChange={(e) => setForm({ ...form, equipoLocalId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo visitante</label>
            <select className={fieldClass} value={form.equipoVisitanteId} onChange={(e) => setForm({ ...form, equipoVisitanteId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Fecha y hora</label>
            <input type="datetime-local" className={fieldClass} value={form.fechaHora} onChange={(e) => setForm({ ...form, fechaHora: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Estado</label>
            <select className={fieldClass} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPartido })}>
              {estados.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
          <div className="md:col-span-12">
            <label className={labelClass}>Sede</label>
            <input className={fieldClass} value={form.sede} onChange={(e) => setForm({ ...form, sede: e.target.value })} required />
          </div>
        </div>
      </FormModal>
    </>
  );
}
