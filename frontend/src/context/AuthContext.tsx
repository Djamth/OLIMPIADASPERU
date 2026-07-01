"use client";

import { authService } from "@/services/authService";
import { clearStoredSession } from "@/services/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import { getLandingRoute } from "@/utils/access";
import { alerts } from "@/utils/alerts";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<LoginResponse | null>;
  updateUser: (user: LoginResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const publicRoutes = ["/", "/login", "/recuperar-password", "/reset-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = useCallback((nextUser: LoginResponse) => {
    localStorage.setItem("op_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.me();
      updateUser(currentUser);
      return currentUser;
    } catch {
      clearStoredSession();
      setUser(null);
      return null;
    }
  }, [updateUser]);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const storedUser = localStorage.getItem("op_user");

      if (storedUser) {
        try {
          const currentUser = await authService.me();
          if (active) {
            updateUser(currentUser);
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
  }, [updateUser]);

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
      updateUser(response);
      alerts.close();
      await alerts.success("Bienvenido", "Inicio de sesión realizado correctamente.");
      router.push(getLandingRoute(response));
    } catch (error: any) {
      alerts.close();
      const message = error?.response?.data?.mensaje ?? "No se pudo iniciar sesión.";
      await alerts.error("Acceso denegado", message);
      throw error;
    }
  }, [router, updateUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // La sesión local se elimina incluso si el token ya expiró.
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
      refreshUser,
      updateUser,
    }),
    [isLoading, login, logout, refreshUser, updateUser, user],
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
