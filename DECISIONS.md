# Architecture Decision Register

Record accepted decisions here and link to detailed ADR files.

| ID | Decision | Status | Date |
|---|---|---|---|
| ADR-001 | TypeScript-first monorepo for shared web/mobile domain logic | Implemented; owner review pending | 2026-11-03 |
| ADR-002 | Scientific engine independent from rendering/UI | Implemented in architecture; owner review pending | 2026-11-03 |
| ADR-003 | Web-first MVP; mobile scaffolded but not feature-parity initially | Implemented; owner review pending | 2026-11-03 |
| ADR-004 | 2D-first; selective 3D where pedagogically valuable | Adopted direction; owner review pending | 2026-11-03 |
| ADR-005 | Defer backend/auth/database until justified | Adopted direction; owner review pending | 2026-11-03 |
| ADR-006 | Separate application code license from educational content license | Proposed; legal decision pending | TBD |
| ADR-007 | Pin the Phase 01 toolchain and add only consumed packages | Implemented; owner review pending | 2026-11-03 |
| ADR-008 | Scientific editorial web design system with consumed components only | Implemented; owner review pending | 2026-11-03 |
| ADR-009 | Versioned local content with a framework-free experiment library and layered validation | Implemented; owner review pending | 2026-11-06 |
| ADR-010 | Exact-arithmetic, framework-free simulation engine (bigint rational balancing, refuse-ambiguity input, reference-verified only) | Implemented; owner review pending | 2026-11-07 |
| ADR-011 | Framework-independent molecular contracts with one R3F/Three.js web renderer and accessible fallbacks | Implemented; owner/scientific review pending | 2026-11-07 |
| ADR-012 | Framework-independent learning, practical notebook, and deterministic report export system (`@virtual-chemistry-lab/learning-core`) | Implemented; owner/scientific review pending | 2026-11-07 |

Do not treat `owner review pending` or `Proposed` as final project-owner approval. Detailed records: ADR-001 to ADR-004 live in `docs/architecture/decisions/` (`ADR-004-phase-01-toolchain.md` documents register entry ADR-007); ADR-005 is recorded in the "Backend decision" section of `docs/architecture/overview.md`; ADR-006 is recorded in `LICENSE_SELECTION.md`; ADR-008 is documented in `docs/architecture/decisions/ADR-008-phase-02-web-design-system.md`; ADR-009 is documented in `docs/architecture/decisions/ADR-009-versioned-content-and-experiment-library.md`; ADR-010 is documented in `docs/architecture/decisions/ADR-010-scientific-simulation-engine.md`; ADR-011 is documented in `docs/architecture/decisions/ADR-011-threejs-molecular-visualization.md`; ADR-012 is documented in `docs/architecture/decisions/ADR-012-learning-notebook-and-report-system.md`.
