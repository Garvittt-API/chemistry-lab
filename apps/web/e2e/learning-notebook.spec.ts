import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("learning hub, pathway, lesson completion and glossary pass a11y", async ({ page }) => {
  await page.goto("/learn");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Structured pathways from fundamentals/i,
    }),
  ).toBeVisible();

  const hubA11y = await new AxeBuilder({ page }).analyze();
  expect(hubA11y.violations).toEqual([]);

  // Open Beginner pathway
  await page
    .getByRole("link", { name: /Open pathway/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/learn\/pathways\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Open first lesson in pathway
  await page
    .getByRole("link", { name: /Open lesson/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/learn\/lessons\//);
  await page.getByRole("button", { name: /Mark lesson completed/i }).click();
  await expect(page.getByRole("button", { name: /Mark as in progress/i })).toBeVisible();

  const lessonA11y = await new AxeBuilder({ page }).analyze();
  expect(lessonA11y.violations).toEqual([]);

  // Glossary search
  await page.goto("/learn/glossary");
  await page.getByLabel(/Search chemistry terms/i).fill("molarity");
  await expect(page.getByRole("heading", { name: /Molarity/i }).first()).toBeVisible();
});

test("assessment quiz evaluates unit-checked numerical & conceptual answers and updates My Lab", async ({
  page,
}) => {
  await page.goto("/learn/assessments/quiz-solution-dilution");
  await expect(page.getByRole("heading", { level: 1, name: /Solution Dilution/i })).toBeVisible();

  // Explanations must NOT appear before submission
  await expect(page.getByText(/Scientific explanation:/i)).toHaveCount(0);

  const numericInputs = page.getByLabel("Numerical value");
  await numericInputs.nth(0).fill("0.050");
  await numericInputs.nth(1).fill("12.5");

  await page.getByLabel(/amount of dissolved solute \(in mol\)/i).check();
  await page.getByLabel(/molar concentration decreases proportionally/i).check();
  await page.getByLabel(/concentrated sulfuric acid/i).check();

  await page.getByLabel("Concise scientific response").fill("Moles of dissolved solute");

  await page.getByRole("button", { name: /Submit answers for evaluation/i }).click();
  await expect(page.getByRole("heading", { name: /Assessment passed: 100%/i })).toBeVisible();
  await expect(page.getByText(/Scientific explanation:/i).first()).toBeVisible();

  const quizA11y = await new AxeBuilder({ page }).analyze();
  expect(quizA11y.violations).toEqual([]);

  // Check My Lab reflects passed assessment
  await page.goto("/my-lab");
  await expect(page.getByText(/1\/9/)).toBeVisible();
  const myLabA11y = await new AxeBuilder({ page }).analyze();
  expect(myLabA11y.violations).toEqual([]);
});

test("practical notebook session lifecycle, engine calculation and PDF/HTML/CSV/JSON report export", async ({
  page,
}) => {
  await page.goto("/notebook?experiment=solution-dilution");
  await page.getByLabel(/Session title/i).fill("Dilution E2E Verification");
  await page.getByRole("button", { name: /Create & open session/i }).click();
  await expect(page).toHaveURL(/\/notebook\/sess-/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Dilution E2E Verification" }),
  ).toBeVisible();

  // Record a quantitative observation
  await page.getByRole("tab", { name: /2\. Observations/i }).click();
  await page.getByLabel("Observation title").fill("Aliquot pipette meniscus");
  await page.getByLabel("Numeric value (optional)").fill("10.0");
  await page.getByLabel("Unit (required if numeric)").fill("mL");
  await page.getByRole("button", { name: "Record observation" }).click();
  await expect(page.getByText("Aliquot pipette meniscus")).toBeVisible();

  // Run a simulation-core calculation and save it to session
  await page.getByRole("tab", { name: /4\. Calculations/i }).click();
  await page.getByRole("button", { name: /Compute with engine/i }).click();
  await page.getByRole("button", { name: /Save calculation to notebook session/i }).click();
  await expect(page.getByText(/Saved engine calculation/i)).toBeVisible();

  // Enter discussion & conclusion
  await page.getByRole("tab", { name: /5\. Discussion & Conclusion/i }).click();
  await page.getByLabel(/Discussion/i).fill("Observed linear c1V1 = c2V2 dilution scaling.");
  await page.getByLabel(/Conclusion/i).fill("Modelled final concentration was 0.0500 mol/L.");
  await page.getByLabel(/Sources of error/i).click();

  await page.getByRole("button", { name: /Mark session completed/i }).click();

  // Open Practical Report
  await page.getByRole("link", { name: /Generate practical report/i }).click();
  await expect(page).toHaveURL(/\/notebook\/sess-[^/]+\/report$/);
  await expect(
    page.getByRole("heading", { name: /Simulation & Measurement Disclosure/i }),
  ).toBeVisible();
  await expect(page.getByText(/0\.0500 mol\/L/).first()).toBeVisible();

  // Verify PDF download triggers cleanly
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export PDF/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);

  const reportA11y = await new AxeBuilder({ page }).analyze();
  expect(reportA11y.violations).toEqual([]);
});
