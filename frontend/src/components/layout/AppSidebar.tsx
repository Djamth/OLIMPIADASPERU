"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/instituciones", label: "Instituciones", icon: "bi-building" },
  { href: "/deportes", label: "Deportes", icon: "bi-trophy" },
  { href: "/equipos", label: "Equipos", icon: "bi-people" },
  { href: "/participantes", label: "Participantes", icon: "bi-person-badge" },
  { href: "/inscripciones", label: "Inscripciones", icon: "bi-clipboard-check" },
  { href: "/sorteos", label: "Sorteos", icon: "bi-shuffle" },
  { href: "/programacion", label: "Programacion", icon: "bi-calendar-event" },
  { href: "/resultados", label: "Resultados", icon: "bi-bar-chart-line" },
  { href: "/estadisticas", label: "Estadisticas", icon: "bi-graph-up-arrow" },
];

export function AppSidebar({
  collapsed,
  onNavigate,
  onCloseMobile,
}: {
  collapsed: boolean;
  onNavigate: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar-shell ${collapsed ? "collapsed" : ""}`}>
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 sidebar-brand-row">
        <div className="d-flex align-items-center gap-3 sidebar-brand">
        <div
          className="d-flex align-items-center justify-content-center rounded-3 sidebar-logo"
        >
          <i className="bi bi-trophy-fill fs-4 text-warning" />
        </div>
        <div className="sidebar-copy">
          <div className="fw-bold">Olimpiadas Peru</div>
          <div className="small text-white-50">Gestion deportiva escolar</div>
        </div>
        </div>
        <button className="btn btn-sm btn-outline-light d-lg-none icon-button" onClick={onCloseMobile} aria-label="Cerrar menu">
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <nav className="d-flex flex-column gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
          >
            <i className={`bi ${item.icon}`} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="surface-card mt-4 p-3 sport-accent text-dark sidebar-note">
        <div className="fw-semibold mb-1">Modo avance</div>
        <p className="mb-0 small text-soft">
          Backend validado con reglas de negocio para inscripciones, sorteos, programacion y resultados.
        </p>
      </div>
    </aside>
  );
}
