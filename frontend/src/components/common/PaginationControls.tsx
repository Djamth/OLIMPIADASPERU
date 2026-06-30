"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1);

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 md:flex-row md:items-center md:justify-between">
      <div className="text-xs font-bold text-slate-500">Pagina {page} de {totalPages}</div>
      <nav aria-label="Paginacion">
        <div className="flex items-center gap-1">
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Anterior"
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          {pages.map((item, index) => {
            const previous = pages[index - 1];
            const showGap = previous && item - previous > 1;
            return (
              <span className="flex items-center gap-1" key={item}>
                {showGap && <span className="px-1.5 text-xs font-bold text-slate-400">...</span>}
                <button
                  className={`h-8 min-w-8 rounded-lg border px-2.5 text-xs font-bold transition ${
                    item === page
                      ? "border-blue-600 bg-blue-600 text-white shadow-[0_10px_20px_rgba(21,101,192,0.22)]"
                      : "border-slate-200 bg-white text-blue-600 shadow-sm hover:bg-blue-50"
                  }`}
                  onClick={() => onPageChange(item)}
                  type="button"
                >
                  {item}
                </button>
              </span>
            );
          })}
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Siguiente"
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>
    </div>
  );
}
