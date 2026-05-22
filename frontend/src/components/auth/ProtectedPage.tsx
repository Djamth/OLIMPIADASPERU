"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="surface-card grid justify-items-center gap-3 p-6 text-center">
          <Loader2 className="animate-spin text-blue-600" size={28} />
          <p className="text-sm font-bold text-slate-500">Cargando sesion...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
