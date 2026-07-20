"use client";

import { Badge } from "@/components/common/Badge";
import { IconActionButton, SecondaryButton } from "@/components/common/Buttons";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass, textareaClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { useAsyncList } from "@/hooks/useAsyncList";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { deporteService, equipoService, participanteService, programacionService, resultadoService } from "@/services/crudServices";
import type { Deporte, Equipo, Participante, Partido, Resultado, ResultadoAnotacionRequest, ResultadoRequest } from "@/types/catalogs";
import { ArrowLeft, Clock3, Edit2, Eye, MessageSquareMore, Share2, ShieldAlert, Target, Trash2, Trophy, Waves } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getSportMeta, ScorePill, TeamIdentity } from "@/components/sports/SportUi";
import { buildChronology, buildGroupSummary, buildQuickStats, getEstimatedDurationLabel, getResultShareLabel, getResultWinnerLabel, getSportLabels, normalizeText } from "./resultados-utils";

const emptyForm: ResultadoRequest = {
  partidoId: 0,
  puntajeLocal: 0,
  puntajeVisitante: 0,
  observaciones: "",
  anotaciones: [],
};

const tabs = [
  { id: "resumen", label: "Resumen", icon: Eye },
  { id: "estadisticas", label: "Estadisticas", icon: Target },
  { id: "anotadores", label: "Anotadores", icon: Trophy },
  { id: "cronologia", label: "Cronologia", icon: Clock3 },
] as const;

type ResultTab = (typeof tabs)[number]["id"];

function normalizeSearchParams(value: Record<string, string | string[] | undefined> | undefined) {
  const params = new URLSearchParams();
  if (!value) return params;
  Object.entries(value).forEach(([key, raw]) => {
    if (Array.isArray(raw)) {
      const first = raw[0];
      if (first) params.set(key, first);
      return;
    }
    if (typeof raw === "string" && raw.length > 0) {
      params.set(key, raw);
    }
  });
  return params;
}

function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 550);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return display;
}

function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const animated = useAnimatedNumber(value);
  return <span className={className}>{animated}</span>;
}

function StatusPill({ label }: { label: string }) {
  return <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15">{label}</span>;
}

function StatCard({ label, value, hint, tone }: { label: string; value: string | number; hint: string; tone: "blue" | "green" | "amber" | "slate" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-50 text-slate-700",
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <ShieldAlert size={17} />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</div>
      <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p>
    </div>
  );
}

