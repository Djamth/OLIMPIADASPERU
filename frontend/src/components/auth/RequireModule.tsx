"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

export function hasModuleAccess(user: ReturnType<typeof useAuth>["user"], keys: string[]) {
  if (!user) return false;
  if (user.rolNombre?.toLowerCase() === "administrador") return true;

  const normalizedKeys = keys.map((item) => item.toLowerCase());
  return user.modulos?.some((modulo) => {
    const ruta = modulo.ruta?.toLowerCase();
    const nombre = modulo.nombre?.toLowerCase();
    return normalizedKeys.includes(ruta) || normalizedKeys.includes(nombre);
  });
}

export function RequireModule({ keys, children }: { keys: string[]; children: ReactNode }) {
  const { user } = useAuth();

  if (!hasModuleAccess(user, keys)) {
    return (
      <EmptyState
        title="Acceso restringido"
        description="Tu perfil no tiene permisos para ver este modulo. Solicita acceso al administrador."
      />
    );
  }

  return <>{children}</>;
}
