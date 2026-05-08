import type { SummaryCard } from "@/types/dashboard";

const toneClasses: Record<SummaryCard["tone"], string> = {
  primary: "text-primary bg-primary-subtle",
  danger: "text-danger bg-danger-subtle",
  success: "text-success bg-success-subtle",
  warning: "text-warning bg-warning-subtle",
};

export function StatCard({ title, value, subtitle, icon, tone }: SummaryCard) {
  return (
    <div className="surface-card stat-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <div className="text-soft small mb-2">{title}</div>
          <div className="display-6 fw-bold mb-2">{value}</div>
          <div className="small text-soft">{subtitle}</div>
        </div>
        <div className={`rounded-3 p-3 ${toneClasses[tone]}`}>
          <i className={`bi ${icon} fs-4`} />
        </div>
      </div>
    </div>
  );
}
