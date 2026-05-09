export function LoadingState({ label = "Cargando datos..." }: { label?: string }) {
  return (
    <div className="surface-card p-5 text-center">
      <div className="spinner-border text-primary mb-3" role="status" />
      <p className="mb-0 text-soft">{label}</p>
    </div>
  );
}
