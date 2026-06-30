"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton } from "@/components/common/Buttons";
import { CountryFlag } from "@/components/common/CountryFlag";
import { EmptyState } from "@/components/common/EmptyState";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { deporteService, eventoService, inscripcionService, sorteoService } from "@/services/crudServices";
import type { Deporte, Evento, Grupo, GrupoEquipo, Inscripcion } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { Shuffle, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

function pairTeams(equipos: GrupoEquipo[]) {
  const pairs: Array<[GrupoEquipo, GrupoEquipo | null]> = [];
  for (let index = 0; index < equipos.length; index += 2) {
    pairs.push([equipos[index], equipos[index + 1] ?? null]);
  }
  return pairs;
}

function TeamSlot({ equipo }: { equipo: GrupoEquipo }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
        <CountryFlag code={equipo.bandera} countryName={equipo.paisNombre} className="text-xl" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-950">{equipo.equipoNombre}</p>
        <p className="truncate text-xs font-semibold text-slate-500">{equipo.paisNombre ?? "Sin país asignado"}</p>
      </div>
    </div>
  );
}

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
    const result = await alerts.confirm("Generar sorteo", "Se reemplazarán los grupos existentes del deporte seleccionado.");
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
        action={<PrimaryActionButton onClick={generar} disabled={!puedeGenerar}><Shuffle size={16} /> Generar sorteo</PrimaryActionButton>}
      />

      <div className="mb-4 module-panel">
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
            El botón de sorteo se habilita cuando existan al menos dos equipos confirmados.
          </div>
        )}
      </div>

      <div className="mb-4 module-panel">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-lg font-extrabold text-slate-950">Equipos inscritos en el deporte</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">Estos equipos son la base para generar las series.</p>
          </div>
          <Badge tone="blue">{inscripciones.length} inscritos</Badge>
        </div>
        {inscripciones.length === 0 ? (
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            Aún no hay equipos inscritos para este deporte.
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
        <div className="grid gap-4 lg:grid-cols-2">
          {grupos.map((grupo) => (
            <div className="module-panel" key={grupo.id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="m-0 text-lg font-black text-slate-950">{grupo.nombre}</h3>
                  <p className="text-sm font-semibold text-slate-500">Cruces sugeridos por posición de sorteo</p>
                </div>
                <Badge>{grupo.deporteNombre}</Badge>
              </div>

              <div className="mb-4 grid gap-3">
                {pairTeams(grupo.equipos).map(([local, visitante], index) => (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3" key={`${local.equipoId}-${visitante?.equipoId ?? "libre"}`}>
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      <Trophy size={14} />
                      Cruce {index + 1}
                    </div>
                    <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)]">
                      <TeamSlot equipo={local} />
                      <span className="grid h-11 place-items-center rounded-full bg-blue-600 text-xs font-black text-white">VS</span>
                      {visitante ? (
                        <TeamSlot equipo={visitante} />
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-center text-sm font-bold text-slate-400">
                          Libre
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <ol className="space-y-2">
                {grupo.equipos.map((equipo) => (
                  <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700" key={equipo.equipoId}>
                    <span className="flex min-w-0 items-center gap-2">
                      <CountryFlag code={equipo.bandera} countryName={equipo.paisNombre} />
                      <span className="truncate">{equipo.equipoNombre}</span>
                    </span>
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
