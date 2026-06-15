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
    <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <span className="mb-1 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-normal text-blue-700 ring-1 ring-blue-100">
            Módulo operativo
          </span>
          <h2 className="mb-1 text-2xl font-black tracking-normal text-slate-950">{title}</h2>
          <p className="m-0 max-w-2xl text-sm font-medium text-slate-500">{description}</p>
        </div>
        {action && <div className="relative flex shrink-0">{action}</div>}
      </div>
    </section>
  );
}
