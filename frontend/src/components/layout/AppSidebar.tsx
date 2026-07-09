"use client";

import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/utils/alerts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ClipboardCheck,
  Flag,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Medal,
  ShieldCheck,
  Shuffle,
  Trophy,
  UserRound,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, keys: ["/dashboard", "dashboard"] },
  { href: "/usuarios", label: "Usuarios", icon: Users, keys: ["/usuarios", "usuarios"] },
  { href: "/perfiles", label: "Perfiles", icon: ShieldCheck, keys: ["/roles", "/modulos", "roles", "modulos"] },
  { href: "/acciones", label: "Acciones", icon: KeyRound, keys: ["/acciones", "acciones"] },
  { href: "/instituciones", label: "Instituciones", icon: Building2, keys: ["/instituciones", "instituciones"] },
  { href: "/eventos", label: "Eventos y categorías", icon: CalendarRange, keys: ["/instituciones", "instituciones"] },
  { href: "/paises", label: "Catálogo de países", icon: Flag, keys: ["/instituciones", "instituciones"] },
  { href: "/deportes", label: "Deportes", icon: Trophy, keys: ["/deportes", "deportes"] },
  { href: "/equipos", label: "Equipos", icon: UsersRound, keys: ["/equipos", "equipos"] },
  { href: "/participantes", label: "Participantes", icon: UserRound, keys: ["/participantes", "participantes"] },
  { href: "/inscripciones", label: "Inscripciones", icon: ClipboardCheck, keys: ["/inscripciones", "inscripciones"] },
  { href: "/sorteos", label: "Sorteos", icon: Shuffle, keys: ["/sorteos", "sorteos"] },
  { href: "/programacion", label: "Programación", icon: CalendarDays, keys: ["/programacion", "/programaciones", "programaciones"] },
  { href: "/resultados", label: "Resultados", icon: Medal, keys: ["/resultados", "resultados"] },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3, keys: ["/estadisticas", "estadisticas"] },
  { href: "/auditoria", label: "Auditoría", icon: History, keys: ["/auditoria", "auditoria"] },
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
    const result = await alerts.confirm("Cerrar sesión", "Se cerrará la sesión actual.");
    if (result.isConfirmed) await logout();
  };

  return (
    <div className={`op-sidebar-panel ${collapsed ? "is-collapsed" : ""}`}>
      <div className="op-sidebar-header">
        <div className="op-brand-row">
          <div className="op-brand-mark">
            <Zap size={19} fill="currentColor" />
          </div>
          {!collapsed && (
            <div className="op-brand-copy">
              <strong>Olimpiadas Perú</strong>
              <span>Dashboard</span>
            </div>
          )}
          <button
            className="op-collapse-button"
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <ChevronLeft className={collapsed ? "rotate-180" : ""} size={18} />
          </button>
        </div>
      </div>

      <nav className="op-sidebar-nav">
        {!collapsed && <span className="op-nav-section">Gestión</span>}
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
        <div className="op-sidebar-user-card">
          <div className="op-profile-initials">{getInitials(user?.nombre)}</div>
          {!collapsed && (
            <div className="op-profile-copy">
              <strong>{user?.nombre || "Sin sesión"}</strong>
              <span>{user?.rolNombre || "Invitado"}</span>
            </div>
          )}
          <button className="op-sidebar-logout-icon" type="button" onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
