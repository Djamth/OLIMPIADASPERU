"use client";

import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/utils/alerts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Medal,
  Settings,
  ShieldCheck,
  Shuffle,
  Trophy,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, keys: ["/dashboard", "dashboard"] },
  { href: "/usuarios", label: "Usuarios", icon: Users, keys: ["/usuarios", "usuarios"] },
  { href: "/perfiles", label: "Perfiles", icon: ShieldCheck, keys: ["/roles", "/modulos", "roles", "modulos"] },
  { href: "/instituciones", label: "Instituciones", icon: Building2, keys: ["/instituciones", "instituciones"] },
  { href: "/deportes", label: "Deportes", icon: Trophy, keys: ["/deportes", "deportes"] },
  { href: "/equipos", label: "Equipos", icon: UsersRound, keys: ["/equipos", "equipos"] },
  { href: "/participantes", label: "Participantes", icon: UserRound, keys: ["/participantes", "participantes"] },
  { href: "/inscripciones", label: "Inscripciones", icon: ClipboardCheck, keys: ["/inscripciones", "inscripciones"] },
  { href: "/sorteos", label: "Sorteos", icon: Shuffle, keys: ["/sorteos", "sorteos"] },
  { href: "/programacion", label: "Programacion", icon: CalendarDays, keys: ["/programacion", "/programaciones", "programaciones"] },
  { href: "/resultados", label: "Resultados", icon: Medal, keys: ["/resultados", "resultados"] },
  { href: "/estadisticas", label: "Estadisticas", icon: BarChart3, keys: ["/estadisticas", "estadisticas"] },
];

function getInitials(name?: string) {
  if (!name) return "OP";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.rolNombre?.toLowerCase() === "administrador";
  const visibleItems = items.filter((item) => {
    if (isAdmin) return true;
    const keys = item.keys.map((key) => key.toLowerCase());
    return user?.modulos?.some((modulo) => {
      const ruta = modulo.ruta?.toLowerCase();
      const nombre = modulo.nombre?.toLowerCase();
      return keys.includes(ruta) || keys.includes(nombre);
    });
  });

  const handleLogout = async () => {
    const result = await alerts.confirm("Cerrar sesion", "Se cerrara la sesion actual.");
    if (result.isConfirmed) logout();
  };

  return (
    <div className={`op-sidebar-panel ${collapsed ? "is-collapsed" : ""}`}>
      <div className="op-sidebar-header">
        <div className="op-brand-row">
          <div className="op-brand-mark">OP</div>
          {!collapsed && (
            <div className="op-brand-copy">
              <strong>Olimpiadas Peru</strong>
              <span>Gestion deportiva</span>
            </div>
          )}
          <button
            className="op-collapse-button"
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
          >
            <ChevronLeft className={collapsed ? "rotate-180" : ""} size={18} />
          </button>
        </div>

        <div className="op-profile-card">
          <div className="op-profile-initials">{getInitials(user?.nombre)}</div>
          {!collapsed && (
            <div className="op-profile-copy">
              <strong>{user?.nombre || "Sin sesion"}</strong>
              <span>{user?.rolNombre || "Invitado"}</span>
            </div>
          )}
        </div>
      </div>

      <nav className="op-sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`op-nav-link ${active ? "is-active" : ""}`}
              onClick={onNavigate}
              title={item.label}
            >
              <Icon size={19} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="op-sidebar-footer">
        <button className="op-sidebar-action" type="button" title="Ayuda">
          <HelpCircle size={19} />
          {!collapsed && <span>Ayuda</span>}
        </button>

        <button className="op-sidebar-action danger" type="button" onClick={handleLogout} title="Cerrar sesion">
          <LogOut size={19} />
          {!collapsed && <span>Cerrar sesion</span>}
        </button>

        <button className="op-theme-button" type="button" aria-label="Tema principal">
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
