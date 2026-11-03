import { expect, test } from "@playwright/test";

test("renders the Phase 01 foundation page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Virtual Chemistry Lab");
  await expect(page.getByRole("heading", { name: "Virtual Chemistry Lab" })).toBeVisible();
  await expect(page.getByText("Experiment schema")).toBeVisible();
});
