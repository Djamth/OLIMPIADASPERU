"use client";

import { CountryFlag } from "@/components/common/CountryFlag";
import { ChevronDown, CircleDot, LayoutGrid, Target, Trophy, Volleyball, type LucideIcon } from "lucide-react";

export type SportMeta = {
  label: string;
  icon: LucideIcon;
  chipClass: string;
  softClass: string;
  borderClass: string;
};

const defaultMeta: SportMeta = {
  label: "All Sports",
  icon: LayoutGrid,
  chipClass: "bg-slate-950 text-white shadow-[0_18px_32px_rgba(15,23,42,0.18)]",
  softClass: "bg-slate-100 text-slate-700",
  borderClass: "border-slate-200",
};

export function getSportMeta(name?: string | null): SportMeta {
  const normalized = (name ?? "").toUpperCase();

  if (normalized.includes("FUTBOL") || normalized.includes("FUTSAL")) {
    return {
      label: "Football",
      icon: Trophy,
      chipClass: "bg-blue-700 text-white shadow-[0_18px_32px_rgba(29,78,216,0.24)]",
      softClass: "bg-blue-50 text-blue-700",
      borderClass: "border-blue-100",
    };
  }

  if (normalized.includes("BASQUET")) {
    return {
      label: "Basketball",
      icon: CircleDot,
      chipClass: "bg-emerald-600 text-white shadow-[0_18px_32px_rgba(5,150,105,0.22)]",
      softClass: "bg-emerald-50 text-emerald-700",
      borderClass: "border-emerald-100",
    };
  }

  if (normalized.includes("VOLEY")) {
    return {
      label: "Volleyball",
      icon: Volleyball,
      chipClass: "bg-violet-600 text-white shadow-[0_18px_32px_rgba(124,58,237,0.22)]",
      softClass: "bg-violet-50 text-violet-700",
      borderClass: "border-violet-100",
    };
  }

  if (normalized.includes("PING")) {
    return {
      label: "Table Tennis",
      icon: Target,
      chipClass: "bg-amber-500 text-white shadow-[0_18px_32px_rgba(245,158,11,0.22)]",
      softClass: "bg-amber-50 text-amber-700",
      borderClass: "border-amber-100",
    };
  }

  return defaultMeta;
}

export function SportChip({
  label,
  icon: Icon,
  active,
  onClick,
  count,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-black transition-all duration-300 ${
        active
          ? "border-transparent bg-blue-700 text-white shadow-[0_18px_36px_rgba(29,78,216,0.26)]"
          : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {typeof count === "number" && (
        <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-black ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function TeamIdentity({
  name,
  flag,
  countryName,
  size = 20,
  className = "",
}: {
  name: string;
  flag?: string | null;
  countryName?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "OP";

  if (flag && /^[a-z]{2}$/i.test(flag.trim())) {
    const sizeClass = size <= 20 ? "h-5 w-5" : size <= 28 ? "h-6 w-6" : "h-8 w-8";
    return <CountryFlag code={flag} countryName={countryName ?? name} className={`${sizeClass} rounded-full ${className}`} />;
  }

  return (
    <span
      aria-label={`Identidad de ${name}`}
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-900 to-slate-600 text-[10px] font-black uppercase text-white ring-1 ring-white/60 ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

export function ScorePill({ home, away }: { home: number; away: number }) {
  return (
    <div className="inline-flex min-w-[94px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xl font-black tracking-tight text-slate-950 shadow-sm sm:min-w-[100px] sm:px-4 sm:py-2.5 sm:text-2xl">
      <span>{home}</span>
      <span className="mx-1.5 text-slate-400 sm:mx-2">-</span>
      <span>{away}</span>
    </div>
  );
}

export function ExpandChevron({ open }: { open?: boolean }) {
  return <ChevronDown size={18} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />;
}
