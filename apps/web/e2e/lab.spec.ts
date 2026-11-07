import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * End-to-end tests for the Phase 05 interactive 2D laboratory.
 *
 * Playwright browsers cannot be downloaded in the local sandbox, so these
 * tests execute in CI (where Playwright has browsers). This file exercises
 * the full user journey for both implemented experiments:
 *
 *  1. Open an experiment → Open lab
 *  2. Verify layout, equipment tray, procedure, measurements
 *  3. Enter inputs → run calculation → observe tagged output
 *  4. Record an observation
 *  5. Reset
 */

test("solution dilution lab: full journey and provenance", async ({ page }) => {
  await page.goto("/experiments/solution-dilution");
  await page.getByRole("link", { name: /Open laboratory workspace/ }).click();
  await expect(page).toHaveURL(/\/experiments\/solution-dilution\/lab$/);

  await expect(page.getByRole("heading", { level: 1, name: /Serial Dilution/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Procedure" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Equipment" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Measurements" })).toBeVisible();

  // Start
  await page.getByRole("button", { name: "Start" }).click();
  // Required glassware is auto-placed, so step 0 completion should be possible.
  await page.getByRole("button", { name: /Glassware placed/ }).click();
  await page.getByRole("button", { name: "Continue to volumes" }).click();
  await page.getByRole("button", { name: "Ready to calculate" }).click();

  // c1*V1/V2 = 0.5*10/100 = 0.05
  await page.getByRole("button", { name: /Run dilution calculation/ }).click();

  // Result readout must appear and be tagged as calculated
  await expect(page.locator(".lab-bench-readouts").getByText(/0\.0500\s*mol\/L/)).toBeVisible({
    timeout: 5000,
  });
  const badges = page.locator(".lab-source-model_calculated");
  expect(await badges.count()).toBeGreaterThanOrEqual(1);

  // Model provenance is shown
  await expect(page.getByText(/dilution-c1v1c2v2/)).toBeVisible();

  // Recording an observation works
  await page.getByLabel("Observation note").fill("Colour visibly paler after dilution.");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Colour visibly paler after dilution.")).toBeVisible();

  // Reset clears everything
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  await expect(page.getByText("No measurements recorded yet")).toBeVisible();

  // Accessibility
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test("pH lab: strong acid calculation and model limitations", async ({ page }) => {
  await page.goto("/experiments/ph-and-indicators/lab");

  await expect(page.getByRole("heading", { level: 1, name: /pH/ })).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: /Glassware ready/ }).click();
  await page.getByRole("button", { name: "Choose concentration" }).click();
  await page.getByRole("button", { name: "Ready to measure" }).click();
  await page.getByRole("button", { name: /Dip electrode/ }).click();

  // 0.01 M HCl -> pH ~ 2
  await expect(page.locator(".lab-bench-readouts").getByText(/2\.00\s*pH/)).toBeVisible({
    timeout: 5000,
  });

  // Limitations panel is visible
  await expect(page.getByText(/Model limitations/)).toBeVisible();

  // Provenance
  await expect(page.getByText(/ph-monoprotic-25c/)).toBeVisible();

  // Keyboard-accessible: focusable equipment items
  await page.keyboard.press("Tab");
  // Accessibility
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test("non-implemented experiments show honest unavailable panel", async ({ page }) => {
  await page.goto("/experiments/acid-base-titration/lab");
  await expect(page.getByRole("heading", { name: /not yet available/i })).toBeVisible();
  // Links to the implemented experiments are offered instead.
  await expect(page.getByRole("link", { name: /Solution Dilution/ })).toBeVisible();
});