export function ResultadosDetailClient({
  resultId,
  returnHref,
  initialSearchParams,
}: {
  resultId: number;
  returnHref: string;
  initialSearchParams?: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ResultTab>("resumen");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resultado | null>(null);
  const [form, setForm] = useState<ResultadoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const loader = useMemo(() => () => resultadoService.list(), []);
  const { data, loading, reload } = useAsyncList<Resultado>(loader, { cacheKey: "resultados:detail:all", ttlMs: 60_000 });
  const resultado = useMemo(() => data.find((item) => item.id === resultId) ?? null, [data, resultId]);
  const selectedDeporte = deportes.find((item) => item.nombre === resultado?.deporte || item.id === partidos.find((partido) => partido.id === resultado?.partidoId)?.deporteId);
  const selectedPartido = partidos.find((item) => item.id === resultado?.partidoId || item.id === form.partidoId);
  const selectedLabels = getSportLabels(resultado?.deporte ?? selectedPartido?.deporteNombre);
  const sportMeta = getSportMeta(resultado?.deporte);
  const quickStats = useMemo(() => (resultado ? buildQuickStats(resultado) : []), [resultado]);
  const chronology = useMemo(() => (resultado ? buildChronology(resultado) : []), [resultado]);
  const grouped = useMemo(() => (resultado ? buildGroupSummary(resultado) : { local: [], visitante: [] }), [resultado]);
  const sharedQuery = useMemo(() => normalizeSearchParams(initialSearchParams).toString(), [initialSearchParams]);
  const backHref = sharedQuery ? `${returnHref}?${sharedQuery}` : returnHref;
  const teamLookup = useMemo(() => {
    const map = new Map<string, Equipo>();
    equipos.forEach((item) => map.set(normalizeText(item.nombre), item));
    return map;
  }, [equipos]);

  const selectedLocalTeam = resultado ? teamLookup.get(normalizeText(resultado.equipoLocal)) : undefined;
  const selectedVisitorTeam = resultado ? teamLookup.get(normalizeText(resultado.equipoVisitante)) : undefined;

  useEffect(() => {
    Promise.all([deporteService.list(), programacionService.list(), participanteService.list(), equipoService.list()])
      .then(([deportesData, partidosData, participantesData, equiposData]) => {
        setDeportes(deportesData);
        setPartidos(partidosData);
        setParticipantes(participantesData);
        setEquipos(equiposData);
        setMetadataError(null);
      })
      .catch((error) => setMetadataError(getErrorMessage(error)))
      .finally(() => setMetadataLoading(false));
  }, []);

  useEffect(() => {
    if (!resultado) return;
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setActiveTab("resumen");
  }, [resultado]);

  const startEdit = () => {
    if (!resultado) return;
    setEditing(resultado);
    setForm({
      partidoId: resultado.partidoId,
      puntajeLocal: resultado.puntajeLocal,
      puntajeVisitante: resultado.puntajeVisitante,
      observaciones: resultado.observaciones ?? "",
      anotaciones: resultado.anotaciones.map((anotacion) => ({
        participanteId: anotacion.participanteId,
        cantidad: anotacion.cantidad,
      })),
    });
    setOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      await resultadoService.update(editing.id, form);
      setOpen(false);
      await reload();
      await alerts.success("Resultado actualizado");
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!resultado) return;
    const confirmed = await alerts.confirm("Eliminar resultado", `${resultado.equipoLocal} vs ${resultado.equipoVisitante}.`);
    if (!confirmed.isConfirmed) return;
    try {
      await resultadoService.remove(resultado.id);
      await alerts.success("Resultado eliminado");
      router.push(backHref);
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const share = async () => {
    if (!resultado) return;
    const url = window.location.href;
    const text = getResultShareLabel(resultado);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Resultado deportivo", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} - ${url}`);
      await alerts.success("Enlace copiado", "El resultado se copio al portapapeles.");
    } catch (error) {
      await alerts.error("No se pudo compartir", getErrorMessage(error));
    }
  };

  const groupedByScorer = useMemo(() => {
    if (!resultado) return { local: [], visitor: [] };
    const map = (items: typeof resultado.anotaciones) => {
      const aggregation = new Map<string, { name: string; count: number }>();
      items.forEach((item) => {
        const key = normalizeText(item.participanteNombreCompleto);
        const current = aggregation.get(key);
        aggregation.set(key, {
          name: item.participanteNombreCompleto,
          count: (current?.count ?? 0) + item.cantidad,
        });
      });
      return Array.from(aggregation.values()).sort((left, right) => right.count - left.count);
    };
    return { local: map(grouped.local), visitor: map(grouped.visitante) };
  }, [grouped.local, grouped.visitante, resultado]);

  const totalScorers = resultado ? new Set(resultado.anotaciones.map((item) => item.participanteId)).size : 0;
  const labels = getSportLabels(resultado?.deporte);

  if (loading || metadataLoading) {
    return <DetailSkeleton />;
  }

  if (metadataError) {
    return <EmptyState title="No pudimos cargar el detalle" description={metadataError} />;
  }

  if (!resultado) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
        <EmptyState title="Resultado no encontrado" description="El encuentro ya no existe o fue movido." />
        <div className="mt-6 flex justify-center">
          <SecondaryButton onClick={() => router.push(backHref)}>Volver</SecondaryButton>
        </div>
      </div>
    );
  }

  const winnerLabel = getResultWinnerLabel(resultado);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(21,101,192,0.10),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="sticky top-3 z-20 rounded-[28px] border border-white/70 bg-white/85 px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
              >
                <ArrowLeft size={17} />
                Volver
              </button>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700">Detalle del encuentro</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{resultado.equipoLocal} vs {resultado.equipoVisitante}</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SecondaryButton onClick={share} className="h-11 rounded-full px-4">
                <Share2 size={16} />
                Compartir
              </SecondaryButton>
              <SecondaryButton onClick={startEdit} className="h-11 rounded-full px-4">
                <Edit2 size={16} />
                Editar
              </SecondaryButton>
              <SecondaryButton onClick={remove} className="h-11 rounded-full border-red-200 text-red-700 hover:border-red-300 hover:text-red-800">
                <Trash2 size={16} />
                Eliminar
              </SecondaryButton>
            </div>
          </div>
        </header>

        <section className={`mt-5 overflow-hidden rounded-[32px] border ${sportMeta.borderClass} bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]`}>
          <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:px-8 lg:py-8">
            <div className="flex flex-col items-center gap-4 text-center lg:items-end lg:text-right">
              <TeamIdentity name={resultado.equipoLocal} flag={selectedLocalTeam?.bandera} countryName={selectedLocalTeam?.paisNombre} size={56} className="ring-4 ring-white/10" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-100/80">Local</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">{resultado.equipoLocal}</h2>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <Badge tone="blue">{resultado.deporte}</Badge>
              <div className="rounded-[32px] border border-white/15 bg-white/10 px-5 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur">
                <div className="flex items-center gap-3 text-5xl font-black tracking-tight text-white sm:text-6xl">
                  <AnimatedNumber value={resultado.puntajeLocal} />
                  <span className="text-slate-300">-</span>
                  <AnimatedNumber value={resultado.puntajeVisitante} />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <StatusPill label={winnerLabel === "Empate" ? "Empate" : `Gana ${winnerLabel}`} />
                <StatusPill label={getEstimatedDurationLabel(resultado.deporte)} />
                <StatusPill label={`${totalScorers} anotadores`} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
              <TeamIdentity name={resultado.equipoVisitante} flag={selectedVisitorTeam?.bandera} countryName={selectedVisitorTeam?.paisNombre} size={56} className="ring-4 ring-white/10" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-100/80">Visitante</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">{resultado.equipoVisitante}</h2>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4 xl:px-8">
            {quickStats.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-100/75">{item.label}</p>
                <div className="mt-1 text-lg font-black text-white">{item.value}</div>
                <p className="mt-1 text-xs font-semibold text-slate-200/80">{item.hint}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                    active
                      ? "bg-blue-700 text-white shadow-[0_18px_36px_rgba(29,78,216,0.25)]"
                      : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <section id="panel-resumen" role="tabpanel" aria-labelledby="tab-resumen" hidden={activeTab !== "resumen"} className="space-y-5">
            <div className={`rounded-[28px] border ${sportMeta.borderClass} bg-white p-5 shadow-sm`}>
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareMore className="text-blue-700" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Observaciones y momentos clave</h3>
              </div>
              <p className="text-sm leading-7 text-slate-600">{resultado.observaciones || "Sin observaciones adicionales para este encuentro."}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {chronology.slice(1, 3).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{item.minute}</p>
                    <h4 className="mt-1 text-sm font-black text-slate-950">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Marcador final" value={`${resultado.puntajeLocal}-${resultado.puntajeVisitante}`} hint="Score principal del encuentro" tone="blue" />
              <StatCard label="Anotaciones" value={resultado.anotaciones.length} hint={`Detalle total en ${labels.plural}`} tone="green" />
              <StatCard label="Tendencia" value={winnerLabel} hint="Resultado dominante del partido" tone="amber" />
            </div>
          </section>

          <section id="panel-estadisticas" role="tabpanel" aria-labelledby="tab-estadisticas" hidden={activeTab !== "estadisticas"} className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Target className="text-blue-700" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Estadisticas derivadas</h3>
              </div>
              <div className="space-y-4">
                {quickStats.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-black text-slate-800">{item.label}</span>
                      <span className="font-black text-slate-500">{item.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: item.label.includes("Posesion") ? String(item.value) : "72%" }} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{item.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="panel-anotadores" role="tabpanel" aria-labelledby="tab-anotadores" hidden={activeTab !== "anotadores"} className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="text-blue-700" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">{selectedLabels.title}</h3>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <TeamScorersPanel
                  title={resultado.equipoLocal}
                  tone="blue"
                  items={groupedByScorer.local}
                  team={selectedLocalTeam?.bandera ? selectedLocalTeam : undefined}
                  helper={selectedLabels.plural}
                />
                <TeamScorersPanel
                  title={resultado.equipoVisitante}
                  tone="green"
                  items={groupedByScorer.visitor}
                  team={selectedVisitorTeam?.bandera ? selectedVisitorTeam : undefined}
                  helper={selectedLabels.plural}
                />
              </div>
            </div>
          </section>

          <section id="panel-cronologia" role="tabpanel" aria-labelledby="tab-cronologia" hidden={activeTab !== "cronologia"} className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Waves className="text-blue-700" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Linea de tiempo</h3>
              </div>

              <div className="space-y-3">
                {chronology.map((event) => (
                  <div key={event.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xs font-black ${event.accent === "blue" ? "bg-blue-50 text-blue-700" : event.accent === "green" ? "bg-emerald-50 text-emerald-700" : event.accent === "amber" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                      {event.minute}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-slate-950">{event.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="text-blue-700" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Resumen rapido</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {quickStats.slice(4).map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <div className="mt-2 text-2xl font-black text-slate-950">{item.value}</div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{item.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <FormModal open={open} title="Editar resultado" onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-12">
              <label className={labelClass}>Partido</label>
              <input className={fieldClass} value={selectedPartido ? `${selectedPartido.equipoLocalNombre} vs ${selectedPartido.equipoVisitanteNombre}` : ""} readOnly />
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
              <textarea className={textareaClass} rows={4} value={form.observaciones ?? ""} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
            </div>
          </div>
        </FormModal>
      </div>
    </div>
  );
}

function TeamScorersPanel({
  title,
  items,
  tone,
  helper,
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
  tone: "blue" | "green";
  helper: string;
  team?: Equipo;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{helper}</p>
        </div>
        <Badge tone={tone === "blue" ? "blue" : "green"}>{items.length}</Badge>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-500">Sin anotaciones registradas para este equipo.</p>
        ) : (
          items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{item.name}</p>
              </div>
              <Badge tone="slate">{item.count}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="h-20 animate-pulse rounded-[28px] bg-white shadow-sm" />
        <div className="h-[280px] animate-pulse rounded-[32px] bg-slate-900" />
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-5">
            <div className="h-[320px] animate-pulse rounded-[28px] bg-white shadow-sm" />
            <div className="h-[180px] animate-pulse rounded-[28px] bg-white shadow-sm" />
          </div>
          <div className="space-y-5">
            <div className="h-[220px] animate-pulse rounded-[28px] bg-white shadow-sm" />
            <div className="h-[180px] animate-pulse rounded-[28px] bg-slate-950 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
