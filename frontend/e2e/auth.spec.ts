import { expect, test } from "@playwright/test";
import { consultaUser, loginAs, requireBackend } from "./utils/auth";

test.beforeEach(async ({ request }) => {
  await requireBackend(request);
});

test("redirige rutas protegidas al login cuando no hay sesion", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /Bienvenido/i })).toBeVisible();
});

test("permite iniciar sesion como administrador y entrar al dashboard", async ({ page }) => {
  await loginAs(page);

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /Gestion central/i })).toBeVisible();
  await expect(page.getByText(/Graficas por deporte/i)).toBeVisible();
});

test("el usuario de consulta recibe permisos limitados desde autenticacion", async ({ request }) => {
  const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://localhost:8080/olimpiadas";
  const response = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: consultaUser,
  });
  const body = await response.json();
  const rutas = body.modulos.map((modulo: { ruta: string }) => modulo.ruta);

  expect(response.ok()).toBeTruthy();
  expect(rutas).toContain("/dashboard");
  expect(rutas).not.toContain("/usuarios");
  expect(rutas).not.toContain("/perfiles");
});

test("mantiene accesible el perfil autenticado", async ({ page }) => {
  await loginAs(page);
  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/perfil$/);
  await expect(page.getByRole("heading", { name: /Administrador Olimpiadas/i })).toBeVisible();
  await expect(page.getByText(/Cambiar contrase/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Guardar perfil/i })).toBeVisible();
});
