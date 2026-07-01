"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { hasModuleAccess } from "@/utils/access";
import type { ReactNode } from "react";

export function RequireModule({ keys, children }: { keys: string[]; children: ReactNode }) {
  const { user } = useAuth();

  if (!hasModuleAccess(user, keys)) {
    return (
      <EmptyState
        title="Acceso restringido"
        description="Tu perfil no tiene permisos para ver este módulo. Solicita acceso al administrador."
      />
    );
  }

  return <>{children}</>;
}
