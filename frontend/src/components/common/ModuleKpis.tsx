import type { ReactNode } from "react";

type ModuleKpi = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
};

const toneClass = {
  blue: "border-blue-200 text-blue-700",
  green: "border-emerald-200 text-emerald-700",
  amber: "border-amber-200 text-amber-700",
  red: "border-red-200 text-red-700",
  slate: "border-slate-200 text-slate-700",
};

export function ModuleKpis({ items }: { items: ModuleKpi[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          className={`rounded-lg border-l-4 border-y border-r border-slate-200/80 bg-transparent px-4 py-3 ${toneClass[item.tone ?? "slate"]}`}
          key={item.label}
        >
          <div className="text-[11px] font-black uppercase tracking-normal text-slate-500">{item.label}</div>
          <div className="mt-1 text-2xl font-black tracking-normal text-slate-950">{item.value}</div>
          {item.hint && <div className="mt-0.5 text-xs font-semibold text-slate-500">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}
