"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton, RowActions, SecondaryButton } from "@/components/common/Buttons";
import { CountryFlag } from "@/components/common/CountryFlag";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { categoriaEventoService, eventoHistoryService, eventoService, institucionService, paisService } from "@/services/crudServices";
import type {
  CategoriaEvento,
  CategoriaEventoRequest,
  EstadoEvento,
  Evento,
  EventoRequest,
  Institucion,
  Pais,
} from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { CopyPlus, Flag, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const currentYear = new Date().getFullYear();
const emptyEvent: EventoRequest = {
  nombre: `Olimpiadas Internas ${currentYear}`,
  anio: currentYear,
  fechaInicio: `${currentYear}-07-01`,
  fechaFin: `${currentYear}-07-31`,
  estado: "BORRADOR",
  institucionId: 0,
};
const emptyCategory: CategoriaEventoRequest = {
  nombre: "",
  nivel: "",
  descripcion: "",
  eventoId: 0,
  paisId: null,
};

function allowedStatuses(current?: EstadoEvento): EstadoEvento[] {
  if (!current) return ["BORRADOR"];
  const next: Partial<Record<EstadoEvento, EstadoEvento>> = {
    BORRADOR: "INSCRIPCIONES",
    INSCRIPCIONES: "EN_CURSO",
    EN_CURSO: "FINALIZADO",
  };
  return next[current] ? [current, next[current]!] : [current];
}

export function EventosClient() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [categorias, setCategorias] = useState<CategoriaEvento[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventModal, setEventModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoriaEvento | null>(null);
  const [eventForm, setEventForm] = useState<EventoRequest>(emptyEvent);
  const [categoryForm, setCategoryForm] = useState<CategoriaEventoRequest>(emptyCategory);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eventData, categoryData, institutionData, countryData] = await Promise.all([
        eventoService.list(),
        categoriaEventoService.list(),
        institucionService.list(),
        paisService.list(),
      ]);
      setEventos(eventData);
      setCategorias(categoryData);
      setInstituciones(institutionData);
      setPaises(countryData.filter((item) => item.activo));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch((error) => alerts.error("No se pudo cargar la configuración", getErrorMessage(error)));
  }, [load]);

  const categoriesByEvent = useMemo(() => {
    const result = new Map<number, CategoriaEvento[]>();
    categorias.forEach((item) => result.set(item.eventoId, [...(result.get(item.eventoId) ?? []), item]));
    return result;
  }, [categorias]);

  const selectedPais = paises.find((item) => item.id === categoryForm.paisId);
  const duplicateCountry = selectedPais
    ? categorias.find((item) =>
      item.eventoId === categoryForm.eventoId
      && item.id !== editingCategory?.id
      && item.paisId === selectedPais.id)
    : null;

  const openEvent = (item?: Evento) => {
    setEditingEvent(item ?? null);
    setEventForm(item ? {
      nombre: item.nombre, anio: item.anio, fechaInicio: item.fechaInicio, fechaFin: item.fechaFin,
      estado: item.estado, institucionId: item.institucionId,
    } : { ...emptyEvent, institucionId: instituciones[0]?.id ?? 0 });
    setEventModal(true);
  };

  const openCategory = (item?: CategoriaEvento, eventId?: number) => {
    setEditingCategory(item ?? null);
    setCategoryForm(item ? {
      nombre: item.nombre, nivel: item.nivel ?? "", descripcion: item.descripcion ?? "",
      eventoId: item.eventoId, paisId: item.paisId,
    } : { ...emptyCategory, eventoId: eventId ?? eventos[0]?.id ?? 0 });
    setCategoryModal(true);
  };

  const saveEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editingEvent) await eventoService.update(editingEvent.id, eventForm);
      else await eventoService.create(eventForm);
      setEventModal(false);
      await load();
      await alerts.success(editingEvent ? "Evento actualizado" : "Evento creado");
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (duplicateCountry) {
      await alerts.warning("País repetido", `${selectedPais?.nombre} ya está asignado a ${duplicateCountry.nombre} en este evento.`);
      return;
    }
    setSubmitting(true);
    try {
      if (editingCategory) await categoriaEventoService.update(editingCategory.id, categoryForm);
      else await categoriaEventoService.create(categoryForm);
      setCategoryModal(false);
      await load();
      await alerts.success(editingCategory ? "Categoría actualizada" : "País asignado correctamente");
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const removeEvent = async (item: Evento) => {
    const confirmation = await alerts.confirm("Eliminar evento", "Solo es posible si no tiene categorías asociadas.");
    if (!confirmation.isConfirmed) return;
    try {
      await eventoService.remove(item.id);
      await load();
      await alerts.success("Evento eliminado");
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const removeCategory = async (item: CategoriaEvento) => {
    const confirmation = await alerts.confirm("Eliminar categoría", `Se liberará el país ${item.paisNombre}.`);
    if (!confirmation.isConfirmed) return;
    try {
      await categoriaEventoService.remove(item.id);
      await load();
      await alerts.success("Categoría eliminada");
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const createNextEdition = async (item: Evento) => {
    const confirmation = await alerts.choose(
      "Crear siguiente edición",
      "Puedes conservar la identidad actual o asignar nuevos países automáticamente.",
      "Conservar países",
      "Reasignar países",
    );
    if (!confirmation.isConfirmed && !confirmation.isDenied) return;
    const conservarPaises = confirmation.isConfirmed;
    try {
      await eventoHistoryService.createNextEdition(item.id, conservarPaises);
      await load();
      await alerts.success(
        "Siguiente edición creada",
        conservarPaises ? "Se conservaron los países actuales." : "Se asignaron nuevos países sin duplicados.",
      );
    } catch (error) {
      await alerts.error("No se pudo crear la edición", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Evento>[] = [
    { key: "evento", header: "Evento", render: (item) => <div><b>{item.nombre}</b><p className="text-xs text-slate-500">{item.institucionNombre}</p></div> },
    { key: "periodo", header: "Periodo", render: (item) => `${item.fechaInicio} - ${item.fechaFin}` },
    { key: "estado", header: "Estado", render: (item) => <Badge>{item.estado}</Badge> },
    { key: "categorias", header: "Categorías", render: (item) => `${categoriesByEvent.get(item.id)?.length ?? 0} asignadas` },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => (
      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={() => createNextEdition(item)}><CopyPlus size={15} /> Siguiente año</SecondaryButton>
        <SecondaryButton onClick={() => openCategory(undefined, item.id)}><Flag size={15} /> Categoría</SecondaryButton>
        <RowActions onEdit={() => openEvent(item)} onDelete={() => removeEvent(item)} />
      </div>
    ) },
  ];

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Eventos y categorías"
        description="Configura cada edición y asigna una identidad de país única a sus categorías."
        action={<PrimaryActionButton onClick={() => openEvent()}>Nuevo evento</PrimaryActionButton>}
      />

      <div className="grid gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <DataTable columns={columns} items={eventos} getRowKey={(item) => item.id} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Identidad del torneo</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Categorías y países asignados</h2>
            </div>
            <SecondaryButton onClick={() => openCategory()}><Sparkles size={16} /> Asignar automáticamente</SecondaryButton>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categorias.map((item) => (
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white" key={item.id}>
                <div className="h-2" style={{ background: `linear-gradient(90deg, ${item.colorPrimario}, ${item.colorSecundario})` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 text-lg font-black text-slate-950">
                        <CountryFlag code={item.bandera} countryName={item.paisNombre} className="text-xl" />
                        {item.paisNombre}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-600">{item.nombre}</p>
                      <p className="text-xs text-slate-400">{item.eventoNombre}</p>
                    </div>
                    <RowActions onEdit={() => openCategory(item)} onDelete={() => removeCategory(item)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <FormModal open={eventModal} title={editingEvent ? "Editar evento" : "Nuevo evento"} onClose={() => setEventModal(false)} onSubmit={saveEvent} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className={labelClass}>Nombre</label><input className={fieldClass} value={eventForm.nombre} onChange={(e) => setEventForm({ ...eventForm, nombre: e.target.value })} required /></div>
          <div><label className={labelClass}>Institución</label><select className={fieldClass} value={eventForm.institucionId} onChange={(e) => setEventForm({ ...eventForm, institucionId: Number(e.target.value) })} required><option value={0}>Seleccionar</option>{instituciones.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></div>
          <div><label className={labelClass}>Fecha inicio</label><input type="date" className={fieldClass} value={eventForm.fechaInicio} onChange={(e) => setEventForm({ ...eventForm, fechaInicio: e.target.value })} required /></div>
          <div><label className={labelClass}>Fecha fin</label><input type="date" className={fieldClass} value={eventForm.fechaFin} onChange={(e) => setEventForm({ ...eventForm, fechaFin: e.target.value })} required /></div>
          <div><label className={labelClass}>Año</label><input type="number" className={fieldClass} value={eventForm.anio} onChange={(e) => setEventForm({ ...eventForm, anio: Number(e.target.value) })} required /></div>
          <div><label className={labelClass}>Estado</label><select className={fieldClass} value={eventForm.estado} onChange={(e) => setEventForm({ ...eventForm, estado: e.target.value as EstadoEvento })}>{allowedStatuses(editingEvent?.estado).map((item) => <option key={item}>{item}</option>)}</select><p className="mt-1 text-xs font-semibold text-slate-500">El avance es secuencial y no puede revertirse.</p></div>
        </div>
      </FormModal>

      <FormModal open={categoryModal} title={editingCategory ? "Editar categoría" : "Nueva categoría"} onClose={() => setCategoryModal(false)} onSubmit={saveCategory} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className={labelClass}>Evento</label><select className={fieldClass} value={categoryForm.eventoId} onChange={(e) => setCategoryForm({ ...categoryForm, eventoId: Number(e.target.value) })} required><option value={0}>Seleccionar</option>{eventos.map((item) => <option key={item.id} value={item.id}>{item.nombre} - {item.institucionNombre}</option>)}</select></div>
          <div><label className={labelClass}>Categoría</label><input className={fieldClass} placeholder="Ej. Primer año" value={categoryForm.nombre} onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })} required /></div>
          <div><label className={labelClass}>Nivel</label><input className={fieldClass} placeholder="Ej. Secundaria" value={categoryForm.nivel ?? ""} onChange={(e) => setCategoryForm({ ...categoryForm, nivel: e.target.value })} /></div>
          <div><label className={labelClass}>País</label><select className={fieldClass} value={categoryForm.paisId ?? ""} onChange={(e) => setCategoryForm({ ...categoryForm, paisId: e.target.value ? Number(e.target.value) : null })}><option value="">Asignar automáticamente</option>{paises.map((item) => <option key={item.id} value={item.id}>{item.bandera.toUpperCase()} - {item.nombre}</option>)}</select></div>

          <div className="md:col-span-2">
            {selectedPais ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="h-2" style={{ background: `linear-gradient(90deg, ${selectedPais.colorPrimario}, ${selectedPais.colorSecundario})` }} />
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                      <CountryFlag code={selectedPais.bandera} countryName={selectedPais.nombre} className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-950">{selectedPais.nombre}</p>
                      <p className="text-sm font-semibold text-slate-500">{selectedPais.codigo} · {selectedPais.datoCultural}</p>
                    </div>
                  </div>
                  <Badge tone={duplicateCountry ? "red" : "green"}>{duplicateCountry ? "País repetido" : "Disponible"}</Badge>
                </div>
                {duplicateCountry && (
                  <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {selectedPais.nombre} ya está asignado a la categoría {duplicateCountry.nombre}. El backend también bloqueará esta repetición.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                Si dejas el país vacío, el sistema asignará automáticamente uno disponible para este evento.
              </div>
            )}
          </div>

          <div className="md:col-span-2"><label className={labelClass}>Descripción</label><textarea className={fieldClass} value={categoryForm.descripcion ?? ""} onChange={(e) => setCategoryForm({ ...categoryForm, descripcion: e.target.value })} /></div>
        </div>
      </FormModal>
    </>
  );
}
