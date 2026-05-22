"use client";

import { Badge } from "@/components/common/Badge";
import { IconActionButton, PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass, textareaClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { participanteService, programacionService, resultadoService } from "@/services/crudServices";
import type { Participante, Partido, Resultado, ResultadoAnotacionRequest, ResultadoRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { PlusCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const emptyForm: ResultadoRequest = {
  partidoId: 0,
  puntajeLocal: 0,
  puntajeVisitante: 0,
  observaciones: "",
  anotaciones: [],
};

export function ResultadosClient() {
  const loader = useCallback(() => resultadoService.list(), []);
  const { data, loading, reload } = useAsyncList<Resultado>(loader);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resultado | null>(null);
  const [form, setForm] = useState<ResultadoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.equipoLocal, item.equipoVisitante, item.deporte, item.observaciones ?? "", String(item.puntajeLocal), String(item.puntajeVisitante)]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([programacionService.list(), participanteService.list()])
      .then(([partidosData, participantesData]) => {
        setPartidos(partidosData);
        setParticipantes(participantesData);
      })
      .catch((error) => alerts.error("Error al cargar datos", getErrorMessage(error)));
  }, []);

  const setAnotacion = (index: number, patch: Partial<ResultadoAnotacionRequest>) => {
    const anotaciones = [...(form.anotaciones ?? [])];
    anotaciones[index] = { ...anotaciones[index], ...patch };
    setForm({ ...form, anotaciones });
  };

  const addAnotacion = () => {
    setForm({
      ...form,
      anotaciones: [...(form.anotaciones ?? []), { participanteId: participantes[0]?.id ?? 0, cantidad: 1 }],
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
    setForm({ ...emptyForm, partidoId: partidos[0]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Resultado) => {
    setEditing(item);
    setForm({
      partidoId: item.partidoId,
      puntajeLocal: item.puntajeLocal,
      puntajeVisitante: item.puntajeVisitante,
      observaciones: item.observaciones ?? "",
      anotaciones: item.anotaciones.map((anotacion) => ({
        participanteId: anotacion.participanteId,
        cantidad: anotacion.cantidad,
      })),
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Resultado registrado";
      if (editing) {
        await resultadoService.update(editing.id, form);
        message = "Resultado actualizado";
      } else {
        await resultadoService.create(form);
      }
      setOpen(false);
      await reload();
      await alerts.success(message);
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item: Resultado) => {
    const result = await alerts.confirm("Eliminar resultado", `${item.equipoLocal} vs ${item.equipoVisitante}.`);
    if (!result.isConfirmed) return;
    try {
      await resultadoService.remove(item.id);
      await alerts.success("Resultado eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Resultado>[] = [
    {
      key: "partido",
      header: "Partido",
      render: (item) => (
        <span className="font-bold text-slate-950">
          {item.equipoLocal} vs {item.equipoVisitante}
          <span className="block text-xs font-semibold text-slate-500">{item.observaciones || "Sin observaciones"}</span>
        </span>
      ),
    },
    { key: "deporte", header: "Deporte", render: (item) => item.deporte },
    { key: "marcador", header: "Marcador", render: (item) => <Badge tone="slate">{item.puntajeLocal} - {item.puntajeVisitante}</Badge> },
    { key: "anotaciones", header: "Anotaciones", render: (item) => item.anotaciones?.length ?? 0 },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Resultados"
        description="Carga marcadores y observaciones de cada partido."
        action={<PrimaryActionButton onClick={startCreate}>Registrar resultado</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin resultados" description="Registra el marcador cuando finalice una contienda." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar resultado, equipo o deporte..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar resultado" : "Registrar resultado"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-12">
            <label className={labelClass}>Partido</label>
            <select className={fieldClass} value={form.partidoId} onChange={(e) => setForm({ ...form, partidoId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {partidos.map((item) => <option value={item.id} key={item.id}>{item.equipoLocalNombre} vs {item.equipoVisitanteNombre} - {item.deporteNombre}</option>)}
            </select>
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
              <label className={labelClass}>Anotaciones</label>
              <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-blue-200 bg-white px-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50" onClick={addAnotacion}>
                <PlusCircle size={16} />
                Agregar
              </button>
            </div>
            {(form.anotaciones ?? []).length === 0 ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">Puedes registrar el marcador sin anotadores o agregarlos por participante.</div>
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
                        {participantes.map((item) => (
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
                        required
                      />
                    </div>
                    <div className="flex justify-end md:col-span-1">
                      <IconActionButton label="Quitar anotacion" tone="danger" onClick={() => removeAnotacion(index)}>
                        <X size={16} />
                      </IconActionButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormModal>
    </>
  );
}
