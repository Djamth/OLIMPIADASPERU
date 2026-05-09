"use client";

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
    <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
      <div className="input-group table-search">
        <span className="input-group-text bg-white">
          <i className="bi bi-search" />
        </span>
        <input
          className="form-control"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
        />
        {query && (
          <button className="btn btn-outline-secondary icon-button" onClick={() => onQueryChange("")} type="button" aria-label="Limpiar busqueda">
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      <div className="d-flex align-items-center justify-content-between justify-content-lg-end gap-3">
        <span className="small text-soft text-nowrap">
          {filteredItems} de {totalItems}
        </span>
        <select
          className="form-select form-select-sm table-page-size"
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
