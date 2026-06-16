"use client";

import { Badge } from "@/components/common/Badge";
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
import { deporteService, equipoService, eventoService, inscripcionService } from "@/services/crudServices";
import type { Deporte, Equipo, EstadoInscripcion, Evento, Inscripcion, InscripcionRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { CheckCircle2, ClipboardCheck, Flag, Trophy } from "lucide-react";
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
  const [eventoFiltroId, setEventoFiltroId] = useState<number>(0);
  const loader = useCallback(
    () => inscripcionService.list({
      deporteId: deporteFiltroId || undefined,
      eventoId: eventoFiltroId || undefined,
    }),
    [deporteFiltroId, eventoFiltroId],
  );
  const { data, loading, reload } = useAsyncList<Inscripcion>(loader);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inscripcion | null>(null);
  const [form, setForm] = useState<InscripcionRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const selectedDeporte = deportes.find((item) => item.id === deporteFiltroId);
  const selectedEquipo = equipos.find((item) => item.id === form.equipoId);
  const selectedFormDeporte = deportes.find((item) => item.id === form.deporteId);
  const table = useTableControls(data, (item, query) =>
    [item.equipoNombre, item.deporteNombre, item.estado, item.fechaInscripcion]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([equipoService.list(), deporteService.list(), eventoService.list()])
      .then(([equiposData, deportesData, eventosData]) => {
        setEquipos(equiposData);
        setDeportes(deportesData);
        setEventos(eventosData);
      })
      .catch((error) => alerts.error("Error al cargar catálogos", getErrorMessage(error)));
  }, []);

  const startCreate = () => {
    const equipo = equipos.find((item) => !eventoFiltroId || item.eventoId === eventoFiltroId) ?? equipos[0];
    setEditing(null);
    setForm({
      ...emptyForm,
      equipoId: equipo?.id ?? 0,
      deporteId: equipo?.deporteId ?? (deporteFiltroId || deportes[0]?.id || 0),
    });
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
      let message = "Inscripción creada";
      if (editing) {
        await inscripcionService.update(editing.id, form);
        message = "Inscripción actualizada";
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
    const result = await alerts.confirm("Eliminar inscripción", `${item.equipoNombre} será retirado de ${item.deporteNombre}.`);
    if (!result.isConfirmed) return;
    try {
      await inscripcionService.remove(item.id);
      await alerts.success("Inscripción eliminada");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Inscripcion>[] = [
    {
      key: "equipo",
      header: "Equipo",
      render: (item) => (
        <div>
          <span className="flex items-center gap-2 font-bold text-slate-950">
            <CountryFlag code={item.bandera} countryName={item.paisNombre} />
            {item.equipoNombre}
          </span>
          <p className="text-xs text-slate-500">{item.categoriaEventoNombre} · {item.paisNombre}</p>
        </div>
      ),
    },
    { key: "evento", header: "Evento", render: (item) => item.eventoNombre ?? "Sin evento" },
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

  const filterPanel = (
    <section className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_260px] lg:items-end">
        <div>
          <label className={labelClass}>Evento</label>
          <select className={fieldClass} value={eventoFiltroId} onChange={(e) => setEventoFiltroId(Number(e.target.value))}>
            <option value={0}>Todos los eventos</option>
            {eventos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Filtro por deporte</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{selectedDeporte?.nombre ?? "Todos los deportes"}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {selectedDeporte
              ? `${data.length} equipos inscritos en ${selectedDeporte.nombre}.`
              : `${data.length} inscripciones registradas.`}
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
  );

  return (
    <>
      <PageHeader
        title="Inscripciones"
        description="Controla equipos inscritos por deporte, país representativo y estado de confirmación."
        action={<PrimaryActionButton onClick={startCreate}>Nueva inscripción</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <div className="grid gap-5">
          {filterPanel}
          <EmptyState title="Sin inscripciones" description="Inscribe equipos para poder sortear grupos y programar partidos." />
        </div>
      ) : (
        <div className="grid gap-5">
          {filterPanel}
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

      <FormModal open={open} title={editing ? "Editar inscripción" : "Nueva inscripción"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          {[
            { icon: Trophy, step: "1", label: "Equipo", value: selectedEquipo?.nombre ?? "Selecciona equipo" },
            { icon: ClipboardCheck, step: "2", label: "Deporte", value: selectedFormDeporte?.nombre ?? "Selecciona deporte" },
            { icon: CheckCircle2, step: "3", label: "Confirmación", value: form.estado },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={item.step}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-xs font-black text-white">{item.step}</span>
                  <Icon size={16} className="text-blue-700" />
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
                </div>
                <p className="truncate text-sm font-black text-slate-950">{item.value}</p>
              </div>
            );
          })}
        </div>

        {selectedEquipo && (
          <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="h-2" style={{ background: `linear-gradient(90deg, ${selectedEquipo.colorPrimario ?? "#1565C0"}, ${selectedEquipo.colorSecundario ?? "#E53935"})` }} />
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                  <CountryFlag code={selectedEquipo.bandera} countryName={selectedEquipo.paisNombre} className="text-2xl" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-slate-950">{selectedEquipo.paisNombre ?? "País pendiente"}</p>
                  <p className="truncate text-sm font-semibold text-slate-500">{selectedEquipo.categoriaEventoNombre ?? selectedEquipo.categoria}</p>
                </div>
              </div>
              <Badge tone="blue">Identidad visible del torneo</Badge>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo</label>
            <select className={fieldClass} value={form.equipoId} onChange={(e) => {
              const equipo = equipos.find((item) => item.id === Number(e.target.value));
              setForm({ ...form, equipoId: Number(e.target.value), deporteId: equipo?.deporteId ?? form.deporteId });
            }} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos
                .filter((item) => !eventoFiltroId || item.eventoId === eventoFiltroId)
                .map((item) => <option value={item.id} key={item.id}>{item.paisNombre} - {item.deporteNombre} - {item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Deporte</label>
            <select className={fieldClass} value={form.deporteId} onChange={(e) => setForm({ ...form, deporteId: Number(e.target.value) })} required disabled={Boolean(selectedEquipo?.deporteId)}>
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
