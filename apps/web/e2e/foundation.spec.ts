import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the Phase 01 foundation page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Virtual Chemistry Lab");
  await expect(
    page.getByRole("heading", { name: "Understand the work behind the experiment." }),
  ).toBeVisible();
  await expect(page.getByText(/Schema 1\.0\.0/)).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const darkAccessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(darkAccessibilityResults.violations).toEqual([]);
});

test("supports keyboard navigation and the responsive menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore experiments" }).last()).toBeVisible();
});

test("filters demonstration content and exposes the future lab boundary", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByText("3 demonstration records")).toBeVisible();

  await page.getByLabel("Search demonstration content").fill("molecular");
  await expect(page.getByText("1 demonstration record")).toBeVisible();
  await expect(page.getByRole("heading", { name: /molecular structure metadata/i })).toBeVisible();

  await page.getByRole("link", { name: "Read layout" }).click();
  await expect(page).toHaveURL(/\/experiments\/molecular-structure-metadata$/);
  await expect(
    page.getByRole("heading", {
      name: "The laboratory workspace will arrive with reviewed models",
    }),
  ).toBeVisible();
  await expect(page.getByText(/no readings, observations or calculations/i)).toBeVisible();
});

test("key pages pass the automated accessibility scan", async ({ page }) => {
  for (const route of ["/explore", "/subjects", "/about", "/settings"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const accessibilityResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityResults.violations, route).toEqual([]);
  }
});
