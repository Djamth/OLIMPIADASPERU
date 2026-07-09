import { expect, test } from "@playwright/test";
import { adminUser, consultaUser, loginAs, requireBackend } from "./utils/auth";

test.beforeEach(async ({ request }) => {
  await requireBackend(request);
});

test("administrador accede al CRUD de acciones", async ({ page }) => {
  await loginAs(page, adminUser);
  await page.goto("/acciones", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/acciones$/);
  await expect(page.locator("h2").filter({ hasText: /Acciones/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Nueva acci/i })).toBeVisible();
  await expect(page.getByText(/VER|CREAR|EDITAR|ELIMINAR|EXPORTAR/i).first()).toBeVisible();
});

test("usuario consulta no puede consumir endpoints administrativos por Postman/API", async ({ request }) => {
  const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://localhost:8080/olimpiadas";
  const login = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: consultaUser,
  });

  expect(login.ok()).toBeTruthy();
  const body = await login.json();
  const headers = body.accessToken ? { Authorization: `Bearer ${body.accessToken}` } : undefined;

  const usuarios = await request.get(`${apiBaseUrl}/api/usuarios`, {
    headers,
    failOnStatusCode: false,
  });
  const acciones = await request.get(`${apiBaseUrl}/api/acciones`, {
    headers,
    failOnStatusCode: false,
  });

  expect(usuarios.status()).toBe(403);
  expect(acciones.status()).toBe(403);
});

test("usuario consulta ve acceso restringido en pantalla de acciones", async ({ page }) => {
  await loginAs(page, consultaUser);
  await page.goto("/acciones", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/acciones$/);
  await expect(page.getByText(/Acceso restringido/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Nueva acci/i })).toHaveCount(0);
});
