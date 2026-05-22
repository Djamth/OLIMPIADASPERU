"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton } from "@/components/common/Buttons";
import { EmptyState } from "@/components/common/EmptyState";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { deporteService, sorteoService } from "@/services/crudServices";
import type { Deporte, Grupo } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useEffect, useState } from "react";

export function SorteosClient() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [deporteId, setDeporteId] = useState<number>(0);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deporteService.list()
      .then((items) => {
        setDeportes(items);
        setDeporteId(items[0]?.id ?? 0);
      })
      .catch((error) => alerts.error("Error al cargar deportes", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!deporteId) return;
    sorteoService.listarGrupos(deporteId)
      .then(setGrupos)
      .catch(() => setGrupos([]));
  }, [deporteId]);

  const generar = async () => {
    const result = await alerts.confirm("Generar sorteo", "Se reemplazaran los grupos existentes del deporte seleccionado.");
    if (!result.isConfirmed || !deporteId) return;
    alerts.loading("Generando grupos");
    try {
      const data = await sorteoService.generarGrupos(deporteId);
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
        action={<PrimaryActionButton onClick={generar} disabled={!deporteId}>Generar sorteo</PrimaryActionButton>}
      />

      <div className="mb-4 rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <label className={labelClass}>Deporte</label>
        <select className={fieldClass} value={deporteId} onChange={(e) => setDeporteId(Number(e.target.value))}>
          {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
        </select>
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
