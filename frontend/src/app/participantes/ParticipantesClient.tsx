"use client";

import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PaginationControls } from "@/components/common/PaginationControls";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useTableControls } from "@/hooks/useTableControls";
import { equipoService, participanteService } from "@/services/crudServices";
import type { Equipo, Genero, Participante, ParticipanteRequest } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const generos: Genero[] = ["MASCULINO", "FEMENINO", "MIXTO"];

const emptyForm: ParticipanteRequest = {
  nombres: "",
  apellidos: "",
  numeroDocumento: "",
  genero: "MASCULINO",
  fechaNacimiento: "2009-01-01",
  codigoEstudiante: "",
  equipoId: 0,
};

export function ParticipantesClient() {
  const loader = useCallback(() => participanteService.list(), []);
  const { data, loading, reload } = useAsyncList<Participante>(loader);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Participante | null>(null);
  const [form, setForm] = useState<ParticipanteRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.nombres, item.apellidos, item.numeroDocumento, item.genero, item.codigoEstudiante, item.equipoNombre, item.institucionNombre]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    equipoService.list().then(setEquipos).catch((error) => alerts.error("Error al cargar equipos", getErrorMessage(error)));
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, equipoId: equipos[0]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Participante) => {
    setEditing(item);
    setForm({
      nombres: item.nombres,
      apellidos: item.apellidos,
      numeroDocumento: item.numeroDocumento,
      genero: item.genero,
      fechaNacimiento: item.fechaNacimiento,
      codigoEstudiante: item.codigoEstudiante,
      equipoId: item.equipoId,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Participante creado";
      if (editing) {
        await participanteService.update(editing.id, form);
        message = "Participante actualizado";
      } else {
        await participanteService.create(form);
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

  const remove = async (item: Participante) => {
    const result = await alerts.confirm("Eliminar participante", `Se eliminara ${item.nombres} ${item.apellidos}.`);
    if (!result.isConfirmed) return;
    try {
      await participanteService.remove(item.id);
      await alerts.success("Participante eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Participante>[] = [
    { key: "participante", header: "Participante", render: (item) => <span className="font-bold text-slate-950">{item.apellidos}, {item.nombres}</span> },
    { key: "documento", header: "Documento", render: (item) => item.numeroDocumento },
    { key: "equipo", header: "Equipo", render: (item) => item.equipoNombre },
    { key: "genero", header: "Genero", render: (item) => item.genero },
    { key: "codigo", header: "Codigo", render: (item) => <span className="text-slate-500">{item.codigoEstudiante}</span> },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Participantes"
        description="Registra jugadores por equipo y prepara plantillas competitivas."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo participante</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin participantes" description="Registra jugadores para confirmar inscripciones por deporte." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar participante, documento, equipo..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar participante" : "Nuevo participante"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Nombres</label>
            <input className={fieldClass} value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Apellidos</label>
            <input className={fieldClass} value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Documento</label>
            <input className={fieldClass} value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Codigo estudiante</label>
            <input className={fieldClass} value={form.codigoEstudiante} onChange={(e) => setForm({ ...form, codigoEstudiante: e.target.value })} required />
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Nacimiento</label>
            <input type="date" className={fieldClass} value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Equipo</label>
            <select className={fieldClass} value={form.equipoId} onChange={(e) => setForm({ ...form, equipoId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Genero</label>
            <select className={fieldClass} value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as Genero })}>
              {generos.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </FormModal>
    </>
  );
}
