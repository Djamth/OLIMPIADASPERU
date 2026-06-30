"use client";

import { Search, X } from "lucide-react";

export function TableToolbar({
  query,
  onQueryChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  filteredItems,
  placeholder = "Buscar...",
}: {
  query: string;
  onQueryChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  totalItems: number;
  filteredItems: number;
  placeholder?: string;
}) {
  return (
    <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex h-10 w-full max-w-md items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.035)] ring-1 ring-white">
        <span className="grid h-full w-10 place-items-center text-blue-600">
          <Search size={16} />
        </span>
        <input
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-[13px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
        />
        {query && (
          <button
            className="grid h-full w-10 place-items-center text-slate-400 transition hover:text-slate-900"
            onClick={() => onQueryChange("")}
            type="button"
            aria-label="Limpiar busqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500 ring-1 ring-slate-100">
          {filteredItems} de {totalItems}
        </span>
        <select
          className="h-9 min-w-24 rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label="Filas por pagina"
        >
          {[5, 10, 15, 20, 50].map((value) => (
            <option value={value} key={value}>{value} filas</option>
          ))}
        </select>
      </div>
    </div>
  );
}
