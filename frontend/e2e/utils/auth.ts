import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";

export const adminUser = {
  email: process.env.E2E_ADMIN_EMAIL ?? "admin@olimpiadasperu.pe",
  password: process.env.E2E_ADMIN_PASSWORD ?? "Admin123*",
};

export const consultaUser = {
  email: process.env.E2E_CONSULTA_EMAIL ?? "consulta@olimpiadasperu.pe",
  password: process.env.E2E_CONSULTA_PASSWORD ?? "Admin123*",
};

export async function requireBackend(request: APIRequestContext) {
  const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://localhost:8080/olimpiadas";
  const response = await request.get(`${apiBaseUrl}/api/public/resumen`, {
    failOnStatusCode: false,
  });

  expect(
    response.ok(),
    `El backend debe estar levantado en ${apiBaseUrl} antes de correr E2E.`,
  ).toBeTruthy();
}

export async function loginAs(page: Page, credentials = adminUser) {
  const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://localhost:8080/olimpiadas";
  await page.context().clearCookies();
  const response = await page.request.post(`${apiBaseUrl}/api/auth/login`, {
    data: credentials,
  });
  expect(response.ok(), `Login E2E fallido para ${credentials.email}`).toBeTruthy();
  const user = await response.json();

  await page.addInitScript((storedUser) => {
    localStorage.clear();
    localStorage.setItem("op_user", JSON.stringify(storedUser));
  }, user);

  await page.goto(getLandingPath(user), { waitUntil: "domcontentloaded" });
  await expect(page).not.toHaveURL(/\/login$/);
}

function getLandingPath(user: { rolNombre?: string; modulos?: Array<{ ruta?: string }> }) {
  if (user.rolNombre?.toLowerCase() === "administrador") {
    return "/dashboard";
  }
  return user.modulos?.find((modulo) => modulo.ruta)?.ruta ?? "/dashboard";
}

export async function expectModulePage(page: Page, path: string, heading: RegExp) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`));
  const loadingSession = page.getByText(/Cargando sesi/i);
  if (await loadingSession.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await expect(loadingSession).toBeHidden({ timeout: 15_000 });
  }
  await expect(page.locator("h2").filter({ hasText: heading })).toBeVisible();
}

export async function selectOptionContaining(select: Locator, text: RegExp) {
  await expect(select).toBeVisible();
  await expect.poll(async () => {
    const labels = await select.locator("option").evaluateAll((options) =>
      options.map((option) => option.textContent?.trim() ?? ""),
    );
    return labels.some((label) => text.test(label));
  }, {
    message: `Esperando opcion que coincida con ${text}`,
    timeout: 12_000,
  }).toBeTruthy();

  const options = await select.locator("option").all();

  for (const option of options) {
    const label = (await option.textContent())?.trim() ?? "";
    if (text.test(label)) {
      await select.selectOption({ label });
      return;
    }
  }

  throw new Error(`No se encontro una opcion que coincida con ${text}`);
}
