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
    <section className="mb-5 overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(21,101,192,0.11),transparent_30%),radial-gradient(circle_at_92%_0%,rgba(229,57,53,0.08),transparent_24%)]" />
        <div className="relative">
          <span className="mb-1 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-normal text-blue-700 ring-1 ring-blue-100">
            Modulo operativo
          </span>
          <h2 className="mb-1 text-2xl font-black tracking-normal text-slate-950">{title}</h2>
          <p className="m-0 max-w-2xl text-sm font-medium text-slate-500">{description}</p>
        </div>
        {action && <div className="relative flex shrink-0">{action}</div>}
      </div>
    </section>
  );
}
