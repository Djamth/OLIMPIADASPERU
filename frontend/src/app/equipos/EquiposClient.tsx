"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { CountryFlag } from "@/components/common/CountryFlag";
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
import { categoriaEventoService, deporteService, equipoService } from "@/services/crudServices";
import type { CategoriaEvento, Deporte, Equipo, EquipoRequest, Genero } from "@/types/catalogs";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useState } from "react";

const generos: Genero[] = ["MASCULINO", "FEMENINO", "MIXTO"];

const emptyForm: EquipoRequest = {
  nombre: "",
  categoria: "SUB_17",
  genero: "MASCULINO",
  entrenador: "",
  institucionId: 0,
  categoriaEventoId: 0,
  deporteId: 0,
};

export function EquiposClient() {
  const loader = useCallback(() => equipoService.list(), []);
  const { data, loading, reload } = useAsyncList<Equipo>(loader, {
    cacheKey: "equipos:list",
    ttlMs: 2 * 60_000,
  });
  const [categorias, setCategorias] = useState<CategoriaEvento[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [form, setForm] = useState<EquipoRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const table = useTableControls(data, (item, query) =>
    [item.nombre, item.institucionNombre, item.categoriaEventoNombre ?? item.categoria,
      item.paisNombre ?? "", item.deporteNombre ?? "", item.genero, item.entrenador]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    Promise.all([categoriaEventoService.list(), deporteService.list()])
      .then(([categoriasData, deportesData]) => {
        setCategorias(categoriasData);
        setDeportes(deportesData);
      })
      .catch((error) => alerts.error("Error al cargar catálogos", getErrorMessage(error)));
  }, []);

  const startCreate = () => {
    setEditing(null);
    const categoria = categorias[0];
    setForm({
      ...emptyForm,
      institucionId: categoria?.institucionId ?? 0,
      categoriaEventoId: categoria?.id ?? 0,
      deporteId: deportes[0]?.id ?? 0,
    });
    setOpen(true);
  };

  const startEdit = (item: Equipo) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      categoria: item.categoria,
      genero: item.genero,
      entrenador: item.entrenador,
      institucionId: item.institucionId,
      categoriaEventoId: item.categoriaEventoId ?? 0,
      deporteId: item.deporteId ?? 0,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let message = "Equipo creado";
      if (editing) {
        await equipoService.update(editing.id, form);
        message = "Equipo actualizado";
      } else {
        await equipoService.create(form);
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

  const remove = async (item: Equipo) => {
    const result = await alerts.confirm("Eliminar equipo", `Se eliminara ${item.nombre}.`);
    if (!result.isConfirmed) return;
    try {
      await equipoService.remove(item.id);
      await alerts.success("Equipo eliminado");
      await reload();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Equipo>[] = [
    { key: "equipo", header: "Equipo", render: (item) => <span className="font-bold text-slate-950">{item.nombre}</span> },
    { key: "identidad", header: "Categoría / País", render: (item) => (
      <div>
        <span className="flex items-center gap-2 font-bold"><CountryFlag code={item.bandera} countryName={item.paisNombre} /> {item.paisNombre ?? "Sin país"}</span>
        <p className="text-xs text-slate-500">{item.categoriaEventoNombre ?? item.categoria}</p>
      </div>
    ) },
    { key: "deporte", header: "Deporte", render: (item) => <Badge>{item.deporteNombre ?? "Sin asignar"}</Badge> },
    { key: "genero", header: "Genero", render: (item) => item.genero },
    { key: "entrenador", header: "Entrenador", render: (item) => <span className="text-slate-500">{item.entrenador}</span> },
    { key: "acciones", header: "Acciones", align: "right", render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Equipos"
        description="Gestiona equipos deportivos dentro de cada categoría y país del evento."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo equipo</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : data.length === 0 ? (
        <EmptyState title="Sin equipos" description="Crea equipos para registrar participantes e inscripciones." />
      ) : (
        <div className="module-panel">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar equipo, institución, entrenador..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar equipo" : "Nuevo equipo"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Nombre</label>
            <input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Entrenador</label>
            <input className={fieldClass} value={form.entrenador} onChange={(e) => setForm({ ...form, entrenador: e.target.value })} required />
          </div>
          <div className="md:col-span-8">
            <label className={labelClass}>Categoría del evento</label>
            <select className={fieldClass} value={form.categoriaEventoId} onChange={(e) => {
              const categoria = categorias.find((item) => item.id === Number(e.target.value));
              setForm({ ...form, categoriaEventoId: Number(e.target.value), institucionId: categoria?.institucionId ?? 0 });
            }} required>
              <option value={0} disabled>Seleccionar</option>
              {categorias.map((item) => <option value={item.id} key={item.id}>{item.bandera?.toUpperCase()} - {item.paisNombre} - {item.nombre} ({item.eventoNombre})</option>)}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className={labelClass}>Deporte</label>
            <select className={fieldClass} value={form.deporteId} onChange={(e) => setForm({ ...form, deporteId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar</option>
              {deportes.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-4">
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
