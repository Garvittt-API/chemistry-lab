# Design System — Phase 02 Foundation

The Phase 02 web foundation uses a scientific editorial visual language: quiet mineral neutrals,
measured teal, restrained ochre, precise rules and generous reading rhythm. The temporary product
identity remains **Virtual Chemistry Lab**.

## Implemented tokens

Tokens live in `apps/web/app/global.css` and are semantic rather than component-specific.

### Color

Light and dark themes define `--color-background`, `--color-surface`, `--color-surface-raised`,
`--color-surface-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`,
`--color-border`, `--color-primary`, `--color-primary-soft`, `--color-accent`, and success, warning,
danger and information pairs. Measurement states are reserved as `simulated`, `theoretical`,
`user-entered` and `measured`; no measurement values are rendered in Phase 02.

The light theme uses a deep teal primary and darkened muted/ochre tokens that pass the automated axe
contrast scan at the WCAG AA target. Dark theme buttons use dark text on the lighter teal primary so
the same semantic hierarchy remains readable.

### Typography

- Display and headings: system UI sans stack with tight editorial tracking.
- Body and supporting text: system UI sans stack for broad character coverage and no remote font cost.
- Numerical and future scientific values: system monospace stack through `--font-mono`.
- Equations: overflow-safe monospace blocks with readable explanatory text beside them.

### Space and layout

The scale is `0.25rem` through `5rem`. The primary content container is capped at `75rem`; desktop
navigation is replaced by a keyboard-operable mobile menu below `56rem`. Experiment details use a
sticky section index on wide screens and a horizontal scroller on small screens.

### Motion and layering

Motion is limited to the mobile navigation transition. `prefers-reduced-motion: reduce` disables
transitions and smooth scrolling. The header, mobile navigation and future overlays use a small,
documented z-index range rather than arbitrary stacking values.

## Component foundations in use

- Buttons and links: primary, secondary and text-link actions.
- Inputs: labeled search, select filters and radio theme choices.
- Feedback: empty state, loading state, error state, demonstration badge and future-boundary panel.
- Navigation: responsive header, skip link, mobile menu, footer and experiment section index.
- Learning: page intro, section heading, objective list, theory boundary and reference boundary.
- Lab boundary: future workspace panel, safety panel, empty measurement area and accessible table.
- Data: tables use explicit headers and captions; important values will be text-first.

## Component rules

- Every control has a visible or programmatic label.
- Disabled state explains why an action is unavailable where needed.
- Numeric controls validate ranges and units.
- Color is never the only indicator of status.
- Focus indicators must remain visible.
- Components must have documented responsive behavior.

## Implementation note

Components are intentionally colocated in `apps/web/components` because they have real Phase 02
consumers. `ui.tsx` contains small presentational building blocks, while `explore-view.tsx`,
`settings-view.tsx` and the theme provider own their actual interactions. Scientific domain logic and
experiment schema remain outside presentation components.
