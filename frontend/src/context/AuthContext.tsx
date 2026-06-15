"use client";

import { authService } from "@/services/authService";
import { clearStoredSession } from "@/services/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import { alerts } from "@/utils/alerts";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const publicRoutes = ["/", "/login", "/recuperar-password", "/reset-password"];

function getLandingRoute(user: LoginResponse) {
  const routeMap: Record<string, string> = {
    "/roles": "/perfiles",
    "/modulos": "/perfiles",
    "/programaciones": "/programacion",
  };

  const dashboard = user.modulos?.find((modulo) => modulo.ruta?.toLowerCase() === "/dashboard");
  if (dashboard || user.rolNombre?.toLowerCase() === "administrador") {
    return "/dashboard";
  }

  const firstRoute = user.modulos?.find((modulo) => Boolean(modulo.ruta))?.ruta?.toLowerCase();
  return firstRoute ? routeMap[firstRoute] ?? firstRoute : "/dashboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const storedUser = localStorage.getItem("op_user");

      if (storedUser) {
        try {
          await authService.me();
          if (active) {
            setUser(JSON.parse(storedUser) as LoginResponse);
          }
        } catch {
          clearStoredSession();
        }
      }

      if (active) {
        setIsLoading(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isPublicRoute = publicRoutes.includes(pathname);
    const isLoginPage = pathname === "/login";
    if (!user && !isPublicRoute) {
      router.replace("/login");
    }

    if (user && isLoginPage) {
      router.replace(getLandingRoute(user));
    }
  }, [isLoading, pathname, router, user]);

  const login = useCallback(async (payload: LoginRequest) => {
    alerts.loading("Validando acceso");
    try {
      const response = await authService.login(payload);
      localStorage.setItem("op_user", JSON.stringify(response));
      setUser(response);
      alerts.close();
      await alerts.success("Bienvenido", "Inicio de sesion realizado correctamente.");
      router.push(getLandingRoute(response));
    } catch (error: any) {
      alerts.close();
      const message = error?.response?.data?.mensaje ?? "No se pudo iniciar sesion.";
      await alerts.error("Acceso denegado", message);
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // La sesion local se elimina incluso si el token ya expiro.
    } finally {
      clearStoredSession();
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
