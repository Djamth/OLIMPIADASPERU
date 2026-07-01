"use client";

import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryActionButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-black text-white shadow-[0_16px_32px_rgba(21,101,192,0.22)] ring-0 ring-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-[0_22px_40px_rgba(21,101,192,0.28)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type="button"
      data-op-primary-action="true"
      {...props}
    >
      <PlusCircle size={17} />
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function SubmitButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-700 px-4 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,101,192,0.22)] transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type="submit"
      {...props}
    >
      {children}
    </button>
  );
}

export function IconActionButton({
  label,
  tone = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "primary" | "danger" | "neutral";
  children: ReactNode;
}) {
  const toneClass = {
    primary: "border-blue-100 text-blue-600 shadow-blue-100/70 hover:bg-blue-50 hover:text-blue-700",
    danger: "border-red-100 text-red-600 shadow-red-100/70 hover:bg-red-50 hover:text-red-700",
    neutral: "border-slate-200 text-slate-500 shadow-slate-100/70 hover:bg-slate-50",
  }[tone];

  return (
    <button
      className={`inline-grid h-8 w-8 place-items-center rounded-lg border bg-white shadow-sm transition hover:-translate-y-0.5 ${toneClass} ${className}`}
      type="button"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-1.5">
      <IconActionButton label="Editar" tone="primary" onClick={onEdit}>
        <Edit2 size={14} />
      </IconActionButton>
      <IconActionButton label="Eliminar" tone="danger" onClick={onDelete}>
        <Trash2 size={14} />
      </IconActionButton>
    </div>
  );
}
