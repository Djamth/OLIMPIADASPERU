"use client";

import { useAuth } from "@/context/AuthContext";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex min-vh-100 align-items-center justify-content-center">
        <div className="surface-card p-4 text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="mb-0 text-soft">Cargando sesion...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
