"use client";

import { Badge } from "@/components/common/Badge";
import { IconActionButton, PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useTableControls } from "@/hooks/useTableControls";
import { moduloService, rolService } from "@/services/adminServices";
import type { Rol, RolRequest } from "@/types/admin";
import type { Modulo } from "@/types/auth";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type PerfilForm = RolRequest;

const emptyForm: PerfilForm = {
  nombre: "",
  estado: "ACTIVO",
};

export function PerfilesClient() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [modulosPorRol, setModulosPorRol] = useState<Record<number, Modulo[]>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [accessRole, setAccessRole] = useState<Rol | null>(null);
  const [form, setForm] = useState<PerfilForm>(emptyForm);
  const [accessModuloIds, setAccessModuloIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);

  const table = useTableControls(roles, (item, query) =>
    [item.nombre, item.estado, ...(modulosPorRol[item.id] ?? []).map((modulo) => modulo.nombre)]
      .some((value) => value.toLowerCase().includes(query)),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, modulosData] = await Promise.all([rolService.list(), moduloService.list()]);
      const pairs = await Promise.all(rolesData.map(async (rol) => [rol.id, (await rolService.modulos(rol.id)).modulos] as const));
      setRoles(rolesData);
      setModulos(modulosData);
      setModulosPorRol(Object.fromEntries(pairs));
    } catch (error) {
      await alerts.error("No se pudieron cargar perfiles", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (item: Rol) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      estado: item.estado,
    });
    setOpen(true);
  };

  const startAccess = (item: Rol) => {
    setAccessRole(item);
    setAccessModuloIds((modulosPorRol[item.id] ?? []).map((modulo) => modulo.id));
    setAccessOpen(true);
  };

  const toggleAccessModulo = (id: number) => {
    setAccessModuloIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { nombre: form.nombre, estado: form.estado };
      if (editing) {
        await rolService.update(editing.id, payload);
      } else {
        await rolService.create(payload);
      }
      setOpen(false);
      await alerts.success(editing ? "Perfil actualizado" : "Perfil creado");
      await loadData();
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccessSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessRole) return;
    setSavingAccess(true);
    try {
      const response = await rolService.asignarModulos(accessRole.id, accessModuloIds);
      setModulosPorRol((prev) => ({ ...prev, [accessRole.id]: response.modulos }));
      setAccessOpen(false);
      await alerts.success("Accesos actualizados");
    } catch (error) {
      await alerts.error("No se pudieron actualizar los accesos", getErrorMessage(error));
    } finally {
      setSavingAccess(false);
    }
  };

  const remove = async (item: Rol) => {
    const result = await alerts.confirm("Eliminar perfil", `Se eliminara ${item.nombre}.`);
    if (!result.isConfirmed) return;
    try {
      await rolService.remove(item.id);
      await alerts.success("Perfil eliminado");
      await loadData();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const columns: DataTableColumn<Rol>[] = [
    {
      key: "perfil",
      header: "Perfil",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="font-black text-slate-950">{item.nombre}</div>
            <div className="text-xs font-semibold text-slate-400">{(modulosPorRol[item.id] ?? []).length} módulos asignados</div>
          </div>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (item) => <Badge tone={item.estado === "ACTIVO" ? "green" : "slate"}>{item.estado}</Badge>,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (item) => (
        <div className="flex justify-end gap-2">
          <IconActionButton label="Gestionar módulos" tone="neutral" onClick={() => startAccess(item)}>
            <LockKeyhole size={16} />
          </IconActionButton>
          <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Perfiles"
        description="Administra roles y define qué módulos puede usar cada perfil."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo perfil</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : roles.length === 0 ? (
        <EmptyState title="Sin perfiles" description="Crea perfiles para controlar los permisos del sistema." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar perfil o modulo..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar perfil" : "Nuevo perfil"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Nombre del perfil</label>
              <input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select className={fieldClass} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal
        open={accessOpen}
        title={`Módulos permitidos${accessRole ? ` - ${accessRole.nombre}` : ""}`}
        onClose={() => setAccessOpen(false)}
        onSubmit={handleAccessSubmit}
        submitLabel="Guardar accesos"
        submitting={savingAccess}
      >
        <div className="grid gap-3">
          <p className="m-0 text-sm font-semibold text-slate-500">
            Selecciona los módulos que este rol podrá visualizar y usar en el sistema.
          </p>
          <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
            {modulos.map((modulo) => (
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                  accessModuloIds.includes(modulo.id)
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                key={modulo.id}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-600"
                  checked={accessModuloIds.includes(modulo.id)}
                  onChange={() => toggleAccessModulo(modulo.id)}
                />
                <span>{modulo.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      </FormModal>
    </>
  );
}
