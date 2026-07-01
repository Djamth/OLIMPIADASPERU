"use client";

import { Badge } from "@/components/common/Badge";
import { IconActionButton, PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { ModuleKpis } from "@/components/common/ModuleKpis";
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
type PermissionKey = "puedeVer" | "puedeCrear" | "puedeEditar" | "puedeEliminar" | "puedeExportar";

type AccessPermission = {
  moduloId: number;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeExportar: boolean;
};

const emptyForm: PerfilForm = {
  nombre: "",
  estado: "ACTIVO",
};

const permissionLabels: Array<{ key: PermissionKey; label: string }> = [
  { key: "puedeVer", label: "Ver" },
  { key: "puedeCrear", label: "Crear" },
  { key: "puedeEditar", label: "Editar" },
  { key: "puedeEliminar", label: "Eliminar" },
  { key: "puedeExportar", label: "Exportar" },
];

function emptyPermission(moduloId: number): AccessPermission {
  return {
    moduloId,
    puedeVer: false,
    puedeCrear: false,
    puedeEditar: false,
    puedeEliminar: false,
    puedeExportar: false,
  };
}

function fullPermission(moduloId: number): AccessPermission {
  return {
    moduloId,
    puedeVer: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: true,
    puedeExportar: true,
  };
}

function permissionFromModule(module: Modulo): AccessPermission {
  return {
    moduloId: module.id,
    puedeVer: module.puedeVer !== false,
    puedeCrear: module.puedeCrear !== false,
    puedeEditar: module.puedeEditar !== false,
    puedeEliminar: module.puedeEliminar !== false,
    puedeExportar: module.puedeExportar !== false,
  };
}

function isAssigned(permission?: AccessPermission) {
  return Boolean(permission?.puedeVer);
}

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
  const [accessPermissions, setAccessPermissions] = useState<Record<number, AccessPermission>>({});
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
    const current = Object.fromEntries((modulosPorRol[item.id] ?? []).map((modulo) => [modulo.id, permissionFromModule(modulo)]));
    setAccessRole(item);
    setAccessPermissions(current);
    setAccessOpen(true);
  };

  const toggleModule = (id: number) => {
    setAccessPermissions((prev) => ({
      ...prev,
      [id]: isAssigned(prev[id]) ? emptyPermission(id) : fullPermission(id),
    }));
  };

  const togglePermission = (id: number, key: PermissionKey) => {
    setAccessPermissions((prev) => {
      const current = prev[id] ?? emptyPermission(id);
      const next = { ...current, [key]: !current[key] };
      if (key !== "puedeVer" && next[key]) {
        next.puedeVer = true;
      }
      if (key === "puedeVer" && !next.puedeVer) {
        return { ...prev, [id]: emptyPermission(id) };
      }
      return { ...prev, [id]: next };
    });
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
      const permisos = Object.values(accessPermissions).filter(isAssigned);
      const response = await rolService.asignarModulos(accessRole.id, permisos);
      setModulosPorRol((prev) => ({ ...prev, [accessRole.id]: response.modulos }));
      setAccessOpen(false);
      await alerts.success("Permisos actualizados");
    } catch (error) {
      await alerts.error("No se pudieron actualizar los permisos", getErrorMessage(error));
    } finally {
      setSavingAccess(false);
    }
  };

  const remove = async (item: Rol) => {
    const result = await alerts.confirm("Eliminar perfil", `Se eliminará ${item.nombre}.`);
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
          <IconActionButton label="Gestionar permisos" tone="neutral" onClick={() => startAccess(item)}>
            <LockKeyhole size={16} />
          </IconActionButton>
          <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} />
        </div>
      ),
    },
  ];

  const perfilesActivos = roles.filter((item) => item.estado === "ACTIVO").length;
  const modulosAsignados = Object.values(modulosPorRol).reduce((total, items) => total + items.length, 0);
  const promedioModulos = roles.length ? Math.round(modulosAsignados / roles.length) : 0;

  return (
    <>
      <PageHeader
        title="Perfiles"
        description="Administra roles, módulos y permisos por acción para cada perfil."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo perfil</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : roles.length === 0 ? (
        <EmptyState title="Sin perfiles" description="Crea perfiles para controlar los permisos del sistema." />
      ) : (
        <div className="module-panel">
          <ModuleKpis
            items={[
              { label: "Perfiles", value: roles.length, hint: "Roles configurados", tone: "blue" },
              { label: "Activos", value: perfilesActivos, hint: "Disponibles para usuarios", tone: "green" },
              { label: "Módulos", value: modulos.length, hint: "Catálogo de accesos", tone: "slate" },
              { label: "Promedio acceso", value: promedioModulos, hint: "Módulos por perfil", tone: "amber" },
            ]}
          />
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar perfil o módulo..."
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
        title={`Permisos del perfil${accessRole ? ` - ${accessRole.nombre}` : ""}`}
        onClose={() => setAccessOpen(false)}
        onSubmit={handleAccessSubmit}
        submitLabel="Guardar permisos"
        submitting={savingAccess}
      >
        <div className="grid gap-3">
          <p className="m-0 text-sm font-semibold text-slate-500">
            Define qué módulos puede ver el rol y qué acciones puede realizar dentro de cada uno.
          </p>
          <div className="max-h-[58vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50">
            <div className="grid min-w-[760px] grid-cols-[240px_repeat(5,1fr)] gap-0 border-b border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              <span>Módulo</span>
              {permissionLabels.map((item) => <span className="text-center" key={item.key}>{item.label}</span>)}
            </div>
            <div className="grid min-w-[760px] gap-1 p-2">
              {modulos.map((modulo) => {
                const permission = accessPermissions[modulo.id] ?? emptyPermission(modulo.id);
                return (
                  <div className="grid grid-cols-[240px_repeat(5,1fr)] items-center rounded-lg border border-slate-200 bg-white px-3 py-2" key={modulo.id}>
                    <button
                      className={`text-left text-sm font-black transition ${isAssigned(permission) ? "text-blue-700" : "text-slate-700"}`}
                      type="button"
                      onClick={() => toggleModule(modulo.id)}
                    >
                      {modulo.nombre}
                      <span className="block text-xs font-semibold text-slate-400">{isAssigned(permission) ? "Asignado" : "Sin acceso"}</span>
                    </button>
                    {permissionLabels.map((item) => (
                      <label className="grid place-items-center" key={item.key}>
                        <input
                          className="h-4 w-4 accent-blue-700"
                          type="checkbox"
                          checked={permission[item.key]}
                          onChange={() => togglePermission(modulo.id, item.key)}
                        />
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </FormModal>
    </>
  );
}
