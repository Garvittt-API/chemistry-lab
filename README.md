# Virtual Chemistry Lab

An open-source, cross-platform virtual chemistry laboratory for school and college learners. The
long-term product vision includes interactive 2D and 3D experiments, molecular visualization,
structured practical records, assessments, and offline-capable learning.

> **Project status:** Phase 06 scoped 3D implementation is awaiting project-owner acceptance,
> browser/device verification and qualified scientific review. Phase 05 provides model-backed 2D
> dilution and pH workspaces; Phase 06 adds ten source-labelled molecular structures and reusable
> 3D scenes. All experiment and molecular content remains `pending_scientific_review`.

## Guiding principles

1. Scientific correctness before visual effects.
2. Safety and transparent limitations are mandatory.
3. Shared experiment definitions and scientific logic across platforms.
4. Accessible, responsive, beginner-friendly learning experiences.
5. Small, reviewable phases with explicit acceptance gates.
6. Open-source collaboration with clear licensing and provenance.

## Current scope

Phase 01 established the product requirements, architecture, repository structure, engineering
standards, security baseline and CI. Phase 02 added the responsive web design system and
application foundation. Phase 03 added the versioned experiment record contract (schema 2.0.0),
the framework-free `experiment-library` package, an initial collection of 11 experiment records
and real search/discovery/detail surfaces on the web. Phase 04 added the framework-free
`simulation-core` scientific engine (units, constants, elements, molar mass, quantities,
reaction balancing, stoichiometry, 25 °C monoprotic pH) with 52 machine-checked reference cases.
It is implemented and reference-verified but not scientifically reviewed. Phase 05 added shared
laboratory equipment/procedure/observation contracts and two model-backed 2D workspaces. Phase 06
adds renderer-independent molecular contracts and selective R3F visualization with accessible
2D/text alternatives; it does not add another scientific engine or claim scientific validation.

## Current foundation

This repository contains the TypeScript monorepo, responsive Next.js web application, minimal Expo
mobile scaffold, the versioned experiment contracts in `packages/experiment-schema`, the
validated content catalog in `packages/experiment-library`, and the simulation engine in
`packages/simulation-core`. All 10 published experiment records are AI-assisted drafts awaiting
independent scientific review; the UI states this on every surface. Native mobile 3D, glucose,
electronic-property visualization, authentication, database, AI tutor and production deployment
are not included.

## Getting started

Use Node.js `24.18.1` and pnpm `12.16.1` (Corepack can activate the pinned package manager):

```powershell
corepack enable
corepack pnpm install
corepack pnpm dev
```

See `docs/development/setup.md` for web and mobile commands, and `docs/development/testing.md`
for verification commands.

## Documentation map

- `apps/`: web and mobile application entry points.
- `packages/experiment-schema/`: versioned, Zod-validated experiment record contracts.
- `packages/experiment-library/`: validated experiment content catalog and query API.
- `packages/simulation-core/`: framework-free scientific engine (units, constants, elements,
  molar mass, quantities, reaction parsing/exact balancing, stoichiometry, acid/base pH) and its
  reference-case suite.
- `packages/laboratory-core/`: shared equipment, procedures, observations and 2D experiment adapters.
- `packages/molecular-visualization/`: validated molecular data, geometry and visualization state.
- `docs/science/`: scientific integrity, validation, units, model reports and the reference-case
  register.
- `docs/product/`: vision, requirements, roadmap and scope.
- `docs/design/`: design principles, design system and accessibility.
- `docs/architecture/`: system design, data flow and decisions.
- `docs/science/`: scientific integrity, validation, units and model policy.
- `docs/security/`: threat model, secure development and privacy.
- `docs/experiments/`: content specification and authoring workflow.
- `docs/development/`: setup, workflow, testing and release process.
- Root governance files: contribution, conduct, security reporting, changelog, license and project state.

## Important disclaimer

Virtual experiments are educational models. They do not replace supervised laboratory instruction,
institutional safety procedures, or real-world practical competency. Each future simulation must
disclose assumptions, limitations, and whether results are theoretical, simulated, or measured.
