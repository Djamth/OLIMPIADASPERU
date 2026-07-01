import { describe, expect, it } from "vitest";
import { getLandingRoute, hasModuleAccess } from "./access";
import type { LoginResponse } from "../types/auth";

function session(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return {
    id: 1,
    nombre: "Usuario Demo",
    email: "demo@olimpiadasperu.pe",
    rolId: 2,
    rolNombre: "coordinador",
    estado: "ACTIVO",
    modulos: [],
    expiresIn: 900000,
    tokenType: "Cookie",
    ...overrides,
  };
}

describe("access helpers", () => {
  it("allows administrators to access every module", () => {
    expect(hasModuleAccess(session({ rolNombre: "administrador" }), ["/usuarios"])).toBe(true);
  });

  it("matches module access by route or name", () => {
    const user = session({
      modulos: [
        { id: 1, nombre: "Resultados", ruta: "/resultados" },
        { id: 2, nombre: "Programación", ruta: "/programacion" },
      ],
    });

    expect(hasModuleAccess(user, ["/resultados"])).toBe(true);
    expect(hasModuleAccess(user, ["programación"])).toBe(true);
    expect(hasModuleAccess(user, ["/usuarios"])).toBe(false);
  });

  it("selects dashboard as preferred landing route", () => {
    const user = session({ modulos: [{ id: 1, nombre: "Dashboard", ruta: "/dashboard" }] });

    expect(getLandingRoute(user)).toBe("/dashboard");
  });

  it("maps backend module aliases to frontend routes", () => {
    const user = session({ modulos: [{ id: 10, nombre: "Programaciones", ruta: "/programaciones" }] });

    expect(getLandingRoute(user)).toBe("/programacion");
  });
});
