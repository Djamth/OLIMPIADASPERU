import type { LoginResponse } from "../types/auth";

const routeMap: Record<string, string> = {
  "/roles": "/perfiles",
  "/modulos": "/perfiles",
  "/programaciones": "/programacion",
};

export function hasModuleAccess(user: LoginResponse | null, keys: string[]) {
  if (!user) return false;
  if (user.rolNombre?.toLowerCase() === "administrador") return true;

  const normalizedKeys = keys.map((item) => item.toLowerCase());
  return Boolean(user.modulos?.some((modulo) => {
    const ruta = modulo.ruta?.toLowerCase();
    const nombre = modulo.nombre?.toLowerCase();
    return normalizedKeys.includes(ruta) || normalizedKeys.includes(nombre);
  }));
}

export function getLandingRoute(user: LoginResponse) {
  const dashboard = user.modulos?.find((modulo) => modulo.ruta?.toLowerCase() === "/dashboard");
  if (dashboard || user.rolNombre?.toLowerCase() === "administrador") {
    return "/dashboard";
  }

  const firstRoute = user.modulos?.find((modulo) => Boolean(modulo.ruta))?.ruta?.toLowerCase();
  return firstRoute ? routeMap[firstRoute] ?? firstRoute : "/dashboard";
}
