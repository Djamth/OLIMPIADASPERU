import { expect, test } from "@playwright/test";
import { expectModulePage, loginAs, requireBackend, selectOptionContaining } from "./utils/auth";

test.beforeEach(async ({ page, request }) => {
  await requireBackend(request);
  await loginAs(page);
});

test("recorre el flujo principal de olimpiadas internas", async ({ page }) => {
  test.setTimeout(120_000);

  await expectModulePage(page, "/instituciones", /Instituciones/i);
  await expect(page.getByRole("button", { name: /Nueva instituci/i })).toBeVisible();
  await expect(page.getByText(/Colegio|IE|Universidad/i).first()).toBeVisible();

  await expectModulePage(page, "/eventos", /Eventos/i);
  await expect(page.getByRole("button", { name: /Nuevo evento/i })).toBeVisible();
  await expect(page.getByText(/pais|categor/i).first()).toBeVisible();

  await expectModulePage(page, "/equipos", /Equipos/i);
  await expect(page.getByRole("button", { name: /Nuevo equipo/i })).toBeVisible();
  await expect(page.getByText(/FUTBOL|BASQUET|VOLEY|PING/i).first()).toBeVisible();

  await expectModulePage(page, "/participantes", /Participantes/i);
  await expect(page.getByRole("button", { name: /Nuevo participante/i })).toBeVisible();
  await expect(page.getByText(/Plantillas por equipo/i)).toBeVisible();

  await expectModulePage(page, "/inscripciones", /Inscripciones/i);
  await expect(page.getByRole("button", { name: /Nueva inscripci/i })).toBeVisible();
  await expect(page.getByText(/Filtro por deporte/i)).toBeVisible();

  await expectModulePage(page, "/sorteos", /Sorteos/i);
  await expect(page.getByRole("button", { name: /Generar sorteo/i })).toBeVisible();
  await expect(page.getByText(/Equipos inscritos en el deporte/i)).toBeVisible();

  await expectModulePage(page, "/programacion", /Programaci/i);
  await expect(page.getByRole("button", { name: /Programar partido/i })).toBeVisible();
  await expect(page.getByText(/Filtro por deporte/i)).toBeVisible();

  await expectModulePage(page, "/resultados", /Resultados/i);
  await expect(page.getByRole("button", { name: /Registrar resultado/i })).toBeVisible();
  await expect(page.getByText(/Marcador|Estad/i).first()).toBeVisible();

  await expectModulePage(page, "/estadisticas", /Estad/i);
  await expect(page.getByText(/Ranking|Goleadores|Encestadores|Medallero/i).first()).toBeVisible();
});

test("filtra inscripciones, programacion y resultados por deporte", async ({ page }) => {
  await expectModulePage(page, "/inscripciones", /Inscripciones/i);
  await selectOptionContaining(page.locator(".module-panel").first().locator("select").nth(1), /FUTBOL/i);
  await expect(page.getByText(/FUTBOL/i).first()).toBeVisible();

  await expectModulePage(page, "/programacion", /Programaci/i);
  await selectOptionContaining(page.locator(".module-panel").first().locator("select").first(), /FUTBOL/i);
  await expect(page.getByText(/FUTBOL/i).first()).toBeVisible();

  await expectModulePage(page, "/resultados", /Resultados/i);
  await selectOptionContaining(page.locator(".module-panel").first().locator("select").first(), /FUTBOL/i);
  await expect(page.getByText(/FUTBOL/i).first()).toBeVisible();
});

test("abre formularios principales sin perder el contexto del flujo", async ({ page }) => {
  await expectModulePage(page, "/instituciones", /Instituciones/i);
  await page.getByRole("button", { name: /Nueva instituci/i }).click();
  await expect(page.getByRole("heading", { name: /Nueva instituci/i })).toBeVisible();
  await page.keyboard.press("Escape");

  await expectModulePage(page, "/equipos", /Equipos/i);
  await page.getByRole("button", { name: /Nuevo equipo/i }).click();
  await expect(page.getByRole("heading", { name: /Nuevo equipo/i })).toBeVisible();
  await expect(page.locator("form").getByText(/Categor/i).first()).toBeVisible();
  await expect(page.locator("form select").first()).toBeVisible();
  await page.keyboard.press("Escape");

  await expectModulePage(page, "/participantes", /Participantes/i);
  await page.getByRole("button", { name: /Nuevo participante/i }).click();
  await expect(page.getByRole("heading", { name: /Nuevo participante/i })).toBeVisible();
  await expect(page.locator("form").getByText("Equipo", { exact: true })).toBeVisible();
  await expect(page.locator("form select").first()).toBeVisible();
  await page.keyboard.press("Escape");

  await expectModulePage(page, "/programacion", /Programaci/i);
  await page.getByRole("button", { name: /Programar partido/i }).click();
  await expect(page.getByRole("heading", { name: /Programar partido/i })).toBeVisible();
  await expect(page.locator("form").getByText("Sede", { exact: true })).toBeVisible();
});
