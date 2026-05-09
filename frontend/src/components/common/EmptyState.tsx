export function EmptyState({
  title,
  description,
  icon = "bi-inbox",
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  return (
    <div className="surface-card p-5 text-center">
      <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3 empty-icon">
        <i className={`bi ${icon} fs-3`} />
      </div>
      <h3 className="h5 mb-2">{title}</h3>
      <p className="mb-0 text-soft">{description}</p>
    </div>
  );
}
