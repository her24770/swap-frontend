import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";

const apiURL = "http://localhost:3220";

test.beforeEach(() => {
  // Cada escenario comparte la IP del proxy ZAP. Reiniciar solo el contador
  // global evita que las peticiones de un escenario bloqueen al siguiente.
  execFileSync("docker", [
    "exec", "swap-zap-redis", "sh", "-c",
    "redis-cli --scan --pattern 'rate:api_global:*' | xargs -r redis-cli DEL",
  ]);
});

async function login(page: Page, email = "vendedor@uvg.edu.gt", password = "Vendedor123!") {
  await page.goto("/es/login");
  await page.getByPlaceholder("ejemplo@uvg.edu.gt").fill(email);
  await page.getByPlaceholder("Ingresa tu contraseña").fill(password);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/es\/?$/);
  await expect(page.getByRole("heading", { name: "DESCUBRE" })).toBeVisible();
}

test("registro de un usuario con verificación en el Redis efímero", async ({ page }) => {
  const carnet = 70000 + (Date.now() % 9999);
  const email = `prueba${carnet}@uvg.edu.gt`;
  const codigo = "123456";

  // El correo externo está deshabilitado en la copia ZAP. Se sustituye solo
  // el envío; el formulario y POST /api/auth/register usan el backend real.
  await page.route("**/api/auth/send-register-code", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": "http://localhost:3000",
        "access-control-allow-credentials": "true",
      },
      body: JSON.stringify({ success: true, message: "Código enviado", data: [] }),
    });
  });
  execFileSync("docker", ["exec", "swap-zap-redis", "redis-cli", "SETEX", `register:${email}`, "600", codigo]);

  await page.goto("/es/registro");
  await page.locator('input[name="nombre"]').fill("Prueba");
  await page.locator('input[name="apellido"]').fill("Navegador");
  await page.locator('input[name="email_institucional"]').fill(email);
  await page.locator('input[name="password"]').fill("Prueba123!");
  await page.locator('input[name="confirmar_password"]').fill("Prueba123!");
  await page.locator(".registro-form__tags-trigger").click();
  const categorias = page.locator(".registro-form__tags-option");
  await expect(categorias.first()).toBeVisible();
  for (let index = 0; index < 3; index++) await categorias.nth(index).click();
  await page.locator(".registro-form__tags-trigger").click();
  await page.locator(".registro-form__terms-checkbox").click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Verifica tu correo" })).toBeVisible();
  await page.getByPlaceholder("000000").fill(codigo);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/es\/?(?:\?registered=true)?$/);
  await expect(page.getByRole("heading", { name: "DESCUBRE" })).toBeVisible();
  expect((await page.context().cookies()).some((cookie) => cookie.name === "swap-token")).toBe(true);
});

test("login con cuenta sembrada", async ({ page }) => {
  await login(page);
  expect((await page.context().cookies()).some((cookie) => cookie.name === "swap-token")).toBe(true);
});

test("crear una publicación de material desde el perfil", async ({ page }) => {
  await login(page);
  await page.goto("/es/perfil");
  await page.getByRole("tab", { name: "Vendedor" }).click();
  await page.getByRole("button", { name: "Nuevo material" }).click();
  const modal = page.getByRole("dialog", { name: "Crear publicación" });
  const titulo = `Material E2E ${Date.now()}`;
  await modal.getByPlaceholder("ej. Tutoría de Cálculo Diferencial").fill(titulo);
  await modal.getByPlaceholder("Describe las características y beneficios clave...").fill("Material para comprobar el flujo completo de creación de publicaciones.");
  await modal.getByPlaceholder("0.00").fill("10.00");
  await modal.getByRole("button", { name: "Seleccionar categoría" }).click();
  await modal.locator(".crear-publicacion__categories-option").first().click();
  await modal.locator(".crear-publicacion__categories-trigger").click();
  await modal.getByRole("button", { name: "Crear Publicación" }).click();
  const creada = page.waitForResponse((response) => response.url() === `${apiURL}/api/publicacion/` && response.request().method() === "POST");
  await page.locator(".confirm-dialog__btn-confirm").click();
  expect((await creada).status()).toBe(201);
  await expect(page.getByText(titulo).first()).toBeVisible();
});

test("ver el detalle de tutoría y abrir las certificaciones del vendedor", async ({ page }) => {
  await login(page, "estudiante@uvg.edu.gt", "Estudiante123!");
  await page.goto("/es/tutorias");
  const card = page.locator(".post-card").filter({ hasText: "Tutoría de AED — Recursión y Grafos" }).first();
  await card.getByRole("button", { name: /Detalles/ }).click();
  const detalle = page.locator(".post-modal").first();
  await expect(detalle.getByRole("heading", { name: "Tutoría de AED — Recursión y Grafos" })).toBeVisible();
  await detalle.getByRole("button", { name: "Ver certificaciones" }).click();
  await expect(page).toHaveURL(/\/es\/perfil\/\d+\?modo=tutor&certificaciones=1/);
  await expect(page.getByText("Certificación de algoritmos")).toBeVisible();
});

test("los listados públicos no muestran publicaciones propias", async ({ page }) => {
  await login(page);
  await page.goto("/es/materiales");
  await expect(page.locator(".post-card").filter({ hasText: "Resúmenes de Bioquímica" }).first()).toBeVisible();
  await expect(page.locator(".post-card").filter({ hasText: "Apuntes de AED — Árboles y Grafos" })).toHaveCount(0);
});

test("enviar un mensaje en una conversación existente", async ({ page }) => {
  await login(page);
  await page.goto("/es/Chat");
  await page.locator(".chat-sidebar__item").filter({ hasText: "Adriana Jiménez" }).click();
  const mensaje = `Mensaje E2E ${Date.now()}`;
  await page.getByPlaceholder("Escribe un mensaje").fill(mensaje);
  await page.locator(".chat-input").getByRole("button", { name: "Enviar" }).click();
  await expect(page.locator(".chat-principal__body").getByText(mensaje)).toBeVisible();
});
