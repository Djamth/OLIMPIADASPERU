"use client";

export function FormModal({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Guardar",
  submitting = false,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submitting?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-card surface-card">
        <div className="d-flex align-items-center justify-content-between gap-3 border-bottom p-4">
          <h2 className="h5 mb-0">{title}</h2>
          <button className="btn btn-sm btn-outline-secondary icon-button" type="button" onClick={onClose} aria-label="Cerrar">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-4">{children}</div>
          <div className="d-flex justify-content-end gap-2 border-top p-4">
            <button className="btn btn-outline-secondary rounded-pill px-4" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary rounded-pill px-4" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-2" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
