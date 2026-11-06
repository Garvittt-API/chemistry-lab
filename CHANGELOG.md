# Changelog

All notable changes to this project are recorded here. Follow Keep a Changelog conventions where practical.

## [Unreleased]
### Fixed
- Synced README, ARCHITECTURE, architecture overview and testing docs to Phase 03 reality (they still described Phase 02 demonstration content after the library integration).
- Aligned `react` with `react-dom` at 19.3.1 in web and mobile (Dependabot's react bump PR had been closed unmerged, leaving a version skew).
- Removed a no-op ternary in `getCollectionStats`.

### Added
- `SCIENTIFIC_VALIDATION_LOG.md`: traceable model/content validation record (honestly empty model table; 0/11 records scientifically reviewed).
- `RELEASE_CHECKLIST.md`: release-readiness requirements with owner-approval items marked.

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
- Chemistry simulation engine (simulation contracts are `planned` only).
- Scientific validation of content (qualified reviewer sign-off outstanding for the whole collection).
- Authentication, persistence, synchronization or deployment.
- Native device builds and learner-notebook journeys.
