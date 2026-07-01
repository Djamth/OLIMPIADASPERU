import type { LoginResponse } from "../types/auth";

const routeMap: Record<string, string> = {
  "/roles": "/perfiles",
  "/modulos": "/perfiles",
  "/programaciones": "/programacion",
};

export type PermissionAction = "ver" | "crear" | "editar" | "eliminar" | "exportar";

export function hasModuleAccess(user: LoginResponse | null, keys: string[]) {
  if (!user) return false;
  if (user.rolNombre?.toLowerCase() === "administrador") return true;

  const normalizedKeys = keys.map((item) => item.toLowerCase());
  return Boolean(user.modulos?.some((modulo) => {
    const ruta = modulo.ruta?.toLowerCase();
    const nombre = modulo.nombre?.toLowerCase();
    return (normalizedKeys.includes(ruta) || normalizedKeys.includes(nombre)) && modulo.puedeVer !== false;
  }));
}

export function hasActionPermission(user: LoginResponse | null, pathname: string, action: PermissionAction) {
  if (!user) return false;
  if (user.rolNombre?.toLowerCase() === "administrador") return true;

  const normalizedPath = normalizeRoute(pathname);
  const matchedModule = user.modulos?.find((item) => {
    const ruta = normalizeRoute(item.ruta);
    const nombre = normalizeRoute(item.nombre);
    return ruta === normalizedPath || normalizedPath.includes(ruta) || nombre === normalizedPath;
  });

  if (!matchedModule) return false;

  const value = {
    ver: matchedModule.puedeVer,
    crear: matchedModule.puedeCrear,
    editar: matchedModule.puedeEditar,
    eliminar: matchedModule.puedeEliminar,
    exportar: matchedModule.puedeExportar,
  }[action];

  return value !== false;
}

function normalizeRoute(value?: string | null) {
  const lower = (value || "").toLowerCase();
  return routeMap[lower] ?? lower;
}

export function getLandingRoute(user: LoginResponse) {
  const dashboard = user.modulos?.find((modulo) => modulo.ruta?.toLowerCase() === "/dashboard");
  if (dashboard || user.rolNombre?.toLowerCase() === "administrador") {
    return "/dashboard";
  }

  const firstRoute = user.modulos?.find((modulo) => Boolean(modulo.ruta))?.ruta?.toLowerCase();
  return firstRoute ? routeMap[firstRoute] ?? firstRoute : "/dashboard";
}
