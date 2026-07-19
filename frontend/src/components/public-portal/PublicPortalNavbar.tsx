import { CalendarDays, Search, Trophy } from "lucide-react";
import { ButtonLogin } from "./ButtonLogin";

export function PublicPortalNavbar() {
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-7 lg:px-8">
      <a className="flex items-center gap-3" href="#inicio" aria-label="Olimpiadas Peru">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-[0_18px_50px_rgba(239,68,68,0.35)]">
          <Trophy size={24} />
        </span>
        <span>
          <span className="block text-sm font-black uppercase tracking-[0.16em]">Olimpiadas Peru</span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300">Portal deportivo</span>
        </span>
      </a>

      <nav className="hidden items-center gap-8 text-[11px] font-black uppercase tracking-[0.18em] text-slate-300 lg:flex">
        <a className="text-red-400 transition hover:text-white" href="#inicio">Inicio</a>
        <a className="transition hover:text-white" href="#encuentros">Evento</a>
        <a className="transition hover:text-white" href="#resultados">Resultados</a>
        <a className="transition hover:text-white" href="#clasificacion">Clasificacion</a>
        <a className="transition hover:text-white" href="#estadisticas">Estadisticas</a>
      </nav>

      <div className="hidden items-center gap-3 sm:flex">
        <div className="flex h-11 w-56 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-sm font-semibold text-slate-300 backdrop-blur-xl">
          <Search size={16} />
          <span>Buscar evento...</span>
        </div>
        <a className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-red-600" href="#encuentros" aria-label="Ver encuentros">
          <CalendarDays size={18} />
        </a>
        <ButtonLogin />
      </div>
    </header>
  );
}
