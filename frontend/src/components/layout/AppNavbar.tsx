"use client";

import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/utils/alerts";
import { Bell, LogOut, Menu } from "lucide-react";

export function AppNavbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await alerts.confirm("Cerrar sesión", "Se cerrará la sesión actual.");
    if (result.isConfirmed) await logout();
  };

  return (
    <header className="op-navbar">
      <div className="op-navbar-top">
        <div className="op-navbar-title">
          <button className="op-mobile-menu-button" type="button" onClick={onOpenMobileMenu} aria-label="Abrir menú">
            <Menu size={20} />
          </button>
          
        </div>

        <div className="op-navbar-actions">
          <button className="op-icon-button" type="button" aria-label="Notificaciones">
            <Bell size={17} />
          </button>
          <div className="op-user-avatar">{(user?.nombre ?? "U").slice(0, 1).toUpperCase()}</div>
          <button className="op-logout-button" type="button" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
