import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the home page with real catalog statistics", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Virtual Chemistry Lab");
  await expect(
    page.getByRole("heading", { name: "Understand the work behind the experiment." }),
  ).toBeVisible();
  await expect(page.getByText(/Schema 2\.0\.0/)).toBeVisible();
  await expect(page.getByText(/10 published experiments/)).toBeVisible();
  await expect(
    page
      .getByText(/awaiting independent scientific review|pending independent scientific review/)
      .first(),
  ).toBeVisible();

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

test("searches real records and shows an honest empty state", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByText("10 published experiments")).toBeVisible();

  await page.getByLabel("Search published experiments").fill("daniell");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/\/explore\?/);
  await expect(page.getByText("1 published experiment")).toBeVisible();
  await expect(page.getByRole("heading", { name: /The Daniell Cell/ })).toBeVisible();

  await page.getByLabel("Search published experiments").fill("unicornium");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page.getByRole("heading", { name: "No published experiments match these filters" }),
  ).toBeVisible();
});

test("renders a real experiment detail page with review provenance", async ({ page }) => {
  await page.goto("/explore");
  await page
    .getByRole("link", { name: /Read experiment/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/experiments\/[a-z0-9-]+$/);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning objectives" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Safety information" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review and provenance" })).toBeVisible();
  await expect(page.getByText(/pending scientific review/i).first()).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "The laboratory workspace will arrive with reviewed models",
    }),
  ).toBeVisible();
});

test("restricts unpublished draft records with a 404", async ({ page }) => {
  // In `next dev`, streamed dynamic routes may answer the initial document
  // request with HTTP 200 before the not-found boundary resolves, so the
  // enforcement is asserted at the boundary and content level: the 404 UI
  // must render and no draft content may leak.
  await page.goto("/experiments/basic-spectroscopic-interpretation");
  await expect(
    page.getByRole("heading", { name: "That page is not part of the current lab." }),
  ).toBeVisible();
  await expect(page.getByText(/Basic Spectroscopic Interpretation/i)).toHaveCount(0);
});

test("key pages pass the automated accessibility scan", async ({ page }) => {
  for (const route of ["/explore", "/subjects", "/about", "/settings"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const accessibilityResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityResults.violations, route).toEqual([]);
  }
});
