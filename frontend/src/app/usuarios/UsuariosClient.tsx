"use client";

import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FormModal } from "@/components/common/FormModal";
import { fieldClass, labelClass } from "@/components/common/formStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useAuth } from "@/context/AuthContext";
import { useTableControls } from "@/hooks/useTableControls";
import { rolService, usuarioService } from "@/services/adminServices";
import type { Rol, Usuario, UsuarioCreateRequest, UsuarioUpdateRequest } from "@/types/admin";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useEffect, useState } from "react";

type UsuarioForm = UsuarioCreateRequest & { estado: string };

const emptyForm: UsuarioForm = {
  nombre: "",
  email: "",
  password: "",
  rolId: 0,
  estado: "ACTIVO",
};

export function UsuariosClient() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UsuarioForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const table = useTableControls(usuarios, (item, query) =>
    [item.nombre, item.email, item.estado, roles.find((rol) => rol.id === item.rolId)?.nombre ?? ""]
      .some((value) => value.toLowerCase().includes(query)),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [usuariosData, rolesData] = await Promise.all([usuarioService.list(), rolService.list()]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch (error) {
      await alerts.error("No se pudieron cargar usuarios", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, rolId: roles[0]?.id ?? 0 });
    setOpen(true);
  };

  const startEdit = (item: Usuario) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      email: item.email,
      password: "",
      rolId: item.rolId,
      estado: item.estado,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        const payload: UsuarioUpdateRequest = {
          nombre: form.nombre,
          email: form.email,
          rolId: Number(form.rolId),
          estado: form.estado,
        };
        await usuarioService.update(editing.id, payload);
        await alerts.success("Usuario actualizado");
      } else {
        await usuarioService.create({ ...form, rolId: Number(form.rolId) });
        await alerts.success("Usuario creado");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item: Usuario) => {
    if (item.id === user?.id) {
      await alerts.error("Accion no permitida", "No puedes eliminar tu propio usuario.");
      return;
    }

    const result = await alerts.confirm("Eliminar usuario", `Se eliminara ${item.nombre}.`);
    if (!result.isConfirmed) return;
    try {
      await usuarioService.remove(item.id);
      await alerts.success("Usuario eliminado");
      await loadData();
    } catch (error) {
      await alerts.error("No se pudo eliminar", getErrorMessage(error));
    }
  };

  const toggleEstado = async (item: Usuario) => {
    const nuevoEstado = item.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const isSelf = item.id === user?.id;

    if (isSelf && nuevoEstado === "INACTIVO") {
      await alerts.error("Accion no permitida", "No puedes desactivar tu propio usuario.");
      return;
    }

    const result = await alerts.confirm(
      nuevoEstado === "ACTIVO" ? "Activar usuario" : "Desactivar usuario",
      `Se cambiara el estado de ${item.nombre} a ${nuevoEstado}.`,
    );
    if (!result.isConfirmed) return;

    setTogglingId(item.id);
    try {
      await usuarioService.update(item.id, {
        nombre: item.nombre,
        email: item.email,
        rolId: item.rolId,
        estado: nuevoEstado,
      });
      setUsuarios((prev) =>
        prev.map((usuario) => (usuario.id === item.id ? { ...usuario, estado: nuevoEstado } : usuario)),
      );
      await alerts.success(`Usuario ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"}`);
    } catch (error) {
      await alerts.error("No se pudo cambiar el estado", getErrorMessage(error));
    } finally {
      setTogglingId(null);
    }
  };

  const columns: DataTableColumn<Usuario>[] = [
    {
      key: "nombre",
      header: "Usuario",
      render: (item) => (
        <div>
          <div className="font-black text-slate-950">{item.nombre}</div>
          <div className="text-xs font-semibold text-slate-400">{item.email}</div>
        </div>
      ),
    },
    {
      key: "rol",
      header: "Perfil",
      render: (item) => <Badge tone="blue">{roles.find((rol) => rol.id === item.rolId)?.nombre ?? "Sin rol"}</Badge>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (item) => {
        const active = item.estado === "ACTIVO";
        const isSelf = item.id === user?.id;
        const disabled = togglingId === item.id || (isSelf && active);

        return (
          <button
            type="button"
            role="switch"
            aria-checked={active}
            disabled={disabled}
            onClick={() => toggleEstado(item)}
            className={`inline-flex h-8 w-16 items-center rounded-full border p-1 transition disabled:cursor-not-allowed disabled:opacity-60 ${
              active ? "border-emerald-200 bg-emerald-500" : "border-slate-200 bg-slate-300"
            }`}
            title={isSelf && active ? "No puedes desactivar tu propio usuario" : active ? "Desactivar usuario" : "Activar usuario"}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full bg-white text-[9px] font-black shadow-sm transition ${
                active ? "translate-x-8 text-emerald-700" : "translate-x-0 text-slate-500"
              }`}
            >
              {active ? "ON" : "OFF"}
            </span>
          </button>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (item) => <RowActions onEdit={() => startEdit(item)} onDelete={() => remove(item)} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra accesos, estado y perfil asignado a cada usuario."
        action={<PrimaryActionButton onClick={startCreate}>Nuevo usuario</PrimaryActionButton>}
      />

      {loading ? <LoadingState /> : usuarios.length === 0 ? (
        <EmptyState title="Sin usuarios" description="Crea usuarios para iniciar pruebas por perfil." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar usuario, correo o perfil..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}

      <FormModal open={open} title={editing ? "Editar usuario" : "Nuevo usuario"} onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={labelClass}>Nombre</label>
            <input className={fieldClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="md:col-span-6">
            <label className={labelClass}>Correo</label>
            <input type="email" className={fieldClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!editing && (
            <div className="md:col-span-6">
              <label className={labelClass}>Contrasena</label>
              <input type="password" className={fieldClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
          )}
          <div className="md:col-span-6">
            <label className={labelClass}>Perfil</label>
            <select className={fieldClass} value={form.rolId} onChange={(e) => setForm({ ...form, rolId: Number(e.target.value) })} required>
              <option value={0} disabled>Seleccionar perfil</option>
              {roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
            </select>
          </div>
          {editing && (
            <div className="md:col-span-6">
              <label className={labelClass}>Estado</label>
              <select className={fieldClass} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          )}
        </div>
      </FormModal>
    </>
  );
}
