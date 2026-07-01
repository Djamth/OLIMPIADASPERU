"use client";

import { RequireModule } from "@/components/auth/RequireModule";
import { Badge } from "@/components/common/Badge";
import { LoadingState } from "@/components/common/LoadingState";
import { Sport3DCharts } from "@/components/dashboard/Sport3DCharts";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/adminServices";
import type { DashboardAlert, DashboardResumen } from "@/types/admin";
import { hasModuleAccess } from "@/utils/access";
import { alerts, getErrorMessage } from "@/utils/alerts";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Medal,
  Trophy,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const metricIcons = [UsersRound, ClipboardCheck, CalendarDays, Medal];
const quickBars = [34, 58, 44, 78, 28, 68, 72, 88, 61, 36];

const moduleLinks = [
  { href: "/usuarios", label: "Usuarios", value: "Accesos", keys: ["/usuarios", "usuarios"] },
  { href: "/perfiles", label: "Perfiles", value: "Roles y modulos", keys: ["/roles", "/modulos", "roles", "modulos"] },
  { href: "/instituciones", label: "Instituciones", value: "Clientes y sedes", keys: ["/instituciones", "instituciones"] },
  { href: "/equipos", label: "Equipos", value: "Delegaciones", keys: ["/equipos", "equipos"] },
  { href: "/programacion", label: "Programacion", value: "Calendario", keys: ["/programacion", "/programaciones", "programaciones"] },
  { href: "/resultados", label: "Resultados", value: "Marcadores", keys: ["/resultados", "resultados"] },
  { href: "/auditoria", label: "Auditoria", value: "Bitacora", keys: ["/auditoria", "auditoria"] },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusTone(estado: string): "blue" | "green" | "red" | "amber" | "slate" {
  if (estado === "PROGRAMADO") return "blue";
  if (estado === "FINALIZADO") return "green";
  if (estado === "REPROGRAMADO") return "amber";
  return "red";
}

function alertTone(alert: DashboardAlert) {
  if (alert.severidad === "danger") return "border-red-100 bg-red-50 text-red-700";
  if (alert.severidad === "warning") return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-blue-100 bg-blue-50 text-blue-700";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const canViewDashboard = hasModuleAccess(user, ["/dashboard", "dashboard"]);
  const visibleModuleLinks = moduleLinks.filter((item) => hasModuleAccess(user, item.keys));

  useEffect(() => {
    if (!canViewDashboard) {
      setLoading(false);
      return;
    }

    dashboardService
      .resumen()
      .then(setSummary)
      .catch((error) => alerts.error("No se pudo cargar el dashboard", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [canViewDashboard]);

  return (
    <AppShell>
      <RequireModule keys={["/dashboard", "dashboard"]}>
        <section className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-700 to-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(37,99,235,0.22)] lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-blue-100/70">Resumen ejecutivo</span>
              <h2 className="mb-2 text-3xl font-black tracking-normal md:text-4xl">Gestion central de Olimpiadas Peru</h2>
              <p className="max-w-3xl text-sm font-semibold leading-6 text-white/75">
                Monitorea deportes, paises, programacion, resultados y alertas del torneo desde un solo panel operativo.
              </p>
            </div>
            <Link
              href="/programacion"
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Ver calendario
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {loading ? (
          <LoadingState />
        ) : summary ? (
          <>
            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summary.metricas.map((item, index) => {
                const Icon = metricIcons[index] ?? Trophy;
                const toneClass = {
                  primary: "bg-blue-50 text-blue-700",
                  success: "bg-emerald-50 text-emerald-700",
                  warning: "bg-amber-50 text-amber-700",
                  danger: "bg-red-50 text-red-700",
                }[item.tone] ?? "bg-slate-50 text-slate-700";

                return (
                  <article
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_22px_55px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5"
                    key={item.title}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`grid h-11 w-11 place-items-center rounded-xl ${toneClass}`}>
                        <Icon size={20} />
                      </div>
                      <Badge tone="slate">Activo</Badge>
                    </div>
                    <p className="mb-1 text-sm font-bold text-slate-500">{item.title}</p>
                    <div className="flex items-end justify-between gap-3">
                      <strong className="text-3xl font-black leading-none text-slate-950">{item.value}</strong>
                      <span className="text-right text-xs font-black text-emerald-600">{item.change}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
              <section className="surface-card p-5">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-blue-700">
                      <BarChart3 size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Vista 3D</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950">Graficas por deporte</h3>
                    <p className="text-sm font-semibold text-slate-500">
                      Equipos, atletas, partidos y resultados comparados en una lectura volumetrica.
                    </p>
                  </div>
                  <Badge tone="blue">{summary.graficasPorDeporte.length} deportes</Badge>
                </div>
                <Sport3DCharts data={summary.graficasPorDeporte} />
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {summary.graficasPorDeporte.map((item) => (
                    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={item.deporte}>
                      <strong className="block text-sm font-black uppercase text-slate-800">{item.deporte}</strong>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                        <span>{item.equipos} equipos</span>
                        <span>{item.participantes} atletas</span>
                        <span>{item.partidos} partidos</span>
                        <span>{item.resultados} resultados</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="surface-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">Alertas operativas</h3>
                    <p className="text-sm font-semibold text-slate-500">Pendientes que requieren atencion.</p>
                  </div>
                  <AlertTriangle className="text-amber-500" size={22} />
                </div>
                <div className="grid gap-3">
                  {summary.alertas.length === 0 ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                      Sin alertas criticas por ahora.
                    </div>
                  ) : (
                    summary.alertas.map((item, index) => (
                      <Link className={`rounded-xl border p-4 transition hover:-translate-y-0.5 ${alertTone(item)}`} href={item.referencia || "/dashboard"} key={`${item.tipo}-${index}`}>
                        <strong className="block text-sm font-black">{item.titulo}</strong>
                        <span className="mt-1 block text-xs font-bold opacity-80">{item.detalle}</span>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <section className="surface-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">Proximas contiendas</h3>
                  <Badge tone="blue">En agenda</Badge>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        {["Deporte", "Encuentro", "Fecha", "Sede", "Estado"].map((header) => (
                          <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-black uppercase text-slate-600" key={header}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.proximasContiendas.map((item) => (
                        <tr className="transition hover:bg-blue-50/40" key={item.id}>
                          <td className="border-b border-slate-100 px-4 py-4 text-sm font-black text-slate-800">{item.deporte}</td>
                          <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-700">{item.encuentro}</td>
                          <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-700">{formatDate(item.fechaHora)}</td>
                          <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-700">{item.sede}</td>
                          <td className="border-b border-slate-100 px-4 py-4 text-sm">
                            <Badge tone={statusTone(item.estado)}>{item.estado}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="surface-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Trophy className="text-red-600" size={20} />
                  <h3 className="text-xl font-black text-slate-950">Modulos rapidos</h3>
                </div>
                <div className="grid gap-3">
                  {visibleModuleLinks.map((item) => (
                    <Link
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-950 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      href={item.href}
                      key={item.href}
                    >
                      <span>
                        <strong className="block text-sm font-black">{item.label}</strong>
                        <small className="mt-0.5 block text-xs font-bold text-slate-500">{item.value}</small>
                      </span>
                      <ArrowUpRight size={16} />
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="surface-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">Resumen por pais/categoria</h3>
                  <Badge tone="slate">{summary.resumenPorPais.length} delegaciones</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {summary.resumenPorPais.map((item) => (
                    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={`${item.pais}-${item.categoria}`}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <strong className="block text-base font-black text-slate-950">{item.bandera} {item.pais}</strong>
                          <span className="text-xs font-bold uppercase text-slate-500">{item.categoria}</span>
                        </div>
                        <Badge tone="blue">{item.participantes} atletas</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-600">
                        <MiniStat label="Equipos" value={item.equipos} />
                        <MiniStat label="Partidos" value={item.partidos} />
                        <MiniStat label="Resultados" value={item.resultados} />
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="surface-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">Actividad semanal</h3>
                  <Badge tone="slate">Ultimos 10 dias</Badge>
                </div>
                <div className="grid h-64 grid-cols-10 items-end gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  {quickBars.map((height, index) => (
                    <div className="flex h-full items-end overflow-hidden rounded-full bg-slate-100" key={index}>
                      <span className="block w-full rounded-full bg-gradient-to-t from-blue-700 to-cyan-400" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <section className="surface-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">Ultimos resultados</h3>
                  <Badge tone="green">Marcadores</Badge>
                </div>
                <div className="grid gap-3">
                  {(summary.ultimosResultados ?? []).length === 0 ? (
                    <p className="m-0 text-sm font-semibold text-slate-500">Aun no hay resultados registrados.</p>
                  ) : (
                    (summary.ultimosResultados ?? []).map((item) => (
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3" key={item.id}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase text-blue-700">{item.deporte}</span>
                          <strong className="text-lg font-black text-slate-950">{item.puntajeLocal} - {item.puntajeVisitante}</strong>
                        </div>
                        <div className="text-sm font-bold text-slate-800">{item.encuentro}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">Ganador: {item.ganador}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="surface-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">Actividad reciente</h3>
                  <Badge tone="slate">Auditoria</Badge>
                </div>
                <div className="grid gap-3">
                  {(summary.actividadReciente ?? []).length === 0 ? (
                    <p className="m-0 text-sm font-semibold text-slate-500">No hay actividad administrativa reciente.</p>
                  ) : (
                    (summary.actividadReciente ?? []).map((item) => (
                      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm" key={item.id}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase text-slate-500">{item.accion}</span>
                          <span className="text-[11px] font-bold text-slate-400">{formatDate(item.fecha)}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">{item.usuario}</div>
                        <p className="m-0 mt-1 text-xs font-semibold text-slate-500">{item.descripcion}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </RequireModule>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white p-2 ring-1 ring-slate-100">
      <strong className="block text-lg font-black text-slate-950">{value}</strong>
      <span className="text-[11px] font-black uppercase text-slate-400">{label}</span>
    </div>
  );
}
