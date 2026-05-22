"use client";

import type { Key, ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (item: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  items,
  getRowKey,
}: {
  columns: DataTableColumn<T>[];
  items: T[];
  getRowKey: (item: T) => Key;
}) {
  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={`border-b border-slate-200 bg-slate-50/90 px-4 py-3.5 text-xs font-black uppercase text-slate-500 ${alignClass[column.align ?? "left"]}`}
                key={column.key}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr className="group transition hover:bg-blue-50/50" key={getRowKey(item)}>
              {columns.map((column) => (
                <td
                  className={`px-4 py-4 text-sm font-medium text-slate-700 ${alignClass[column.align ?? "left"]}`}
                  key={column.key}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
