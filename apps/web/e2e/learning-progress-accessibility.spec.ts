import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("pathway progress exposes accurate accessible values on learning and dashboard pages", async ({
  page,
}) => {
  const name = "Beginner Chemistry: Chemical Quantities & Aqueous Solutions completion";
  await page.goto("/learn");
  const hubProgress = page.getByRole("progressbar", { name, exact: true });
  await expect(hubProgress).toHaveAttribute("aria-valuemin", "0");
  await expect(hubProgress).toHaveAttribute("aria-valuemax", "100");
  await expect(hubProgress).toHaveAttribute("aria-valuenow", "0");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  const beginnerCard = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Beginner Chemistry: Chemical Quantities & Aqueous Solutions",
      exact: true,
    }),
  });
  await beginnerCard.getByRole("link", { name: "Open pathway" }).click();
  const pathwayProgress = page.getByRole("progressbar", { name, exact: true });
  await expect(pathwayProgress).toHaveAttribute("aria-valuenow", "0");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const pathwayUrl = page.url();

  const lessonStep = page.getByRole("listitem").filter({
    has: page.getByRole("heading", {
      name: "SI Units, Molar Mass and Amount of Substance",
      exact: true,
    }),
  });
  await lessonStep.getByRole("link", { name: "Open lesson" }).click();
  await page.getByRole("button", { name: /Mark lesson completed/i }).click();
  await expect(page.getByRole("button", { name: /Mark as in progress/i })).toBeVisible();
  await page.goto(pathwayUrl);
  const progressText = await page
    .getByText(/\d+ of \d+ required items completed in this browser\./)
    .textContent();
  const counts = progressText?.match(/(\d+) of (\d+)/);
  expect(counts).not.toBeNull();
  expect(Number(counts![1])).toBe(1);
  const expected = Math.round((Number(counts![1]) / Number(counts![2])) * 100).toString();
  expect(Number(expected)).toBeGreaterThan(0);
  await expect(pathwayProgress).toHaveAttribute("aria-valuenow", expected);

  await page.goto("/learn");
  await expect(hubProgress).toHaveAttribute("aria-valuenow", expected);
  await page.goto("/my-lab");
  const summary = page.getByRole("group", { name: "Local learner progress summary" });
  await expect(summary).toBeVisible();
  await expect(summary.getByText("Lessons completed", { exact: true })).toBeVisible();
  await expect(summary.getByText(/^1\/\d+$/)).toBeVisible();
  await expect(page.getByRole("progressbar", { name, exact: true })).toHaveAttribute(
    "aria-valuenow",
    expected,
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
