import { expect, test } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";

const sentence =
  "El presente contrato tendra una duracion de veinticuatro meses entre las partes acme y norte.";

test("sube un PDF, espera el indice y muestra la cita", async ({ page }) => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const sheet = pdf.addPage();
  sheet.drawText(sentence, { x: 50, y: 700, size: 12, font });
  const bytes = await pdf.save();

  const email = `e2e-${Date.now()}@legal.ai`;
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill("secreto123");
  await page.getByRole("button", { name: "Registrarme" }).click();
  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();

  await page.getByRole("link", { name: "Documentos" }).click();
  await page.locator("input[name='file']").setInputFiles({
    name: "contrato-e2e.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(bytes),
  });
  await page.getByRole("button", { name: "Subir" }).click();
  await page.getByRole("link", { name: /contrato-e2e\.pdf/ }).click();
  await expect(page.getByRole("button", { name: "Preguntar" })).toBeEnabled({
    timeout: 30_000,
  });
  await page.getByPlaceholder("¿De qué mes es este resumen?").fill(
    "duracion de veinticuatro meses entre acme y norte",
  );
  await page.getByRole("button", { name: "Preguntar" }).click();
  await expect(page.getByText(/Fuente: contrato-e2e\.pdf · página 1/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/veinticuatro meses/).first()).toBeVisible();
  await expect(page.getByText("Citas comprobadas contra los fragmentos recuperados.")).toBeVisible();
});
