"use client";

import { Badge } from "@/components/common/Badge";
import { AppShell } from "@/components/layout/AppShell";
import { notificacionService } from "@/services/adminServices";
import type { Notificacion, NotificacionEstadoFiltro } from "@/types/admin";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { Bell, CheckCheck, ClipboardCheck, Filter, MailOpen, Search, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const tipoOptions = [
  { value: "", label: "Todos los tipos" },
  { value: "INSCRIPCION", label: "Inscripciones" },
  { value: "PROGRAMACION", label: "Programación" },
  { value: "RESULTADO", label: "Resultados" },
  { value: "SISTEMA", label: "Sistema" },
];

const estadoOptions: Array<{ value: NotificacionEstadoFiltro; label: string }> = [
  { value: "TODAS", label: "Todas" },
  { value: "NO_LEIDAS", label: "No leídas" },
  { value: "LEIDAS", label: "Leídas" },
];

const toneByType: Record<string, "blue" | "green" | "amber" | "red" | "slate"> = {
  INSCRIPCION: "green",
  PROGRAMACION: "blue",
  RESULTADO: "red",
  SISTEMA: "slate",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function NotificacionesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState<NotificacionEstadoFiltro>("TODAS");
  const [query, setQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await notificacionService.historial({ tipo: tipo || undefined, estado });
      setItems(response.items);
      setUnread(response.noLeidas);
    } catch (error) {
      await alerts.error("No se pudieron cargar notificaciones", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, estado]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => [item.titulo, item.mensaje, item.tipo].join(" ").toLowerCase().includes(term));
  }, [items, query]);

  const markAsRead = async (item: Notificacion) => {
    if (!item.leido) {
      await notificacionService.marcarComoLeida(item.id);
      await loadData();
    }
  };

  const openNotification = async (item: Notificacion) => {
    await markAsRead(item);
    if (item.referencia) {
      router.push(item.referencia);
    }
  };

  const markAll = async () => {
    await notificacionService.marcarTodasComoLeidas();
    await loadData();
    await alerts.success("Notificaciones actualizadas", "Todas las notificaciones quedaron marcadas como leídas.");
  };

  return (
    <AppShell>
      <section className="grid gap-5">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <Bell size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-normal text-slate-950">Centro de notificaciones</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Consulta avisos de inscripciones, programación, resultados y mensajes del sistema.
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-black text-white shadow-[0_18px_34px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={markAll}
            disabled={unread === 0}
          >
            <CheckCheck size={17} />
            Marcar todas como leídas
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric icon={MailOpen} label="Sin leer" value={unread} hint="Pendientes de revisar" />
          <Metric icon={ClipboardCheck} label="Mostradas" value={filteredItems.length} hint="Según filtros activos" />
          <Metric icon={Filter} label="Filtro" value={estado === "TODAS" ? "Todas" : estado === "NO_LEIDAS" ? "No leídas" : "Leídas"} hint={tipo || "Todos los tipos"} />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
            <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Search className="text-slate-400" size={18} />
              <input
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                placeholder="Buscar por título, mensaje o tipo..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <select
              className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none"
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
            >
              {tipoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>

            <select
              className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none"
              value={estado}
              onChange={(event) => setEstado(event.target.value as NotificacionEstadoFiltro)}
            >
              {estadoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-black text-slate-500">
                Cargando notificaciones...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <h2 className="text-lg font-black text-slate-950">Sin notificaciones</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">No hay avisos que coincidan con los filtros actuales.</p>
              </div>
            ) : filteredItems.map((item) => (
              <article
                className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${
                  item.leido ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/70"
                }`}
                key={item.id}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone={toneByType[item.tipo] ?? "slate"}>{item.tipo}</Badge>
                      {!item.leido && <Badge tone="blue">Nuevo</Badge>}
                      <span className="text-xs font-bold text-slate-400">{formatDate(item.creadoEn)}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-950">{item.titulo}</h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{item.mensaje}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!item.leido && (
                      <button
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                        type="button"
                        onClick={() => markAsRead(item)}
                      >
                        Marcar leída
                      </button>
                    )}
                    <button
                      className="h-10 rounded-xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => openNotification(item)}
                      disabled={!item.referencia && item.leido}
                    >
                      {item.referencia ? "Abrir" : "Revisada"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={21} />
      </div>
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <strong className="mt-1 block text-2xl font-black text-slate-950">{value}</strong>
      <p className="mt-1 text-xs font-bold text-slate-500">{hint}</p>
    </div>
  );
}
