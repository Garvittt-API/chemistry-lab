# Changelog

All notable changes to this project are recorded here. Follow Keep a Changelog conventions where practical.

## [Unreleased]
### Phase 07 — Learning system, practical notebook, calculations and report exports
- Added framework-free `@virtual-chemistry-lab/learning-core` (`schemaVersion: "1.0.0"`, 21 Vitest tests): 4 staged learning pathways, 10 source-cited theory lessons, 30 IUPAC/NCERT/SI glossary entries, 9 deterministic self-check quizzes (`toLearnerQuestions` strips answer keys before submission; numerical tolerances & `simulation-core` formula/equation checks), 8 `simulation-core` calculation workbench adapters, multi-session Practical Notebook CRUD with Phase 05 migration (`migratePhase05SessionToNotebookSession`), versioned local storage (`vcl-learning-store-v1`) with corrupted-payload quarantine, 20-section Practical Report builder with mandatory `title` and `simulation_disclosure` sections, and zero-dependency deterministic PDF 1.4 (`verifyGeneratedPdf`), HTML (`escapeHtml` + inline SVG XY plots), CSV (`neutralizeSpreadsheetFormula`), and prototype-guarded JSON exporters/importers.
- Added web routes `/learn`, `/learn/pathways/[slug]`, `/learn/lessons/[slug]`, `/learn/glossary`, `/learn/assessments/[id]`, `/notebook`, `/notebook/[sessionId]`, `/notebook/[sessionId]/report`, updated `/my-lab` progress dashboard and `/settings` confirmation-gated local data management, integrated `ExperimentLearningPanel` on `/experiments/[id]` and `LabNotebookBridge` on dilution & pH 2D labs, and added `apps/web/e2e/learning-notebook.spec.ts`.
- Fixed 5 pre-existing Phase 05/06 Playwright/axe defects: eliminated nested `<main>` landmarks on `/molecules`, `DilutionLab`, and `PhLab`, added molecule `<h2>` heading in `VseprLab`, aligned unavailable-lab `<h2>` copy (`"not yet available"`), and scoped `.lab-bench-readouts` regexes in `apps/web/e2e/lab.spec.ts`.
- Added `ADR-012` and `docs/development/phase-07-acceptance.md`, and updated architecture, privacy, threat-model, validation, and governance records. All learning content remains `pending_scientific_review`; no accounts, backend, or cloud sync introduced.

### Phase 06 — 3D laboratory and molecular visualization
- Added framework-free `@virtual-chemistry-lab/molecular-visualization`: strict bounded Zod contracts, ten versioned/source-labelled molecular structures, coordinate-derived lengths/angles, complete text descriptions, visualization state and resource lifecycle helpers. Molar mass and elements delegate to Phase 04.
- Added a Three.js/R3F molecular viewer with single/double/triple/aromatic bonds, atom/bond inspection, representations, labels, keyboard/camera controls, high contrast, demand rendering, adaptive quality, cleanup, loading/error/WebGL fallbacks and 2D/list/text alternatives.
- Added a reusable 3D equipment scene driven by Phase 05 definitions. Dilution and pH preserve their 2D workspaces and gain optional 3D layouts; VSEPR gains a molecular workspace without duplicating experiment content.
- Added Playwright journeys (local execution blocked by browser CDN), ADR-011, architecture/science/accessibility/performance/integration documents and honest pending-review status. Native 3D, glucose and electronic-property maps are not implemented.

