"use client";

import { Badge } from "@/components/common/Badge";
import { publicDashboardService } from "@/services/adminServices";
import type { PublicDashboardResumen } from "@/types/admin";
import {
  CalendarDays,
  Medal,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

const metricIcons = [UsersRound, ShieldCheck, CalendarDays, Medal];

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
  return "slate";
}

export default function PublicHomePage() {
  const [summary, setSummary] = useState<PublicDashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicDashboardService
      .resumen()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  const proximasContiendas = summary?.proximasContiendas ?? [];
  const ultimosResultados = summary?.ultimosResultados ?? [];

  return (
    <main className="min-h-screen bg-[#0b3a8d] text-slate-950">
      <section id="inicio" className="relative isolate min-h-screen overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[url('/images/hero.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.10),rgba(255,255,255,0)_34%,rgba(255,255,255,0.08)),linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0)_28%,rgba(2,8,23,0.10)_100%)]" />

        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-blue-700 text-white shadow-[0_14px_35px_rgba(21,101,192,0.28)]">
              <Trophy size={24} />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Olimpiadas Peru</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Portal deportivo</p>
            </div>
          </div>

          <nav className="hidden px-7 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 lg:flex lg:items-center lg:gap-8">
            <a className="transition hover:text-blue-700" href="#inicio">Inicio</a>
            <a className="transition hover:text-blue-700" href="#encuentros">Evento</a>
            <a className="transition hover:text-blue-700" href="#resultados">Resultados</a>
            <a className="transition hover:text-blue-700" href="#clasificacion">Clasificacion</a>
            <a className="transition hover:text-blue-700" href="#estadisticas">Estadisticas</a>
          </nav>

          <a
            className="grid h-11 w-11 place-items-center rounded-full bg-blue-700 text-white shadow-[0_14px_35px_rgba(21,101,192,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-800"
            href="#encuentros"
            aria-label="Ver encuentros"
          >
            <CalendarDays size={19} />
          </a>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6.5rem)] max-w-7xl items-end justify-center px-5 pb-16 text-center lg:px-8">
          <a
            className="inline-flex h-12 items-center justify-center rounded-none bg-blue-700 px-8 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_rgba(21,101,192,0.35)] transition hover:-translate-y-0.5 hover:bg-blue-800"
            href="#clasificacion"
          >
            Clasificacion
          </a>
        </div>
      </section>

      <section id="clasificacion" className="relative overflow-hidden bg-white px-5 py-16 lg:px-8">
        <div className="absolute inset-0 bg-[url('/images/fondoweb.png')] bg-cover bg-center opacity-[0.07]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Clasificacion general</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">Resumen de competencia</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">
              Informacion publica actualizada desde los resultados y programaciones registradas por la organizacion.
            </p>
          </div>

          {loading ? (
            <div className="grid min-h-48 place-items-center rounded-[8px] border border-slate-200 bg-slate-50 text-sm font-bold text-slate-500">
              Cargando informacion publica...
            </div>
          ) : summary ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summary.metricas.map((item, index) => {
                const Icon = metricIcons[index] ?? Trophy;
                return (
                  <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]" key={item.title}>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-blue-50 text-blue-700">
                        <Icon size={21} />
                      </span>
                      <Badge tone="blue">Activo</Badge>
                    </div>
                    <div className="text-3xl font-black text-slate-950">{item.value}</div>
                    <div className="mt-1 text-sm font-bold text-slate-500">{item.title}</div>
                    <div className="mt-4 text-xs font-black uppercase text-emerald-600">{item.change}</div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
              No se pudo cargar el resumen publico.
            </div>
          )}
        </div>
      </section>

      <section id="encuentros" className="relative overflow-hidden bg-slate-50 px-5 py-16 lg:px-8">
        <div className="absolute inset-0 bg-[url('/images/fondoweb.png')] bg-cover bg-center opacity-[0.07]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Evento</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">Proximos encuentros</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {proximasContiendas.length > 0 ? proximasContiendas.map((item) => (
              <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]" key={item.id}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge tone="blue">{item.deporte}</Badge>
                  <Badge tone={statusTone(item.estado)}>{item.estado}</Badge>
                </div>
                <h3 className="text-xl font-black text-slate-950">{item.encuentro}</h3>
                <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                  <div className="rounded-[8px] bg-slate-50 p-3">
                    <CalendarDays className="mb-2 text-blue-700" size={18} />
                    {formatDate(item.fechaHora)}
                  </div>
                  <div className="rounded-[8px] bg-slate-50 p-3">
                    <Trophy className="mb-2 text-red-600" size={18} />
                    {item.sede}
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-[8px] border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
                No hay encuentros programados para mostrar.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="resultados" className="bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Marcadores</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">Ultimos resultados</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ultimosResultados.length > 0 ? ultimosResultados.map((item) => (
              <article className="rounded-[8px] border border-slate-200 bg-slate-50 p-5" key={item.id}>
                <div className="mb-4 flex items-center justify-between">
                  <Badge tone="slate">{item.deporte}</Badge>
                  <strong className="text-3xl font-black text-blue-700">
                    {item.puntajeLocal} - {item.puntajeVisitante}
                  </strong>
                </div>
                <h3 className="text-lg font-black text-slate-950">{item.encuentro}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">Ganador: {item.ganador}</p>
              </article>
            )) : (
              <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                No hay resultados publicados todavia.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="estadisticas" className="bg-slate-950 px-5 py-16 text-white lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">Estadisticas</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal">Ranking, puntos y rendimiento deportivo</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">
              El portal publico presenta los datos deportivos mas relevantes sin exponer el panel administrativo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Futbol: goleadores", "Basquet: encestadores", "Voley: sets", "Ping pong: puntos/sets"].map((item) => (
              <div className="rounded-[8px] border border-white/10 bg-white/5 p-5" key={item}>
                <Medal className="mb-4 text-amber-300" size={26} />
                <div className="text-lg font-black">{item}</div>
                <div className="mt-2 text-sm font-semibold text-slate-400">Actualizado con resultados registrados</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
