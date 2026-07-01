"use client";

import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/utils/alerts";
import { Bell, ChevronDown, LogOut, Menu, Moon, Plus, Search, Sun, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

const searchTargets = [
  { label: "Dashboard", href: "/dashboard", keywords: ["inicio", "panel", "resumen"] },
  { label: "Usuarios", href: "/usuarios", keywords: ["usuario", "accesos"] },
  { label: "Perfiles", href: "/perfiles", keywords: ["roles", "permisos", "modulos"] },
  { label: "Instituciones", href: "/instituciones", keywords: ["colegios", "clientes"] },
  { label: "Eventos y categorías", href: "/eventos", keywords: ["evento", "categorias", "años"] },
  { label: "Catálogo de países", href: "/paises", keywords: ["paises", "banderas"] },
  { label: "Deportes", href: "/deportes", keywords: ["futbol", "basquet", "voley", "ping pong"] },
  { label: "Equipos", href: "/equipos", keywords: ["delegaciones", "pais"] },
  { label: "Participantes", href: "/participantes", keywords: ["jugadores", "alumnos"] },
  { label: "Inscripciones", href: "/inscripciones", keywords: ["registro", "deporte"] },
  { label: "Sorteos", href: "/sorteos", keywords: ["grupos", "series"] },
  { label: "Programación", href: "/programacion", keywords: ["partidos", "fixture", "calendario"] },
  { label: "Resultados", href: "/resultados", keywords: ["marcadores", "goleadores", "encestadores"] },
  { label: "Estadísticas", href: "/estadisticas", keywords: ["ranking", "reportes", "medallero"] },
];

export function AppNavbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [query, setQuery] = useState("");
  const profileRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("op_theme");
    const shouldUseDark = storedTheme === "dark";
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("op-dark", shouldUseDark);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, []);

  const handleLogout = async () => {
    const result = await alerts.confirm("Cerrar sesión", "Se cerrará la sesión actual.");
    if (result.isConfirmed) await logout();
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("op_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("op-dark", next);
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim().toLowerCase();

    if (!term) {
      searchRef.current?.focus();
      return;
    }

    const target = searchTargets.find((item) => {
      const haystack = [item.label, item.href, ...item.keywords].join(" ").toLowerCase();
      return haystack.includes(term);
    });

    if (!target) {
      await alerts.warning("Sin coincidencias", "No encontramos un módulo relacionado con tu búsqueda.");
      return;
    }

    setQuery("");
    router.push(target.href);
  };

  const handleCreateShortcut = async () => {
    const action = document.querySelector<HTMLButtonElement>("[data-op-primary-action='true']");

    if (!action || action.disabled) {
      await alerts.warning("Acción no disponible", "Este módulo no tiene una acción principal disponible en este momento.");
      return;
    }

    action.click();
  };

  const handleNotifications = async () => {
    await alerts.warning("Notificaciones", "No tienes notificaciones pendientes por revisar.");
  };

  const handleProfile = async () => {
    await alerts.success(user?.nombre || "Usuario", `${user?.rolNombre || "Invitado"} · ${user?.email || "Sin correo"}`);
    setProfileOpen(false);
  };

  const initials = (user?.nombre ?? "Usuario")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="op-navbar">
      <div className="op-navbar-top">
        <div className="op-navbar-title">
          <button className="op-mobile-menu-button" type="button" onClick={onOpenMobileMenu} aria-label="Abrir menú">
            <Menu size={20} />
          </button>

          <form className="op-top-search" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              ref={searchRef}
              type="search"
              placeholder="Buscar módulo, equipo o deporte..."
              aria-label="Buscar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span>Ctrl K</span>
          </form>
        </div>

        <div className="op-navbar-actions">
          <button className="op-primary-top-action" type="button" onClick={handleCreateShortcut}>
            <Plus size={17} />
            <span>Nuevo</span>
          </button>

          <span className="op-action-divider" />

          <button className="op-icon-button" type="button" onClick={toggleTheme} aria-label={darkMode ? "Modo claro" : "Modo oscuro"}>
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button className="op-icon-button has-dot" type="button" onClick={handleNotifications} aria-label="Notificaciones">
            <Bell size={17} />
            <span className="op-notification-dot" />
          </button>

          <div className="op-profile-menu" ref={profileRef}>
            <button
              className="op-profile-trigger"
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-expanded={profileOpen}
              aria-label="Abrir perfil"
            >
              <span>{initials || "U"}</span>
              <ChevronDown size={14} />
            </button>

            {profileOpen && (
              <div className="op-profile-popover">
                <div className="op-profile-popover-head">
                  <div className="op-profile-popover-avatar">{initials || "U"}</div>
                  <div>
                    <strong>{user?.nombre || "Usuario"}</strong>
                    <span>{user?.rolNombre || "Invitado"}</span>
                  </div>
                </div>

                <button className="op-profile-popover-item" type="button" onClick={handleProfile}>
                  <UserRound size={17} />
                  <span>Mi perfil</span>
                </button>

                <button className="op-profile-popover-item danger" type="button" onClick={handleLogout}>
                  <LogOut size={17} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
