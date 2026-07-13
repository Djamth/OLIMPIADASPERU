"use client";

import { IconActionButton, PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { CountryFlag } from "@/components/common/CountryFlag";
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
import { equipoService, participanteService, plantillaService } from "@/services/crudServices";
import type { Equipo, Genero, Participante, ParticipanteRequest, PlantillaEquipoRequest, RolParticipante } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { Link2, UsersRound } from "lucide-react";
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
  rolEquipo: "JUGADOR",
  numeroCamiseta: null,
  fotografiaUrl: "",
};

export function ParticipantesClient() {
  const loader = useCallback(() => participanteService.list(), []);
  const { data, loading, reload } = useAsyncList<Participante>(loader, {
    cacheKey: "participantes:list",
    ttlMs: 2 * 60_000,
  });
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoId, setEquipoId] = useState<number>(0);
  const [teamData, setTeamData] = useState<Participante[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Participante | null>(null);
  const [form, setForm] = useState<ParticipanteRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState<Participante | null>(null);
  const [assignment, setAssignment] = useState<PlantillaEquipoRequest>({
    participanteId: 0, equipoId: 0, rol: "JUGADOR", numeroCamiseta: null,
  });
  const selectedEquipo = equipos.find((item) => item.id === equipoId);
  const participantesPorEquipo = useMemo(() => {
    const grouped = new Map<number, number>();
    data.forEach((item) => grouped.set(item.equipoId, (grouped.get(item.equipoId) ?? 0) + 1));
    return grouped;
  }, [data]);
  const filteredByTeam = equipoId ? teamData : data;
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

  useEffect(() => {
    if (!equipoId) return;
    participanteService.list({ equipoId })
      .then(setTeamData)
      .catch((error) => alerts.error("Error al cargar la plantilla", getErrorMessage(error)));
  }, [equipoId, data]);

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
      rolEquipo: item.rolEquipo ?? "JUGADOR",
      numeroCamiseta: item.numeroCamiseta ?? null,
      fotografiaUrl: item.fotografiaUrl ?? "",
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

  const startAssignment = (item: Participante) => {
    const alternative = equipos.find((equipo) => equipo.id !== item.equipoId);
    setAssigning(item);
    setAssignment({
      participanteId: item.id,
      equipoId: alternative?.id ?? 0,
      rol: "JUGADOR",
      numeroCamiseta: null,
    });
  };

  const saveAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await plantillaService.create(assignment);
      setAssigning(null);
      setEquipoId(assignment.equipoId);
      setTeamData(await participanteService.list({ equipoId: assignment.equipoId }));
      await alerts.success("Participante asignado", "Ahora puede competir en el otro deporte sin duplicar sus datos personales.");
    } catch (error) {
      await alerts.error("No se pudo asignar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<Participante>[] = [
    { key: "participante", header: "Participante", render: (item) => <span className="font-bold text-slate-950">{item.apellidos}, {item.nombres}</span> },
    { key: "documento", header: "Documento", render: (item) => item.numeroDocumento },
    { key: "equipo", header: "Equipo", render: (item) => <div><span className="flex items-center gap-2 font-semibold"><CountryFlag code={item.bandera} /> {item.equipoNombre}</span><p className="text-xs text-slate-500">{item.deporteNombre}</p></div> },
    { key: "rol", header: "Rol / Dorsal", render: (item) => `${item.rolEquipo ?? "JUGADOR"}${item.numeroCamiseta ? ` #${item.numeroCamiseta}` : ""}` },
    { key: "genero", header: "Genero", render: (item) => item.genero },
    { key: "codigo", header: "Codigo", render: (item) => <span className="text-slate-500">{item.codigoEstudiante}</span> },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => (
      <div className="flex justify-end gap-2">
        <IconActionButton label="Asignar a otro equipo" tone="neutral" onClick={() => startAssignment(item)}><Link2 size={16} /></IconActionButton>
        <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} />
      </div>
    ) },
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
          <section className="module-panel">
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

          <div className="module-panel">
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
          <div className="md:col-span-4">
            <label className={labelClass}>Rol</label>
            <select className={fieldClass} value={form.rolEquipo ?? "JUGADOR"} onChange={(e) => setForm({ ...form, rolEquipo: e.target.value as RolParticipante })}>
              <option value="JUGADOR">Jugador</option>
              <option value="CAPITAN">Capitan</option>
              <option value="SUPLENTE">Suplente</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Número de camiseta</label>
            <input type="number" min={1} className={fieldClass} value={form.numeroCamiseta ?? ""} onChange={(e) => setForm({ ...form, numeroCamiseta: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Fotografia (URL)</label>
            <input className={fieldClass} value={form.fotografiaUrl ?? ""} onChange={(e) => setForm({ ...form, fotografiaUrl: e.target.value })} />
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

      <FormModal open={Boolean(assigning)} title="Asignar participante a otro deporte" onClose={() => setAssigning(null)} onSubmit={saveAssignment} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
            {assigning?.nombres} {assigning?.apellidos} conservara su DNI y datos personales.
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Nuevo equipo</label>
            <select className={fieldClass} value={assignment.equipoId} onChange={(e) => setAssignment({ ...assignment, equipoId: Number(e.target.value) })} required>
              <option value={0}>Seleccionar</option>
              {equipos.filter((item) => item.id !== assigning?.equipoId).map((item) => (
                <option value={item.id} key={item.id}>{item.paisNombre} - {item.deporteNombre} - {item.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rol</label>
            <select className={fieldClass} value={assignment.rol} onChange={(e) => setAssignment({ ...assignment, rol: e.target.value as RolParticipante })}>
              <option value="JUGADOR">Jugador</option>
              <option value="CAPITAN">Capitan</option>
              <option value="SUPLENTE">Suplente</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Número de camiseta</label>
            <input type="number" min={1} className={fieldClass} value={assignment.numeroCamiseta ?? ""} onChange={(e) => setAssignment({ ...assignment, numeroCamiseta: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>
      </FormModal>
    </>
  );
}
