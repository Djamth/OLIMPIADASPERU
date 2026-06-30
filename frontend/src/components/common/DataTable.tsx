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
    <div className="overflow-x-auto rounded-lg border border-slate-100 bg-transparent">
      <table className="min-w-full border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={`border-b border-slate-200 bg-slate-50/90 px-3 py-2 text-[11px] font-black uppercase leading-4 text-slate-500 ${alignClass[column.align ?? "left"]}`}
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
                  className={`px-3 py-2.5 text-[13px] font-medium leading-5 text-slate-700 ${alignClass[column.align ?? "left"]}`}
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
