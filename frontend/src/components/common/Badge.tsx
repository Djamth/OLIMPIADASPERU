import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "red" | "amber" | "slate";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-100",
  }[tone];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${toneClass}`}>
      {children}
    </span>
  );
}
