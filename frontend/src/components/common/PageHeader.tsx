export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="module-header d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
      <div>
        <span className="module-eyebrow">Modulo operativo</span>
        <h2 className="section-title mb-1">{title}</h2>
        <p className="mb-0 text-soft">{description}</p>
      </div>
      {action}
    </div>
  );
}
