"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
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

  return (
    <>
      <PageHeader
        title="Participantes"
        description="Registra jugadores por equipo y prepara plantillas competitivas."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={startCreate}><i className="bi bi-plus-circle me-2" />Nuevo participante</button>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin participantes" description="Registra jugadores para confirmar inscripciones por deporte." icon="bi-person-badge" />
      ) : (
        <div className="surface-card p-4">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar participante, documento, equipo..."
          />
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Documento</th>
                  <th>Equipo</th>
                  <th>Genero</th>
                  <th>Codigo</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.apellidos}, {item.nombres}</td>
                    <td>{item.numeroDocumento}</td>
                    <td>{item.equipoNombre}</td>
                    <td>{item.genero}</td>
                    <td className="text-soft">{item.codigoEstudiante}</td>
                    <td className="crud-actions text-end">
                      <button className="btn btn-sm btn-outline-primary me-2 icon-button" onClick={() => startEdit(item)} aria-label="Editar"><i className="bi bi-pencil-square" /></button>
                      <button className="btn btn-sm btn-outline-danger icon-button" onClick={() => remove(item)} aria-label="Eliminar"><i className="bi bi-trash3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar participante" : "Nuevo participante"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombres</label>
            <input className="form-control" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Apellidos</label>
            <input className="form-control" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Documento</label>
            <input className="form-control" value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Codigo estudiante</label>
            <input className="form-control" value={form.codigoEstudiante} onChange={(e) => setForm({ ...form, codigoEstudiante: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Nacimiento</label>
            <input type="date" className="form-control" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Equipo</label>
            <select className="form-select" value={form.equipoId} onChange={(e) => setForm({ ...form, equipoId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {equipos.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Genero</label>
            <select className="form-select" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as Genero })}>
              {generos.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </FormModal>
    </>
  );
}
