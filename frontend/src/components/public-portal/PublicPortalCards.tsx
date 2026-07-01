import { Badge } from "@/components/common/Badge";
import type { DashboardRecentResult, DashboardUpcomingMatch } from "@/types/admin";
import { CalendarDays, Trophy } from "lucide-react";
import { formatPublicDate, getMatchParts, statusTone } from "./publicPortalUtils";

export function MatchCard({ match }: { match: DashboardUpcomingMatch }) {
  const { local, visitante } = getMatchParts(match.encuentro);

  return (
    <article className="group relative overflow-hidden border border-white/70 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_75px_rgba(15,23,42,0.2)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-blue-600 to-sky-400" />
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-100 opacity-80 blur-2xl" />
      <div className="mb-5 flex items-center justify-between">
        <Badge tone="blue">{match.deporte}</Badge>
        <Badge tone={statusTone(match.estado)}>{match.estado}</Badge>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="min-w-0 text-right">
          <p className="truncate text-lg font-black text-slate-950">{local}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Local</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">VS</div>
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-slate-950">{visitante}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Visitante</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <CalendarDays size={17} className="text-blue-700" />
          {formatPublicDate(match.fechaHora)}
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <Trophy size={17} className="text-red-600" />
          {match.sede}
        </div>
      </div>
    </article>
  );
}

export function ResultCard({ result }: { result: DashboardRecentResult }) {
  const { local, visitante } = getMatchParts(result.encuentro);

  return (
    <article className="group relative overflow-hidden border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.09)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 opacity-90 transition group-hover:scale-125" />
      <div className="mb-4 flex items-center justify-between">
        <Badge tone="slate">{result.deporte}</Badge>
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Resultado</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <p className="truncate text-right text-sm font-black text-slate-700">{local}</p>
        <strong className="text-3xl font-black text-blue-700">
          {result.puntajeLocal} - {result.puntajeVisitante}
        </strong>
        <p className="truncate text-sm font-black text-slate-700">{visitante}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">Ganador: {result.ganador}</p>
    </article>
  );
}
