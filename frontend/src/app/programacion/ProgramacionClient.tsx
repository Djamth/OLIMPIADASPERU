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
import { deporteService, equipoService, inscripcionService, programacionService, sorteoService } from "@/services/crudServices";
import type { Deporte, Equipo, EstadoPartido, Grupo, Inscripcion, Partido, PartidoRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [deporteFiltroId, setDeporteFiltroId] = useState<number>(0);
  const loader = useCallback(
    () => programacionService.list(deporteFiltroId ? { deporteId: deporteFiltroId } : undefined),
    [deporteFiltroId],
  );
  const { data, loading, reload } = useAsyncList<Partido>(loader, {
    cacheKey: `programacion:list:${deporteFiltroId || "todos"}`,
    ttlMs: 90_000,
  });
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [inscripcionesForm, setInscripcionesForm] = useState<Inscripcion[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partido | null>(null);
  const [form, setForm] = useState<PartidoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const selectedDeporte = deportes.find((item) => item.id === deporteFiltroId);
  const selectedGrupo = grupos.find((item) => item.id === form.grupoId);
  const equiposInscritos = useMemo(() => {
    const confirmedTeamIds = new Set(inscripcionesForm.filter((item) => item.estado === "CONFIRMADA").map((item) => item.equipoId));
    const groupTeamIds = selectedGrupo ? new Set(selectedGrupo.equipos.map((item) => item.equipoId)) : null;
    return equipos.filter((item) => confirmedTeamIds.has(item.id) && (!groupTeamIds || groupTeamIds.has(item.id)));
  }, [equipos, inscripcionesForm, selectedGrupo]);
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
      .catch((error) => alerts.error("Error al cargar catálogos", getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!form.deporteId) {
      setGrupos([]);
      setInscripcionesForm([]);
      return;
    }
    Promise.all([
      sorteoService.listarGrupos(form.deporteId).catch(() => []),
      inscripcionService.list({ deporteId: form.deporteId }),
    ])
      .then(([gruposData, inscripcionesData]) => {
        setGrupos(gruposData);
        setInscripcionesForm(inscripcionesData);
      })
      .catch(() => {
        setGrupos([]);
        setInscripcionesForm([]);
      });
  }, [form.deporteId]);

  useEffect(() => {
    if (!open || equiposInscritos.length === 0) return;
    const validIds = new Set(equiposInscritos.map((item) => item.id));
    const localId = validIds.has(form.equipoLocalId) ? form.equipoLocalId : equiposInscritos[0]?.id ?? 0;
    const visitanteCandidate = equiposInscritos.find((item) => item.id !== localId)?.id ?? 0;
    const visitanteId = validIds.has(form.equipoVisitanteId) && form.equipoVisitanteId !== localId
      ? form.equipoVisitanteId
      : visitanteCandidate;
    if (localId !== form.equipoLocalId || visitanteId !== form.equipoVisitanteId) {
      setForm((prev) => ({ ...prev, equipoLocalId: localId, equipoVisitanteId: visitanteId }));
    }
  }, [equiposInscritos, form.equipoLocalId, form.equipoVisitanteId, open]);

  const startCreate = () => {
    setEditing(null);
    const deporteInicial = deporteFiltroId || deportes[0]?.id || 0;
    setForm({ ...emptyForm, deporteId: deporteInicial, equipoLocalId: 0, equipoVisitanteId: 0 });
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
    if (form.equipoLocalId === form.equipoVisitanteId) {
      await alerts.warning("Equipos invalidos", "Un equipo no puede jugar contra si mismo.");
      return;
    }
    if (!form.equipoLocalId || !form.equipoVisitanteId) {
      await alerts.warning("Equipos incompletos", "Selecciona dos equipos inscritos y confirmados para el deporte.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, grupoId: form.grupoId || null };
      let message = "Partido programado";
      if (editing) {
        await programacionService.update(editing.id, payload);
        message = "Partido actualizado";
      } else {
        await programacionService.create(payload);
        setDeporteFiltroId(payload.deporteId);
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
        title="Programación"
        description="Organiza partidos por deporte, grupo, sede y fecha."
        action={<PrimaryActionButton onClick={startCreate}>Programar partido</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <div className="grid gap-5">
          <section className="module-panel">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Filtro por deporte</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{selectedDeporte?.nombre ?? "Todos los deportes"}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">Programa y revisa contiendas por disciplina.</p>
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
          <EmptyState title="Sin partidos" description="Programa partidos cuando existan inscripciones confirmadas." />
        </div>
      ) : (
        <div className="grid gap-5">
          <section className="module-panel">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Filtro por deporte</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{selectedDeporte?.nombre ?? "Todos los deportes"}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedDeporte ? `${data.length} partidos programados en ${selectedDeporte.nombre}.` : `${data.length} partidos programados.`}
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
          <div className="module-panel">
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
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar partido" : "Programar partido"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Deporte</label>
            <select className={fieldClass} value={form.deporteId} onChange={(e) => setForm({ ...form, deporteId: Number(e.target.value), grupoId: null, equipoLocalId: 0, equipoVisitanteId: 0 })} required>
              <option value={0} disabled>Seleccionar</option>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Grupo</label>
            <select className={fieldClass} value={form.grupoId ?? 0} onChange={(e) => setForm({ ...form, grupoId: Number(e.target.value) || null, equipoLocalId: 0, equipoVisitanteId: 0 })}>
              <option value={0}>Sin grupo</option>
              {grupos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo local</label>
            <select
              className={fieldClass}
              value={form.equipoLocalId}
              onChange={(e) => {
                const localId = Number(e.target.value);
                const visitanteId = form.equipoVisitanteId === localId
                  ? equiposInscritos.find((item) => item.id !== localId)?.id ?? 0
                  : form.equipoVisitanteId;
                setForm({ ...form, equipoLocalId: localId, equipoVisitanteId: visitanteId });
              }}
              required
            >
              <option value={0} disabled>Seleccionar</option>
              {equiposInscritos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
            <p className="mt-1 text-xs font-semibold text-slate-500">Solo equipos inscritos y confirmados en el deporte/grupo seleccionado.</p>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo visitante</label>
            <select className={fieldClass} value={form.equipoVisitanteId} onChange={(e) => setForm({ ...form, equipoVisitanteId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equiposInscritos.filter((item) => item.id !== form.equipoLocalId).map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
            <p className="mt-1 text-xs font-semibold text-slate-500">No se permite seleccionar el mismo equipo.</p>
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
