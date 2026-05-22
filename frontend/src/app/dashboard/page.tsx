"use client";

import { Badge } from "@/components/common/Badge";
import { LoadingState } from "@/components/common/LoadingState";
import { AppShell } from "@/components/layout/AppShell";
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
  { href: "/usuarios", label: "Usuarios", value: "Accesos" },
  { href: "/perfiles", label: "Perfiles", value: "Roles y modulos" },
  { href: "/instituciones", label: "Instituciones", value: "Clientes y sedes" },
  { href: "/equipos", label: "Equipos", value: "Delegaciones" },
  { href: "/programacion", label: "Programacion", value: "Calendario" },
  { href: "/resultados", label: "Resultados", value: "Marcadores" },
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
  const [summary, setSummary] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.resumen()
      .then(setSummary)
      .catch((error) => alerts.error("No se pudo cargar el dashboard", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <section className="mb-4 flex flex-col gap-5 overflow-hidden rounded-xl border border-blue-900/10 bg-blue-700 p-5 text-white shadow-[0_22px_48px_rgba(21,101,192,0.2)] lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <span className="mb-2 block text-xs font-extrabold uppercase text-white/55">Resumen general</span>
          <h2 className="mb-2 text-3xl font-extrabold tracking-normal md:text-4xl">Gestion central de Olimpiadas Peru</h2>
          <p className="max-w-3xl text-sm font-medium text-white/75">
            Monitorea equipos, deportes, programacion, resultados y estadisticas desde un solo panel.
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
                <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">Ultimos 10 dias</span>
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
                <h3 className="text-xl font-extrabold text-slate-950">Proximas contiendas</h3>
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
                <h3 className="text-xl font-extrabold text-slate-950">Modulos rapidos</h3>
              </div>
              <div className="grid gap-3">
                {moduleLinks.map((item) => (
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
        </>
      )}
    </AppShell>
  );
}
