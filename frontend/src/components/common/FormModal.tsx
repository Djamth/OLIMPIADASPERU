"use client";

import { SecondaryButton, SubmitButton } from "@/components/common/Buttons";
import { CheckCircle2, Loader2, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";

export function FormModal({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Guardar",
  submitting = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submitting?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1080] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-auto rounded-lg border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
          <h2 className="m-0 text-lg font-extrabold text-slate-950">{title}</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-5">{children}</div>
          <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
            <SecondaryButton type="button" onClick={onClose}>
              Cancelar
            </SecondaryButton>
            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={17} />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  {submitLabel}
                </>
              )}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
