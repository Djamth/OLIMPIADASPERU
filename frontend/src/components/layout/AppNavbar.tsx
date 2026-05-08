"use client";

import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/utils/alerts";

export function AppNavbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await alerts.confirm("Cerrar sesion", "Se cerrara la sesion actual.");
    if (result.isConfirmed) {
      logout();
    }
  };

  return (
    <div className="topbar-blur rounded-4 px-4 py-3 mb-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="small text-soft">Panel administrativo</div>
          <h1 className="h4 mb-0">Olimpiadas Peru</h1>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-semibold">{user?.nombre ?? "Invitado"}</div>
            <div className="small text-soft">{user?.rolNombre ?? "Sin rol"}</div>
          </div>
          <button className="btn btn-outline-primary rounded-pill px-3" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2" />
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
