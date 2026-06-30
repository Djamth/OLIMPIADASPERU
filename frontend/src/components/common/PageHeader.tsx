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
    <section className="mb-5">
      <div className="relative flex flex-col gap-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <h2 className="mb-1 text-2xl font-black tracking-normal text-slate-950">{title}</h2>
          <p className="m-0 max-w-2xl text-sm font-medium text-slate-500">{description}</p>
        </div>
        {action && <div className="relative flex shrink-0">{action}</div>}
      </div>
    </section>
  );
}
