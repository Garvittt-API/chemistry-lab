import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("molecule library: load, inspect, controls, representations and reset", async ({ page }) => {
  await page.goto("/molecules");
  await expect(page.getByRole("heading", { level: 1, name: "Molecule library" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /Water H2O/ })).toBeVisible();
  await expect(page.locator(".scene-container canvas")).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: /Benzene C6H6/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: /Benzene C6H6/ })).toBeVisible();
  await page.getByRole("button", { name: "Rotate molecule right" }).click();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("combobox", { name: "Representation" }).selectOption("space-filling");
  await page.getByLabel("Atom labels").uncheck();
  await page.getByLabel("High contrast").check();

  await page.getByText("Atom and bond selection lists").click();
  await page.getByRole("button", { name: "C · c1", exact: true }).click();
  await expect(page.locator(".molecule-inspector")).toContainText("C atom c1");
  await page.getByRole("button", { name: "cc1 · aromatic", exact: true }).click();
  await expect(page.locator(".molecule-inspector")).toContainText("aromatic bond cc1");
  await expect(page.locator(".molecule-inspector")).toContainText("model-derived");

  await page.getByRole("button", { name: "Reset molecule view" }).click();
  await expect(page.getByRole("combobox", { name: "Representation" })).toHaveValue(
    "ball-and-stick",
  );
  await expect(page.getByLabel("Atom labels")).toBeChecked();
  await expect(page.locator(".molecule-inspector")).toContainText("No atom or bond selected");

  await page.getByRole("button", { name: "2D alternative" }).click();
  await expect(
    page.getByRole("group", { name: /Two-dimensional orthographic projection of Benzene/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Select C atom c1" }).click();
  await expect(page.locator(".molecule-inspector")).toContainText("C atom c1");
  await page.getByText("Full text description of Benzene").click();
  await expect(page.locator(".molecule-text-alternative")).toContainText("aromatic");

  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test("molecule library: keyboard scene controls and text alternatives", async ({ page }) => {
  await page.goto("/molecules");
  const scene = page.getByRole("application", { name: /Water 3D scene/ });
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("+");
  await page.keyboard.press("Home");
  await page.getByText("Full text description of Water").click();
  await expect(page.locator(".molecule-text-alternative")).toContainText("104.5 degrees");
  await expect(page.locator(".molecule-text-alternative")).toContainText("not an idealized");
});

test("unsupported WebGL falls back without losing scientific information", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
      return original.call(this, type as "2d", ...args);
    } as typeof original;
  });
  await page.goto("/molecules");
  await expect(
    page.getByRole("heading", { name: "3D is unavailable on this device" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use 2D structure" }).click();
  await expect(
    page.getByRole("group", { name: /Two-dimensional orthographic projection of Water/ }),
  ).toBeVisible();
  await page.getByText("Full text description of Water").click();
  await expect(page.locator(".molecule-text-alternative")).toContainText("H2O");
});

test("2D laboratory remains functional after switching to 3D equipment", async ({ page }) => {
  await page.goto("/experiments/solution-dilution/lab");
  await page.getByRole("button", { name: "3D equipment" }).click();
  await expect(page.getByRole("heading", { name: "Equipment", exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "10 mL measuring cylinder", exact: true }).click();
  await expect(page.locator(".lab-object-inspector")).toContainText("Nominal capacity 10 mL");
  await page.getByRole("button", { name: "Right", exact: true }).click();
  await page.getByRole("button", { name: "Rotate", exact: true }).click();
  await page.getByRole("button", { name: "Reset scene" }).click();
  await page.getByRole("button", { name: "2D laboratory" }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("button", { name: /Glassware placed/ })).toBeVisible();
});

test("VSEPR experiment opens its molecular workspace", async ({ page }) => {
  await page.goto("/experiments/vsepr-molecular-geometry/lab");
  await expect(page.getByText("VSEPR molecular structure view")).toBeVisible();
  await page.getByRole("button", { name: "Ammonia", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: /Ammonia NH3/ })).toBeVisible();
  await expect(page.locator(".molecule-inspector")).toContainText("106.7°");
});
