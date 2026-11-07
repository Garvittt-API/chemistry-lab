# System Architecture

## Architectural goals
- Reuse domain logic across web and mobile.
- Keep scientific calculations deterministic and independently testable.
- Make experiment content data-driven and versioned.
- Allow rendering technology to evolve without rewriting chemistry models.
- Keep the initial system simple enough for a small team.

## Phase 01 monorepo
```text
apps/
  web/                 # Next.js user-facing web app
  mobile/              # React Native + Expo app
packages/
  experiment-schema/   # Versioned content contracts and validators
  experiment-library/  # Versioned local content library (Phase 03)
  simulation-core/     # Units, constants, elements, formula/reaction math (Phase 04)
  laboratory-core/     # Equipment, procedures and 2D experiment adapters (Phase 05)
  molecular-visualization/ # Molecular contracts, geometry and visualization state (Phase 06)
docs/
scripts/
.github/
```
Phase 01 created only `experiment-schema` because it had a real API, tests and consumers.
`experiment-library` followed in Phase 03 and `simulation-core` in Phase 04, each with a real
owner and consumers. The shared UI and utility packages remain deferred until they have real
behavior and an owner.

## Dependency direction
- Apps may depend on domain packages.
- `simulation-core` must not depend on apps, React, DOM or renderers.
- `experiment-schema` must not import app code.
- `experiment-library` depends on schema contracts, not UI.
- UI packages must not contain authoritative chemistry calculations.
- Platform-specific integrations remain inside the relevant app.

## Runtime layers
1. **Content layer:** experiment metadata, theory, procedure, safety, references and model configuration.
2. **Domain layer:** typed inputs, units, validation and scientific model functions.
3. **Orchestration layer:** experiment state, user actions, checkpoints and observation capture.
4. **Presentation layer:** 2D/3D renderers, controls, charts and accessible textual equivalents.
5. **Platform layer:** navigation, storage, file export and device capabilities.

## Scientific truth boundary
The simulation model is authoritative for calculated outputs. The renderer visualizes those outputs and must not silently alter them. Any visual approximation must be labelled and documented.

## Data lifecycle
Load experiment content -> validate schema/version -> validate user inputs -> run model -> validate output -> present readings and explanation -> record labelled observations.

## Backend decision
No backend is required for the first local learning prototype unless a validated requirement demands it. Accounts, cloud storage, teacher dashboards, synchronization and analytics require separate privacy/security decisions.

## Implemented foundation

- `apps/web` is a minimal Next.js App Router application with strict TypeScript, a production build,
  environment convention, and error/not-found boundaries.
- `apps/mobile` is a minimal Expo application with TypeScript and validated Expo configuration.
- `packages/experiment-schema` exports the Zod `2.0.0` content contract and its TypeScript types.
- `packages/experiment-library` exports the versioned local content catalog (framework-free, pure functions).
- `packages/simulation-core` exports the scientific simulation engine: unit system with affine
  temperature support, constants registry (SI/CODATA), elements registry (CIAAW abridged 2021),
  formula parsing and molar mass, chemical quantities (moles/mass/concentration/dilution/yield),
  reaction parsing and exact rational balancing with atom + charge conservation, stoichiometry
  (limiting reagent), and 25 °C monoprotic acid/base pH — all covered by 52 independently sourced
  reference cases (see `docs/science/reference-cases.md`). Nothing in it claims scientific review;
  every registered model is `pending_human_review` (see `docs/science/model-catalog.md`).
- Turbo orchestrates package build, lint, typecheck, test and validation tasks.

## Phase 02 web foundation

The web presentation layer is organized as follows:

```text
apps/web/
  app/                    # App Router routes, metadata, loading and error boundaries
  components/             # Shared shell, UI primitives and real page interactions
  lib/content.ts          # View-model adapter over the experiment-library package (Phase 03)
  lib/utils.ts            # Small presentation helpers
```

`ThemeProvider` owns the local light/dark preference. CSS semantic tokens remain in one global
stylesheet so themes and responsive behavior are inspectable without scattering raw values. The
future laboratory is represented by an integration-boundary component; it does not own scientific
state or produce readings.

## Rendering strategy
- Prefer HTML/SVG for accessible diagrams and simple apparatus.
- Use Canvas for dense 2D scenes where justified, with accessible textual alternatives.
- Use Three.js/R3F selectively for 3D; do not make 3D a prerequisite for all experiments.

## Phase 05 and Phase 06

`laboratory-core` supplies equipment/procedure/observation contracts and model-backed dilution/pH adapters to the web 2D labs. `molecular-visualization` adds strict molecular data and renderer-independent geometry/state. Web Three.js/R3F adapters are dynamically loaded and provide SVG/text alternatives. Equipment scenes reuse Phase 05 IDs and definitions. See `docs/architecture/3d-visualization.md`; native mobile 3D is not implemented.

## Failure behavior
Invalid content or model output must fail visibly and safely. Never silently substitute fabricated readings. Provide an actionable error state and preserve user-entered work when safe.
