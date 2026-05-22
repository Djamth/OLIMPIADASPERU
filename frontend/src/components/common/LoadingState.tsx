import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Cargando datos..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/90 p-10 text-center shadow-[0_18px_46px_rgba(15,23,42,0.08)]">
      <Loader2 className="mx-auto mb-3 animate-spin text-blue-600" size={30} />
      <p className="m-0 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}
