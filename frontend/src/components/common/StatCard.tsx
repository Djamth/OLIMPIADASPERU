import type { SummaryCard } from "@/types/dashboard";
import { Trophy } from "lucide-react";

const toneClasses: Record<SummaryCard["tone"], string> = {
  primary: "bg-blue-50 text-blue-700",
  danger: "bg-red-50 text-red-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
};

export function StatCard({ title, value, subtitle, tone }: SummaryCard) {
  return (
    <div className="surface-card min-h-32 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-500">{title}</div>
          <div className="mb-2 text-4xl font-extrabold text-slate-950">{value}</div>
          <div className="text-sm font-medium text-slate-500">{subtitle}</div>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-lg ${toneClasses[tone]}`}>
          <Trophy size={23} />
        </div>
      </div>
    </div>
  );
}
