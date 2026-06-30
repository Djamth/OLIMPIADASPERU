"use client";

import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/utils/alerts";
import { Bell, ChevronDown, LogOut, Menu, Moon, Plus, Search, Sun, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AppNavbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

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

          <label className="op-top-search">
            <Search size={18} />
            <input type="search" placeholder="Buscar módulo, equipo o deporte..." aria-label="Buscar" />
            <span>⌘K</span>
          </label>
        </div>

        <div className="op-navbar-actions">
          <button className="op-primary-top-action" type="button">
            <Plus size={17} />
            <span>Nuevo</span>
          </button>

          <span className="op-action-divider" />

          <button className="op-icon-button" type="button" onClick={toggleTheme} aria-label={darkMode ? "Modo claro" : "Modo oscuro"}>
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button className="op-icon-button has-dot" type="button" aria-label="Notificaciones">
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

                <button className="op-profile-popover-item" type="button">
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
