# Submitting an Experiment

Status: process in force for the Virtual Chemistry Lab content pipeline.

Thank you for contributing chemistry content. This project's core promise is
scientific honesty, so the process below is stricter than a typical docs PR.
Read `docs/experiments/experiment-authoring-guide.md` first.

## 1. Propose before you write

Open an issue with:

- working title and the chemistry it teaches;
- target audience (see `docs/science/educational-levels.md`) and difficulty;
- learning objectives (2–4);
- a **source plan**: the real references you will ground the content in
  (official textbooks, databases, curriculum documents — see
  `docs/science/content-reference-policy.md`);
- safety sketch: chemicals/apparatus involved and their hazard classes;
- your relationship to the content (educator, student, AI-assisted draft, …).

Large or safety-sensitive proposals are discussed before implementation. We
may redirect you to an existing experiment to extend instead.

## 2. Build the record

- One file: `packages/experiment-library/src/content/experiments/<experiment-id>.json`,
  registered in `content/experiments/index.ts`.
- Validate locally: `pnpm --filter @virtual-chemistry-lab/experiment-library test`
  (the suite loads real content and prints exact schema/referential issues).
- Follow the honesty rules: no invented citations/DOIs/CIDs, no invented data,
  unknowns marked `requires_review`, AI-assisted drafts declared as such.
- New taxonomy topics or curricula go in the same PR as registry updates with
  a note explaining the addition.

## 3. Open a pull request

Your PR description should state:

- what the record teaches and for whom;
- every reference and how it was verified (fetched / corroborated / standard
  bibliographic entry);
- known limitations and outstanding concerns;
- confirmation that you did not fabricate sources, data, or review events.

## 4. What happens next

1. **Automated checks** — schema, catalog validation, unit tests, lint,
   typecheck and the web build must pass.
2. **Maintainer review** — scope, tone, structure, licensing.
3. **Scientific review** — a qualified reviewer (never solely the author)
   checks the science and records a review event. AI-assisted content always
   needs this step before anything stronger than `draft`.
4. **Safety review** — hazards, evidence and supervision assessed.
5. **Publication** — `publicationStatus: published` only with complete safety
   metadata; the integrity label shown to learners reflects the real review
   state.

## Corrections and reports

Anyone can report a scientific or safety error via an issue (use the
`content-safety` label for hazard concerns). Critical defects trigger
immediate unpublishing while investigated
(`docs/experiments/experiment-safety-policy.md`).

## Licensing note

Content licensing is pending the project owner's decision
(`LICENSE_SELECTION.md`); submissions are accepted under the understanding
that they will be relicensed under the project's eventual content license
(candidate: CC BY 4.0). Never submit third-party text you cannot license.
