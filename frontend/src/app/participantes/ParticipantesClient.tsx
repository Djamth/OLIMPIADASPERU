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
import { equipoService, participanteService } from "@/services/crudServices";
import type { Equipo, Genero, Participante, ParticipanteRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const generos: Genero[] = ["MASCULINO", "FEMENINO", "MIXTO"];

const emptyForm: ParticipanteRequest = {
  nombres: "",
  apellidos: "",
  numeroDocumento: "",
  genero: "MASCULINO",
  fechaNacimiento: "2009-01-01",
  codigoEstudiante: "",
  equipoId: 0,
};

export function ParticipantesClient() {
  const loader = useCallback(() => participanteService.list(), []);
  const { data, loading, reload } = useAsyncList<Participante>(loader);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoId, setEquipoId] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Participante | null>(null);
  const [form, setForm] = useState<ParticipanteRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const selectedEquipo = equipos.find((item) => item.id === equipoId);
  const participantesPorEquipo = useMemo(() => {
    const grouped = new Map<number, number>();
    data.forEach((item) => grouped.set(item.equipoId, (grouped.get(item.equipoId) ?? 0) + 1));
    return grouped;
  }, [data]);
  const filteredByTeam = useMemo(
    () => equipoId ? data.filter((item) => item.equipoId === equipoId) : data,
    [data, equipoId],
  );
  const table = useTableControls(filteredByTeam, (item, query) =>
    [item.nombres, item.apellidos, item.numeroDocumento, item.genero, item.codigoEstudiante, item.equipoNombre, item.institucionNombre]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    equipoService.list()
      .then((items) => {
        setEquipos(items);
        setEquipoId((current) => current || items[0]?.id || 0);
      })
      .catch((error) => alerts.error("Error al cargar equipos", getErrorMessage(error)));
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, equipoId: equipoId || equipos[0]?.id || 0 });
    setOpen(true);
  };

  const startEdit = (item: Participante) => {
    setEditing(item);
    setForm({
      nombres: item.nombres,
      apellidos: item.apellidos,
      numeroDocumento: item.numeroDocumento,
      genero: item.genero,
      fechaNacimiento: item.fechaNacimiento,
      codigoEstudiante: item.codigoEstudiante,
      equipoId: item.equipoId,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Participante creado";
      if (editing) {
        await participanteService.update(editing.id, form);
        message = "Participante actualizado";
      } else {
        await participanteService.create(form);
        setEquipoId(form.equipoId);
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

  const remove = async (item: Participante) => {
    const result = await alerts.confirm("Eliminar participante", `Se eliminara ${item.nombres} ${item.apellidos}.`);
    if (!result.isConfirmed) return;
    try {
      await participanteService.remove(item.id);
      await alerts.success("Participante eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Participante>[] = [
    { key: "participante", header: "Participante", render: (item) => <span className="font-bold text-slate-950">{item.apellidos}, {item.nombres}</span> },
    { key: "documento", header: "Documento", render: (item) => item.numeroDocumento },
    { key: "equipo", header: "Equipo", render: (item) => item.equipoNombre },
    { key: "genero", header: "Genero", render: (item) => item.genero },
    { key: "codigo", header: "Codigo", render: (item) => <span className="text-slate-500">{item.codigoEstudiante}</span> },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Participantes"
        description="Registra jugadores por equipo y prepara plantillas competitivas."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo participante</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin participantes" description="Registra jugadores para confirmar inscripciones por deporte." />
      ) : (
        <div className="grid gap-5">
          <section className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Plantillas por equipo</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {selectedEquipo ? selectedEquipo.nombre : "Todos los equipos"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedEquipo
                    ? `${selectedEquipo.institucionNombre} · ${selectedEquipo.categoria} · ${selectedEquipo.genero}`
                    : "Selecciona una delegacion para revisar solo sus participantes."}
                </p>
              </div>
              <div className="w-full lg:max-w-sm">
                <label className={labelClass}>Equipo</label>
                <select className={fieldClass} value={equipoId} onChange={(e) => setEquipoId(Number(e.target.value))}>
                  {equipos.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.nombre} ({participantesPorEquipo.get(item.id) ?? 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {equipos.slice(0, 8).map((item) => {
                const isActive = item.id === equipoId;
                return (
                  <button
                    className={`rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-blue-200 bg-blue-50 shadow-[0_16px_34px_rgba(37,99,235,0.12)]"
                        : "border-slate-200 bg-white hover:border-blue-100 hover:bg-slate-50"
                    }`}
                    type="button"
                    key={item.id}
                    onClick={() => setEquipoId(item.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-950">{item.nombre}</div>
                        <div className="mt-1 truncate text-xs font-semibold text-slate-500">{item.institucionNombre}</div>
                      </div>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <UsersRound size={17} />
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-2xl font-black text-slate-950">{participantesPorEquipo.get(item.id) ?? 0}</span>
                      <span className="text-xs font-black uppercase text-slate-400">participantes</span>
                    </div>
                  </button>
                );
              })}
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
              placeholder="Buscar participante, documento o codigo..."
            />
            <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
            <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          </div>
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar participante" : "Nuevo participante"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Nombres</label>
            <input className={fieldClass} value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Apellidos</label>
            <input className={fieldClass} value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Documento</label>
            <input className={fieldClass} value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Codigo estudiante</label>
            <input className={fieldClass} value={form.codigoEstudiante} onChange={(e) => setForm({ ...form, codigoEstudiante: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Nacimiento</label>
            <input type="date" className={fieldClass} value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo</label>
            <select className={fieldClass} value={form.equipoId} onChange={(e) => setForm({ ...form, equipoId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
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
