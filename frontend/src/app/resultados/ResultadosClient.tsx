"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton } from "@/components/common/Buttons";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass, textareaClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { deporteService, equipoService, participanteService, programacionService, resultadoService } from "@/services/crudServices";
import type { Deporte, Equipo, Participante, Partido, Resultado, ResultadoAnotacionRequest, ResultadoRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { getSportMeta, ScorePill, SportChip, TeamIdentity } from "@/components/sports/SportUi";
import { BarChart3, LayoutGrid, PlusCircle, Search, Sparkles, Target, Trophy, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getResultWinnerLabel, normalizeText } from "./resultados-utils";
import { PageHeader } from "@/components/common/PageHeader";

const emptyForm: ResultadoRequest = {
  partidoId: 0,
  puntajeLocal: 0,
  puntajeVisitante: 0,
  observaciones: "",
  anotaciones: [],
};

function getSportLabels(deporte?: string) {
  const normalized = (deporte ?? "").toUpperCase();
  if (normalized.includes("FUTBOL") || normalized.includes("FUTSAL")) {
    return { plural: "goles", singular: "gol", title: "Goleadores", helper: "Registra quién anotó y cuántos goles hizo." };
  }
  if (normalized.includes("BASQUET")) {
    return { plural: "puntos", singular: "punto", title: "Encestadores", helper: "Registra puntos individuales para obtener encestadores." };
  }
  if (normalized.includes("VOLEY")) {
    return { plural: "sets", singular: "set", title: "Sets por participante", helper: "Registra participación en sets ganados o puntos destacados." };
  }
  if (normalized.includes("PING")) {
    return { plural: "puntos/sets", singular: "punto/set", title: "Puntos/Sets individuales", helper: "Registra puntos o sets ganados por participante." };
  }
  return { plural: "anotaciones", singular: "anotacion", title: "Estadisticas individuales", helper: "Registra el aporte individual por participante." };
}

function parseNumberParam(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseStringParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : "";
}

function buildQueryString(deporteId: number, query: string, page: number) {
  const params = new URLSearchParams();
  if (deporteId) params.set("deporte", String(deporteId));
  if (query.trim()) params.set("q", query.trim());
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export function ResultadosClient({
  initialSearchParams,
}: {
  initialSearchParams?: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydratedRef = useRef(false);
  const [deporteFiltroId, setDeporteFiltroId] = useState(() => parseNumberParam(initialSearchParams?.deporte, 0));
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resultado | null>(null);
  const [form, setForm] = useState<ResultadoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loader = useCallback(
    () => resultadoService.list(deporteFiltroId ? { deporteId: deporteFiltroId } : undefined),
    [deporteFiltroId],
  );
  const { data, loading, reload } = useAsyncList<Resultado>(loader, {
    cacheKey: `resultados:list:${deporteFiltroId || "todos"}`,
    ttlMs: 90_000,
  });

  const initialQuery = parseStringParam(initialSearchParams?.q);
  const initialPage = parseNumberParam(initialSearchParams?.page, 1);
  const table = useTableControls(
    data,
    (item, query) =>
      [
        item.equipoLocal,
        item.equipoVisitante,
        item.deporte,
        item.observaciones ?? "",
        String(item.puntajeLocal),
        String(item.puntajeVisitante),
        ...(item.anotaciones ?? []).map((anotacion) => anotacion.participanteNombreCompleto),
      ].some((value) => value.toLowerCase().includes(query)),
    8,
    { query: initialQuery, page: initialPage },
  );

  const resultadoPartidoIds = useMemo(() => new Set(data.map((item) => item.partidoId)), [data]);
  const selectedDeporte = deportes.find((item) => item.id === deporteFiltroId);
  const selectedPartido = partidos.find((item) => item.id === form.partidoId);
  const selectedLabels = getSportLabels(selectedPartido?.deporteNombre ?? editing?.deporte);
  const teamLookup = useMemo(() => {
    const map = new Map<string, Equipo>();
    equipos.forEach((item) => map.set(normalizeText(item.nombre), item));
    return map;
  }, [equipos]);
  const selectedTeam = (teamName: string) => teamLookup.get(normalizeText(teamName));
  const partidosDisponibles = useMemo(() => {
    const filteredBySport = deporteFiltroId ? partidos.filter((item) => item.deporteId === deporteFiltroId) : partidos;
    return filteredBySport.filter((item) => editing?.partidoId === item.id || !resultadoPartidoIds.has(item.id));
  }, [deporteFiltroId, editing?.partidoId, partidos, resultadoPartidoIds]);
  const participantesDelPartido = selectedPartido
    ? participantes.filter((item) => item.equipoId === selectedPartido.equipoLocalId || item.equipoId === selectedPartido.equipoVisitanteId)
    : participantes;

  useEffect(() => {
    Promise.all([deporteService.list(), programacionService.list(), participanteService.list(), equipoService.list()])
      .then(([deportesData, partidosData, participantesData, equiposData]) => {
        setDeportes(deportesData);
        setPartidos(partidosData);
        setParticipantes(participantesData);
        setEquipos(equiposData);
      })
      .catch((error) => alerts.error("Error al cargar datos", getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    const query = buildQueryString(deporteFiltroId, table.query, table.page);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [deporteFiltroId, pathname, router, table.page, table.query]);

  const setAnotacion = (index: number, patch: Partial<ResultadoAnotacionRequest>) => {
    const anotaciones = [...(form.anotaciones ?? [])];
    anotaciones[index] = { ...anotaciones[index], ...patch };
    setForm({ ...form, anotaciones });
  };

  const addAnotacion = () => {
    const firstParticipant = participantesDelPartido[0]?.id ?? 0;
    setForm({
      ...form,
      anotaciones: [...(form.anotaciones ?? []), { participanteId: firstParticipant, cantidad: 1 }],
    });
  };

  const removeAnotacion = (index: number) => {
    setForm({
      ...form,
      anotaciones: (form.anotaciones ?? []).filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, partidoId: partidosDisponibles[0]?.id ?? 0, anotaciones: [] });
    setOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing && resultadoPartidoIds.has(form.partidoId)) {
      await alerts.warning("Resultado duplicado", "El partido seleccionado ya tiene un resultado registrado.");
      return;
    }
    if (!form.partidoId) {
      await alerts.warning("Partido requerido", "Selecciona un partido disponible para registrar el resultado.");
      return;
    }
    setSubmitting(true);
    try {
      await resultadoService.create(form);
      setOpen(false);
      const partido = partidos.find((item) => item.id === form.partidoId);
      if (partido?.deporteId) {
        setDeporteFiltroId(partido.deporteId);
      }
      await reload();
      await alerts.success("Resultado registrado");
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const sportCards = useMemo(() => {
    const resultsWithScore = data.filter((item) => item.puntajeLocal + item.puntajeVisitante > 0).length;
    const totalAnotaciones = data.reduce((sum, item) => sum + (item.anotaciones?.length ?? 0), 0);
    const averageScore = data.length === 0 ? 0 : Number((data.reduce((sum, item) => sum + item.puntajeLocal + item.puntajeVisitante, 0) / data.length).toFixed(1));

    return [
      { label: "Resultados", value: data.length, hint: "Partidos registrados", icon: BarChart3 },
      { label: "Marcadores activos", value: resultsWithScore, hint: "Con goles o puntos", icon: Target },
      { label: "Anotaciones", value: totalAnotaciones, hint: "Detalle individual cargado", icon: Users },
      { label: "Promedio", value: averageScore, hint: "Marcador por encuentro", icon: Sparkles },
    ];
  }, [data]);

  const queryString = buildQueryString(deporteFiltroId, table.query, table.page);

  return (
    <div className="space-y-5">
    <PageHeader
        title="Resultados"
        description="Carga marcadores y observaciones de cada partido."
        action={<PrimaryActionButton onClick={startCreate} disabled={partidosDisponibles.length === 0}>Registrar resultado</PrimaryActionButton>}
      />
      

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Filtro rapido</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{selectedDeporte?.nombre ?? "Todos los deportes"}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {selectedDeporte ? `${table.filteredItems} resultados en ${selectedDeporte.nombre}.` : `${table.filteredItems} resultados en total.`}
            </p>
          </div>
          <label className="flex h-12 w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 shadow-sm xl:min-w-[360px]">
            <Search className="text-slate-400" size={18} />
            <input
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Buscar encuentro, anotador u observacion..."
              value={table.query}
              onChange={(event) => table.setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <SportChip label="All Sports" icon={LayoutGrid} active={deporteFiltroId === 0} onClick={() => setDeporteFiltroId(0)} count={data.length} />
          {deportes.map((item) => {
            const meta = getSportMeta(item.nombre);
            return (
              <SportChip
                key={item.id}
                label={item.nombre}
                icon={meta.icon}
                active={deporteFiltroId === item.id}
                onClick={() => setDeporteFiltroId(item.id)}
                count={data.filter((resultado) => normalizeText(resultado.deporte) === normalizeText(item.nombre)).length}
              />
            );
          })}
        </div>
      </section>

      {loading ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState title="Sin resultados" description="Registra el marcador cuando finalice una contienda." />
      ) : table.pageItems.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-black text-slate-950">No encontramos coincidencias</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">Ajusta el filtro o limpia la busqueda para ver otros encuentros.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {table.pageItems.map((item) => {
            const meta = getSportMeta(item.deporte);
            const Icon = meta.icon;
            const localTeam = selectedTeam(item.equipoLocal);
            const visitorTeam = selectedTeam(item.equipoVisitante);
            const winner = getResultWinnerLabel(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(queryString ? `/resultados/${item.id}?${queryString}` : `/resultados/${item.id}`)}
                className={`group flex w-full items-center gap-2.5 rounded-[18px] border ${meta.borderClass} bg-white px-3 py-2 text-left shadow-sm transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]`}
                aria-label={`Abrir detalle de ${item.equipoLocal} contra ${item.equipoVisitante}`}
              >
                <div className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${meta.softClass} ring-1 ring-slate-100 md:flex`}>
                  <Icon size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    <Badge tone={meta.label === "Football" ? "blue" : meta.label === "Basketball" ? "green" : meta.label === "Volleyball" ? "amber" : "slate"}>{item.deporte}</Badge>
                  </div>

                  <div className="mt-1 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-2.5">
                    <div className="min-w-0 text-right sm:flex sm:items-center sm:justify-end sm:gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-slate-950 md:text-[14px]">{item.equipoLocal}</p>
                      </div>
                      <TeamIdentity name={item.equipoLocal} flag={localTeam?.bandera} countryName={localTeam?.paisNombre} size={16} className="hidden ring-2 ring-white sm:grid" />
                    </div>

                    <div className="flex items-center justify-center">
                      <ScorePill home={item.puntajeLocal} away={item.puntajeVisitante} />
                    </div>

                    <div className="min-w-0 sm:flex sm:items-center sm:gap-3">
                      <TeamIdentity name={item.equipoVisitante} flag={visitorTeam?.bandera} countryName={visitorTeam?.paisNombre} size={16} className="hidden ring-2 ring-white sm:grid" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-slate-950 md:text-[14px]">{item.equipoVisitante}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-slate-400 transition group-hover:text-blue-700">
                  <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] sm:inline">Ver</span>
                  <Trophy size={16} />
                </div>
              </button>
            );
          })}

          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar resultado" : "Registrar resultado"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-12">
            <label className={labelClass}>Partido</label>
            <select
              className={fieldClass}
              value={form.partidoId}
              onChange={(e) => setForm({ ...form, partidoId: Number(e.target.value), anotaciones: [] })}
              required
            >
              <option value={0} disabled>Seleccionar</option>
              {partidosDisponibles.map((item) => <option value={item.id} key={item.id}>{item.equipoLocalNombre} vs {item.equipoVisitanteNombre} - {item.deporteNombre}</option>)}
            </select>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Solo se muestran partidos que aun no tienen resultado registrado.
            </p>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Puntaje local</label>
            <input type="number" min={0} className={fieldClass} value={form.puntajeLocal} onChange={(e) => setForm({ ...form, puntajeLocal: Number(e.target.value) })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Puntaje visitante</label>
            <input type="number" min={0} className={fieldClass} value={form.puntajeVisitante} onChange={(e) => setForm({ ...form, puntajeVisitante: Number(e.target.value) })} required />
          </div>
          <div className="md:col-span-12">
            <label className={labelClass}>Observaciones</label>
            <textarea className={textareaClass} rows={3} value={form.observaciones ?? ""} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>
          <div className="md:col-span-12">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <label className={labelClass}>{selectedLabels.title}</label>
                <p className="mt-1 text-xs font-semibold text-slate-500">{selectedLabels.helper}</p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-blue-200 bg-white px-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={addAnotacion}
                disabled={!selectedPartido || participantesDelPartido.length === 0}
              >
                <PlusCircle size={16} />
                Agregar
              </button>
            </div>
            {(form.anotaciones ?? []).length === 0 ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                Puedes registrar el marcador sin detalle individual o agregar {selectedLabels.plural} por participante.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(form.anotaciones ?? []).map((anotacion, index) => (
                  <div className="grid gap-2 md:grid-cols-12" key={index}>
                    <div className="md:col-span-8">
                      <select
                        className={fieldClass}
                        value={anotacion.participanteId}
                        onChange={(e) => setAnotacion(index, { participanteId: Number(e.target.value) })}
                        required
                      >
                        <option value={0} disabled>Seleccionar participante</option>
                        {participantesDelPartido.map((item) => (
                          <option value={item.id} key={item.id}>
                            {item.apellidos}, {item.nombres} - {item.equipoNombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        min={1}
                        className={fieldClass}
                        value={anotacion.cantidad}
                        onChange={(e) => setAnotacion(index, { cantidad: Number(e.target.value) })}
                        title={`Cantidad de ${selectedLabels.plural}`}
                        required
                      />
                    </div>
                    <div className="flex justify-end md:col-span-1">
                      <button
                        type="button"
                        className="inline-grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-white text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeAnotacion(index)}
                        aria-label="Quitar anotacion"
                        title="Quitar anotacion"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormModal>
    </div>
  );
}
