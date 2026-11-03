# ADR-008: Scientific Editorial Web Foundation

- Status: Implemented; project-owner review pending
- Date: 2026-11-03
- Decision owner: Project owner

## Context

Phase 02 needs a distinctive, accessible web foundation without adding a full UI framework or
introducing design abstractions that have no real consumers. The product must communicate scientific
credibility while serving school learners, undergraduate learners and educators.

## Decision

Use a semantic CSS token system in the web app with light and dark themes, a system-font stack, a
measured teal primary, restrained semantic colors, rule-based layouts and reduced motion. Build only
the components required by the implemented routes in `apps/web/components`. Use `lucide-react` for
consistent interface icons and `@axe-core/playwright` for automated accessibility scans.

Keep demonstration content in `apps/web/lib/content.ts`, visibly label it, and keep the future
laboratory workspace as a presentation boundary with no scientific state or fabricated readings.

## Alternatives considered

- A full component framework: rejected for Phase 02 because it adds visual defaults and dependencies
  before the actual product patterns are known.
- Remote display fonts: rejected to preserve broad character coverage, low setup cost and predictable
  loading.
- A visual-only lab canvas: rejected because important information must remain text-accessible and the
  simulation engine belongs to later phases.

## Consequences

- Tokens, responsive rules and component behavior are directly inspectable in the web app.
- New components require a real page consumer and accessibility states.
- The design system is intentionally web-owned; mobile parity will be evaluated separately.
- Formal accessibility review and user research remain future acceptance activities.
