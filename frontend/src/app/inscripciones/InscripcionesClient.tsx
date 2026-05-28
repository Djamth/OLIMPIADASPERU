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
import { deporteService, equipoService, inscripcionService } from "@/services/crudServices";
import type { Deporte, Equipo, EstadoInscripcion, Inscripcion, InscripcionRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const estados: EstadoInscripcion[] = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];
const today = new Date().toISOString().slice(0, 10);

const emptyForm: InscripcionRequest = {
  equipoId: 0,
  deporteId: 0,
  estado: "PENDIENTE",
  fechaInscripcion: today,
};

export function InscripcionesClient() {
  const [deporteFiltroId, setDeporteFiltroId] = useState<number>(0);
  const loader = useCallback(
    () => inscripcionService.list(deporteFiltroId ? { deporteId: deporteFiltroId } : undefined),
    [deporteFiltroId],
  );
  const { data, loading, reload } = useAsyncList<Inscripcion>(loader);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inscripcion | null>(null);
  const [form, setForm] = useState<InscripcionRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const selectedDeporte = deportes.find((item) => item.id === deporteFiltroId);
  const table = useTableControls(data, (item, query) =>
    [item.equipoNombre, item.deporteNombre, item.estado, item.fechaInscripcion]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([equipoService.list(), deporteService.list()])
      .then(([equiposData, deportesData]) => {
        setEquipos(equiposData);
        setDeportes(deportesData);
      })
      .catch((error) => alerts.error("Error al cargar catalogos", getErrorMessage(error)));
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, equipoId: equipos[0]?.id ?? 0, deporteId: deporteFiltroId || deportes[0]?.id || 0 });
    setOpen(true);
  };

  const startEdit = (item: Inscripcion) => {
    setEditing(item);
    setForm({
      equipoId: item.equipoId,
      deporteId: item.deporteId,
      estado: item.estado,
      fechaInscripcion: item.fechaInscripcion,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Inscripcion creada";
      if (editing) {
        await inscripcionService.update(editing.id, form);
        message = "Inscripcion actualizada";
      } else {
        await inscripcionService.create(form);
        setDeporteFiltroId(form.deporteId);
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

  const remove = async (item: Inscripcion) => {
    const result = await alerts.confirm("Eliminar inscripcion", `${item.equipoNombre} sera retirado de ${item.deporteNombre}.`);
    if (!result.isConfirmed) return;
    try {
      await inscripcionService.remove(item.id);
      await alerts.success("Inscripcion eliminada");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Inscripcion>[] = [
    { key: "equipo", header: "Equipo", render: (item) => <span className="font-bold text-slate-950">{item.equipoNombre}</span> },
    { key: "deporte", header: "Deporte", render: (item) => item.deporteNombre },
    {
      key: "estado",
      header: "Estado",
      render: (item) => (
        <Badge tone={item.estado === "CONFIRMADA" ? "green" : item.estado === "CANCELADA" ? "red" : "amber"}>
          {item.estado}
        </Badge>
      ),
    },
    { key: "fecha", header: "Fecha", render: (item) => <span className="text-slate-500">{item.fechaInscripcion}</span> },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Inscripciones"
        description="Controla equipos inscritos por deporte y estado de confirmacion."
        action={<PrimaryActionButton onClick={startCreate}>Nueva inscripcion</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <div className="grid gap-5">
          <section className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Filtro por deporte</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{selectedDeporte?.nombre ?? "Todos los deportes"}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">Revisa solo los equipos inscritos en una disciplina.</p>
              </div>
              <div>
                <label className={labelClass}>Deporte</label>
                <select className={fieldClass} value={deporteFiltroId} onChange={(e) => setDeporteFiltroId(Number(e.target.value))}>
                  <option value={0}>Todos los deportes</option>
                  {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
                </select>
              </div>
            </div>
          </section>
          <EmptyState title="Sin inscripciones" description="Inscribe equipos para poder sortear grupos y programar partidos." />
        </div>
      ) : (
        <div className="grid gap-5">
          <section className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Filtro por deporte</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{selectedDeporte?.nombre ?? "Todos los deportes"}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedDeporte
                    ? `${data.length} equipos inscritos en ${selectedDeporte.nombre}.`
                    : `${data.length} inscripciones registradas en todos los deportes.`}
                </p>
              </div>
              <div>
                <label className={labelClass}>Deporte</label>
                <select className={fieldClass} value={deporteFiltroId} onChange={(e) => setDeporteFiltroId(Number(e.target.value))}>
                  <option value={0}>Todos los deportes</option>
                  {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
                </select>
              </div>
            </div>
          </section>

          <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <TableToolbar
              query={table.query}
              onQueryChange={table.setQuery}
              pageSize={table.pageSize}
              onPageSizeChange={table.setPageSize}
              totalItems={table.totalItems}
              filteredItems={table.filteredItems}
              placeholder="Buscar equipo, deporte o estado..."
            />
            <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
            <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          </div>
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar inscripcion" : "Nueva inscripcion"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo</label>
            <select className={fieldClass} value={form.equipoId} onChange={(e) => setForm({ ...form, equipoId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Deporte</label>
            <select className={fieldClass} value={form.deporteId} onChange={(e) => setForm({ ...form, deporteId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Estado</label>
            <select className={fieldClass} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoInscripcion })}>
              {estados.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Fecha</label>
            <input type="date" className={fieldClass} value={form.fechaInscripcion} onChange={(e) => setForm({ ...form, fechaInscripcion: e.target.value })} required />
          </div>
        </div>
      </FormModal>
    </>
  );
}