### Fixed
- Synced README, ARCHITECTURE, architecture overview and testing docs to Phase 03 reality (they still described Phase 02 demonstration content after the library integration).
- Aligned `react` with `react-dom` at 19.3.1 in web and mobile (Dependabot's react bump PR had been closed unmerged, leaving a version skew).
- Removed a no-op ternary in `getCollectionStats`.

### Added
- `SCIENTIFIC_VALIDATION_LOG.md`: traceable model/content validation record (honestly empty model table; 0/11 records scientifically reviewed).
- `RELEASE_CHECKLIST.md`: release-readiness requirements with owner-approval items marked.

### Phase 04 — Scientific simulation engine (validation-gated, not user-visible yet)
- Added `@virtual-chemistry-lab/simulation-core`: framework-free TypeScript package with (a) dimension-vector unit system with affine temperature support, (b) physical-constants registry (SI Brochure 9th ed. exact defining constants, CODATA 2018 measured values, conventional 25 °C K_w) with explicit exact/conventional/measured precision classes and source strings, (c) elements registry (CIAAW abridged standard atomic weights, 2021 revision), (d) formula parsing + molar mass (nested brackets, hydrates), (e) chemical quantities (n/m/c/γ/dilution/percent yield — yield never clamped), (f) reaction parsing and EXACT rational balancing (bigint fraction nullspace; atom + charge conservation; lowest-terms positive integers; non-unique systems rejected, never fudged), (g) limiting-reagent stoichiometry, (h) pH/pOH for strong/weak monoprotic systems at 25 °C with explicit validity limits.
- Added 52 machine-checked reference cases (`reference-cases.ts`) with tolerance and source metadata; `pnpm test` executes all of them (258 tests total, all green 2026-11-07). Human-readable register: `docs/science/reference-cases.md`.
- Added 8 model reports (`docs/science/models/*.md`), updated `model-catalog.md`, and added ADR-010 (exact-arithmetic engine decision).
- Status honesty preserved: no model is `independently reviewed` or `production-approved`; `pending_human_review` throughout; simulation contracts in all experiment records remain `planned`; nothing in this change makes any simulation learner-visible.

### Phase 03 — Experiment library, scientific content and curriculum mapping
- Added the versioned experiment record contract `2.0.0` in `experiment-schema` (taxonomy, educational levels, CBSE curriculum mapping, safety, procedure, observations/calculations unions, references, review/status axes, simulation model contracts) with 31 tests and a legacy-metadata migration.
- Added the framework-free `experiment-library` package: versioned local JSON content with mandatory schema + referential validation at catalog build, plus pure filter/search/sort/paginate queries and a publication-status visibility gate (23 tests).
- Added the initial experiment collection: 11 records (10 published, 1 draft) covering solutions, dilution, acid–base titration, pH & indicators, paper chromatography, reaction rates, FeSCN equilibrium, the Daniell cell, VSEPR geometry, flame tests and a deliberately incomplete spectroscopy draft — all labelled `pending_scientific_review` with traceable NCERT/PubChem/CBSE references and honest verification statuses.
- Added chemistry taxonomy (15 disciplines), educational-level registry (6 levels) and CBSE 2025-26 curriculum registry with all experiment mappings marked `proposed_pending_verification`.
- Rebuilt the web discovery surfaces on real content: search/filter/sort with empty and error states, full experiment detail rendering (theory, materials, safety, procedure, observations, calculations, simulation status, references, review provenance), taxonomy-based subject pages, and unpublished-content restriction (draft records 404).
- Rewrote the Playwright e2e suite (6 tests) against real content including the publication restriction and axe accessibility scans.
- Added docs: science policy set (taxonomy, educational levels, curriculum mapping, content validation, content references), experiment docs (specification update, authoring guide, review workflow, versioning, safety policy, library architecture), contribution guide and ADR-009.

### Phase 02 — Design system and web foundation
- Added a scientific editorial visual system with semantic light/dark tokens, responsive layouts and reduced-motion support.
- Added responsive navigation, theme settings, home, experiment discovery, subject discovery, experiment detail, About, Help and My Lab foundations.
- Added explicitly labelled demonstration content and a future laboratory integration boundary without simulated results.
- Added axe-core accessibility scans, keyboard/menu coverage, filtering/detail-route tests and consistent Lucide icons.

### Added
- Initial product, architecture, design, science, security and development documentation pack.
- TypeScript pnpm/Turbo workspace with pinned Node.js and package-manager versions.
- Minimal Next.js App Router web application and Expo mobile application.
- Versioned Zod experiment metadata schema with valid and invalid unit tests.
- Strict TypeScript, ESLint, Prettier, Vitest, CI workflow, Dependabot configuration and environment conventions.

### Fixed
- Added repository line-ending attributes so clean Windows clones pass the formatting gate.

### Not yet implemented
- Learner-visible simulation (the Phase 04 engine is implemented and reference-verified, but not wired into any experiment; `simulationContract` remains `planned` everywhere until models are scientifically reviewed and Phase 05 lands).
- Scientific validation of content (qualified reviewer sign-off outstanding for the whole collection).
- Authentication, persistence, synchronization or deployment.
- Native device builds and learner-notebook journeys.
