# Design System — Initial Contract

This document defines principles and token categories. Exact values must be validated in Phase 02 through contrast and device testing.

## Tokens
Create semantic tokens rather than scattering raw values:
- Color: `background`, `surface`, `surface-raised`, `text-primary`, `text-secondary`, `border`, `accent`, `success`, `warning`, `danger`, `info`.
- Typography: `display`, `heading`, `body`, `label`, `caption`, `numeric`.
- Spacing: consistent scale for compact, default and spacious layouts.
- Radius: small, medium, large, pill.
- Elevation: restrained levels for overlays and raised surfaces.
- Motion: duration and easing tokens, with reduced-motion alternatives.
- Layering: documented z-index scale for menus, dialogs and tooltips.

## Component foundations
- Buttons: primary, secondary, quiet, destructive.
- Inputs: text, numeric with unit, select, checkbox, radio, slider with keyboard equivalent.
- Feedback: inline validation, alert, toast, empty state, loading state.
- Navigation: responsive navigation, breadcrumbs where useful.
- Learning: objective panel, theory block, equation display, reference list.
- Lab: apparatus view, variable control, measurement readout, observation table, safety panel.
- Data: tables with headers, units and accessible labels.

## Component rules
- Every control has a visible or programmatic label.
- Disabled state explains why an action is unavailable where needed.
- Numeric controls validate ranges and units.
- Color is never the only indicator of status.
- Focus indicators must remain visible.
- Components must have documented responsive behavior.

## Implementation note
Do not build a large component library before real screens establish reusable patterns. Keep scientific domain components separate from generic UI primitives.
