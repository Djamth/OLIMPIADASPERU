"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton } from "@/components/common/Buttons";
import { EmptyState } from "@/components/common/EmptyState";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { deporteService, eventoService, inscripcionService, sorteoService } from "@/services/crudServices";
import type { Deporte, Evento, Grupo, Inscripcion } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useEffect, useState } from "react";

export function SorteosClient() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [deporteId, setDeporteId] = useState<number>(0);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoId, setEventoId] = useState<number>(0);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const confirmadas = inscripciones.filter((item) => item.estado === "CONFIRMADA").length;
  const pendientes = inscripciones.filter((item) => item.estado === "PENDIENTE").length;
  const canceladas = inscripciones.filter((item) => item.estado === "CANCELADA").length;
  const puedeGenerar = Boolean(deporteId) && confirmadas >= 2;

  useEffect(() => {
    Promise.all([deporteService.list(), eventoService.list()])
      .then(([deporteItems, eventoItems]) => {
        setDeportes(deporteItems);
        setDeporteId(deporteItems[0]?.id ?? 0);
        setEventos(eventoItems);
        setEventoId(eventoItems[0]?.id ?? 0);
      })
      .catch((error) => alerts.error("Error al cargar deportes", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!deporteId || !eventoId) return;
    Promise.all([
      sorteoService.listarGruposEvento(eventoId, deporteId).catch(() => []),
      inscripcionService.list({ deporteId, eventoId }),
    ])
      .then(([gruposData, inscripcionesData]) => {
        setGrupos(gruposData);
        setInscripciones(inscripcionesData);
      })
      .catch((error) => {
        setGrupos([]);
        setInscripciones([]);
        alerts.error("Error al cargar datos del sorteo", getErrorMessage(error));
      });
  }, [deporteId, eventoId]);

  const generar = async () => {
    if (!puedeGenerar) {
      await alerts.warning("Sorteo no disponible", "Se requieren al menos dos equipos confirmados para generar grupos.");
      return;
    }
    const result = await alerts.confirm("Generar sorteo", "Se reemplazaran los grupos existentes del deporte seleccionado.");
    if (!result.isConfirmed || !deporteId) return;
    alerts.loading("Generando grupos");
    try {
      const data = await sorteoService.generarGruposEvento(eventoId, deporteId);
      alerts.close();
      setGrupos(data);
      await alerts.success("Sorteo generado");
    } catch (error) {
      alerts.close();
      await alerts.error("No se pudo generar", getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Sorteos"
        description="Genera series aleatorias por deporte con equipos confirmados."
        action={<PrimaryActionButton onClick={generar} disabled={!puedeGenerar}>Generar sorteo</PrimaryActionButton>}
      />

      <div className="mb-4 rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_260px] lg:items-end">
          <div>
            <label className={labelClass}>Evento</label>
            <select className={fieldClass} value={eventoId} onChange={(e) => setEventoId(Number(e.target.value))}>
              {eventos.map((item) => <option value={item.id} key={item.id}>{item.nombre} - {item.institucionNombre}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Equipos inscritos</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">
              {confirmadas} confirmados de {inscripciones.length} inscritos
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              El sorteo usa solo equipos con inscripción confirmada y plantilla válida.
            </p>
          </div>
          <div>
            <label className={labelClass}>Deporte</label>
            <select className={fieldClass} value={deporteId} onChange={(e) => setDeporteId(Number(e.target.value))}>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="text-2xl font-black text-emerald-700">{confirmadas}</div>
            <div className="text-xs font-black uppercase text-emerald-600">Confirmadas</div>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
            <div className="text-2xl font-black text-amber-700">{pendientes}</div>
            <div className="text-xs font-black uppercase text-amber-600">Pendientes</div>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <div className="text-2xl font-black text-red-700">{canceladas}</div>
            <div className="text-xs font-black uppercase text-red-600">Canceladas</div>
          </div>
        </div>
        {!puedeGenerar && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            El boton de sorteo se habilita cuando existan al menos dos equipos confirmados.
          </div>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-lg font-extrabold text-slate-950">Equipos inscritos en el deporte</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">Estos equipos son la base para generar las series.</p>
          </div>
          <Badge tone="blue">{inscripciones.length} inscritos</Badge>
        </div>
        {inscripciones.length === 0 ? (
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            Aun no hay equipos inscritos para este deporte.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {inscripciones.map((item) => (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2" key={item.id}>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-slate-800">{item.equipoNombre}</div>
                  <div className="text-xs font-semibold text-slate-500">{item.fechaInscripcion}</div>
                </div>
                <Badge tone={item.estado === "CONFIRMADA" ? "green" : item.estado === "CANCELADA" ? "red" : "amber"}>
                  {item.estado}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? <LoadingState /> : grupos.length === 0 ? (
        <EmptyState title="Sin grupos generados" description="Genera el sorteo cuando tengas al menos dos equipos confirmados." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {grupos.map((grupo) => (
            <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl" key={grupo.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="m-0 text-lg font-extrabold text-slate-950">{grupo.nombre}</h3>
                  <Badge>{grupo.deporteNombre}</Badge>
                </div>
                <ol className="space-y-2">
                  {grupo.equipos.map((equipo) => (
                    <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700" key={equipo.equipoId}>
                      <span>{equipo.equipoNombre}</span>
                      <Badge tone="slate">Pos. {equipo.posicion}</Badge>
                    </li>
                  ))}
                </ol>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
