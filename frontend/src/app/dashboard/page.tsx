"use client";

import { Badge } from "@/components/common/Badge";
import { LoadingState } from "@/components/common/LoadingState";
import { hasModuleAccess, RequireModule } from "@/components/auth/RequireModule";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/adminServices";
import type { DashboardResumen } from "@/types/admin";
import { alerts, getErrorMessage } from "@/utils/alerts";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  Medal,
  Trophy,
  UsersRound,
} from "lucide-react";

const metricIcons = [UsersRound, ClipboardCheck, CalendarDays, Medal];
const bars = [28, 54, 48, 82, 22, 74, 76, 86, 58, 31];

const moduleLinks = [
  { href: "/usuarios", label: "Usuarios", value: "Accesos", keys: ["/usuarios", "usuarios"] },
  { href: "/perfiles", label: "Perfiles", value: "Roles y módulos", keys: ["/roles", "/modulos", "roles", "modulos"] },
  { href: "/instituciones", label: "Instituciones", value: "Clientes y sedes", keys: ["/instituciones", "instituciones"] },
  { href: "/equipos", label: "Equipos", value: "Delegaciones", keys: ["/equipos", "equipos"] },
  { href: "/programacion", label: "Programación", value: "Calendario", keys: ["/programacion", "/programaciones", "programaciones"] },
  { href: "/resultados", label: "Resultados", value: "Marcadores", keys: ["/resultados", "resultados"] },
  { href: "/auditoria", label: "Auditoría", value: "Bitácora", keys: ["/auditoria", "auditoria"] },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

    dashboardService.resumen()
      .then(setSummary)
      .catch((error) => alerts.error("No se pudo cargar el dashboard", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [canViewDashboard]);

  return (
    <AppShell>
      <RequireModule keys={["/dashboard", "dashboard"]}>
      <section className="mb-4 flex flex-col gap-5 overflow-hidden rounded-xl border border-blue-900/10 bg-blue-700 p-5 text-white shadow-[0_22px_48px_rgba(21,101,192,0.2)] lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <span className="mb-2 block text-xs font-extrabold uppercase text-white/55">Resumen general</span>
          <h2 className="mb-2 text-3xl font-extrabold tracking-normal md:text-4xl">Gestión central de Olimpiadas Perú</h2>
          <p className="max-w-3xl text-sm font-medium text-white/75">
            Monitorea equipos, deportes, programación, resultados y estadísticas desde un solo panel.
          </p>
        </div>
        <Link
          href="/programacion"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100"
        >
          Ver calendario
          <ArrowUpRight size={16} />
        </Link>
      </section>

      {loading ? <LoadingState /> : summary && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                  className="min-h-36 rounded-xl border border-white/70 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5"
                  key={item.title}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneClass}`}>
                      <Icon size={19} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Activo</span>
                  </div>
                  <p className="mb-1 text-sm font-medium text-slate-500">{item.title}</p>
                  <div className="flex items-end justify-between gap-3">
                    <strong className="text-3xl font-extrabold leading-none text-slate-950">{item.value}</strong>
                    <span className="whitespace-nowrap text-xs font-bold text-emerald-600">{item.change}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mb-4">
            <section className="surface-card h-full p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="mb-1 text-xl font-extrabold text-slate-950">Actividad semanal</h3>
                  <p className="text-sm font-medium text-slate-500">Partidos registrados por fecha y estado de competencia.</p>
                </div>
                <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">Últimos 10 días</span>
              </div>
              <div className="grid h-56 grid-cols-10 items-end gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                {bars.map((height, index) => (
                  <div className="flex h-full items-end overflow-hidden rounded-full bg-slate-100" key={index}>
                    <span className="block w-full rounded-full bg-blue-600" style={{ height: `${height}%` }} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <section className="surface-card h-full p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-950">Próximas contiendas</h3>
                <Badge tone="blue">En agenda</Badge>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {["Deporte", "Encuentro", "Fecha", "Sede", "Estado"].map((header) => (
                        <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-extrabold uppercase text-slate-600" key={header}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.proximasContiendas.map((item) => (
                      <tr className="transition hover:bg-blue-50/40" key={item.id}>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm font-bold text-slate-800">{item.deporte}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-700">{item.encuentro}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-700">{formatDate(item.fechaHora)}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-700">{item.sede}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm">
                          <Badge tone={statusTone(item.estado)}>{item.estado}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="surface-card h-full p-5">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="text-red-600" size={20} />
                <h3 className="text-xl font-extrabold text-slate-950">Módulos rápidos</h3>
              </div>
              <div className="grid gap-3">
                {visibleModuleLinks.map((item) => (
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-950 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    key={item.href}
                  >
                    <span>
                      <strong className="block text-sm font-extrabold">{item.label}</strong>
                      <small className="mt-0.5 block text-xs font-semibold text-slate-500">{item.value}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section className="surface-card h-full p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-950">Últimos resultados</h3>
                <Badge tone="green">Marcadores</Badge>
              </div>
              <div className="grid gap-3">
                {(summary.ultimosResultados ?? []).length === 0 ? (
                  <p className="m-0 text-sm font-semibold text-slate-500">Aún no hay resultados registrados.</p>
                ) : (summary.ultimosResultados ?? []).map((item) => (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={item.id}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase text-blue-700">{item.deporte}</span>
                      <strong className="text-lg font-black text-slate-950">{item.puntajeLocal} - {item.puntajeVisitante}</strong>
                    </div>
                    <div className="text-sm font-bold text-slate-800">{item.encuentro}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">Ganador: {item.ganador}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-card h-full p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-950">Actividad reciente</h3>
                <Badge tone="slate">Auditoría</Badge>
              </div>
              <div className="grid gap-3">
                {(summary.actividadReciente ?? []).length === 0 ? (
                  <p className="m-0 text-sm font-semibold text-slate-500">No hay actividad administrativa reciente.</p>
                ) : (summary.actividadReciente ?? []).map((item) => (
                  <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm" key={item.id}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase text-slate-500">{item.accion}</span>
                      <span className="text-[11px] font-bold text-slate-400">{formatDate(item.fecha)}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{item.usuario}</div>
                    <p className="m-0 mt-1 text-xs font-semibold text-slate-500">{item.descripcion}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
      </RequireModule>
    </AppShell>
  );
}
