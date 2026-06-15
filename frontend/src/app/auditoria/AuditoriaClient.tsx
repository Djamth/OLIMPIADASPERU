"use client";

import { Badge } from "@/components/common/Badge";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableToolbar } from "@/components/common/TableToolbar";
import { useTableControls } from "@/hooks/useTableControls";
import { auditoriaService } from "@/services/adminServices";
import type { Auditoria } from "@/types/admin";
import { alerts, getErrorMessage } from "@/utils/alerts";
import { useEffect, useState } from "react";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function actionTone(action: string): "blue" | "green" | "red" | "amber" | "slate" {
  if (action.includes("ELIMINAR") || action.includes("DESACTIVAR")) return "red";
  if (action.includes("CREAR") || action.includes("AGREGAR")) return "green";
  if (action.includes("ACTUALIZAR") || action.includes("ASIGNAR")) return "blue";
  return "slate";
}

export function AuditoriaClient() {
  const [items, setItems] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);

  const table = useTableControls(items, (item, query) =>
    [item.usuarioNombre, item.usuarioEmail ?? "", item.accion, item.descripcion]
      .some((value) => value.toLowerCase().includes(query)),
  );

  useEffect(() => {
    auditoriaService.list()
      .then(setItems)
      .catch((error) => alerts.error("No se pudo cargar auditoria", getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const columns: DataTableColumn<Auditoria>[] = [
    {
      key: "fecha",
      header: "Fecha",
      render: (item) => <span className="font-bold text-slate-700">{formatDate(item.fecha)}</span>,
    },
    {
      key: "usuario",
      header: "Usuario",
      render: (item) => (
        <div>
          <div className="font-black text-slate-950">{item.usuarioNombre}</div>
          <div className="text-xs font-semibold text-slate-400">{item.usuarioEmail ?? "Sin correo"}</div>
        </div>
      ),
    },
    {
      key: "accion",
      header: "Accion",
      render: (item) => <Badge tone={actionTone(item.accion)}>{item.accion}</Badge>,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (item) => <span className="text-slate-600">{item.descripcion}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Consulta las acciones recientes realizadas sobre accesos, roles y seguridad."
      />

      {loading ? <LoadingState /> : items.length === 0 ? (
        <EmptyState title="Sin auditoria" description="Aun no se registran acciones administrativas." />
      ) : (
        <div className="rounded-xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <TableToolbar
            query={table.query}
            onQueryChange={table.setQuery}
            pageSize={table.pageSize}
            onPageSizeChange={table.setPageSize}
            totalItems={table.totalItems}
            filteredItems={table.filteredItems}
            placeholder="Buscar usuario, acción o descripción..."
          />
          <DataTable columns={columns} items={table.pageItems} getRowKey={(item) => item.id} />
          <PaginationControls page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
        </div>
      )}
    </>
  );
}
