# Component Guidelines

## Naming and ownership

- Generic visual patterns belong in `apps/web/components/ui.tsx` only when more than one page uses
  them.
- Route-specific interactions belong in a named component such as `explore-view.tsx` or
  `settings-view.tsx`.
- Content data belongs in `apps/web/lib`, not inside generic components.
- Chemistry calculations and authoritative model state must remain outside the web presentation layer.

## States

Every interactive component must define its default, hover, focus-visible, disabled, empty and error
states as applicable. Unavailable actions are not rendered as active controls. The current foundation
uses explicit empty and planned-boundary states instead of fake data.

## Content and accessibility

Use semantic HTML first. A visible label or programmatic label is required for every input. Use
`aria-live` only for meaningful state changes. Do not use color as the only status signal. New
scientific values must include units and a provenance label.
