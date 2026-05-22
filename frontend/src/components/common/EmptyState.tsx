import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/90 p-10 text-center shadow-[0_18px_46px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-600">
        <Inbox size={28} />
      </div>
      <h3 className="mb-2 text-lg font-extrabold text-slate-950">{title}</h3>
      <p className="m-0 text-sm text-slate-500">{description}</p>
    </div>
  );
}
