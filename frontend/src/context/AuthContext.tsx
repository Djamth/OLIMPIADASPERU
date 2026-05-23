"use client";

import { authService } from "@/services/authService";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import { alerts } from "@/utils/alerts";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
    const storedUser = localStorage.getItem("op_user");
    const storedToken = localStorage.getItem("op_access_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser) as LoginResponse);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isLoginPage = pathname === "/login";
    if (!user && !isLoginPage) {
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
      localStorage.setItem("op_access_token", response.accessToken);
      localStorage.setItem("op_refresh_token", response.refreshToken);
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

  const logout = useCallback(() => {
    localStorage.removeItem("op_access_token");
    localStorage.removeItem("op_refresh_token");
    localStorage.removeItem("op_user");
    setUser(null);
    router.push("/login");
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
