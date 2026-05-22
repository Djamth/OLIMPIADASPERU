"use client";

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
    <div className="pagination-shell d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-3">
      <div className="small text-soft">Pagina {page} de {totalPages}</div>
      <nav aria-label="Paginacion">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(page - 1)} aria-label="Anterior">
              <i className="bi bi-chevron-left" />
            </button>
          </li>
          {pages.map((item, index) => {
            const previous = pages[index - 1];
            const showGap = previous && item - previous > 1;
            return (
              <li className={`page-item ${item === page ? "active" : ""}`} key={item}>
                {showGap && <span className="page-link">...</span>}
                <button className="page-link" onClick={() => onPageChange(item)}>{item}</button>
              </li>
            );
          })}
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(page + 1)} aria-label="Siguiente">
              <i className="bi bi-chevron-right" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
