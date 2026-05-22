import { Badge } from "@/components/common/Badge";
import { PrimaryActionButton, RowActions } from "@/components/common/Buttons";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Zap } from "lucide-react";

type DemoRow = {
  id: number;
  nombre: string;
  estado: string;
  fecha: string;
};

export function ModulePlaceholder({
  title,
  description,
  buttonLabel,
}: {
  title: string;
  description: string;
  buttonLabel: string;
}) {
  const rows: DemoRow[] = [1, 2, 3].map((row) => ({
    id: row,
    nombre: `${title} Demo ${row}`,
    estado: "Activo",
    fecha: "07/05/2026",
  }));

  const columns: DataTableColumn<DemoRow>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (item) => <span className="font-bold text-slate-800">{item.nombre}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (item) => <Badge tone="green">{item.estado}</Badge>,
    },
    {
      key: "fecha",
      header: "Ultima actualizacion",
      render: (item) => <span className="font-medium text-slate-500">{item.fecha}</span>,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: () => <RowActions onEdit={() => {}} onDelete={() => {}} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={<PrimaryActionButton>{buttonLabel}</PrimaryActionButton>}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-extrabold text-slate-950">Listado principal</h3>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 ring-1 ring-blue-100">
              <Zap size={14} />
              Listo para integrar
            </span>
          </div>
          <DataTable columns={columns} items={rows} getRowKey={(item) => item.id} />
        </section>

        <section className="surface-card h-full p-5">
          <h3 className="mb-3 text-xl font-extrabold text-slate-950">Siguiente paso</h3>
          <p className="mb-4 text-sm font-medium leading-6 text-slate-500">
            Esta vista ya tiene la estructura visual base para enganchar el CRUD del backend.
          </p>
          <ul className="grid gap-2 text-sm font-semibold text-slate-600">
            <li className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">Formulario crear y editar en modal</li>
            <li className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">Consumo real con Axios</li>
            <li className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">Alertas SweetAlert2 para confirmar acciones</li>
          </ul>
        </section>
      </div>
    </>
  );
}
