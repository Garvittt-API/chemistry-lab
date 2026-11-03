# Accessibility Requirements

Target WCAG 2.2 AA as the design and testing goal; verify applicable requirements against the actual product and jurisdiction.

## Baseline
- Full keyboard operation and visible focus.
- Semantic headings, landmarks, labels and control names.
- Sufficient text and non-text contrast.
- Screen-reader announcements for important dynamic readings and validation errors.
- No color-only, sound-only or motion-only information.
- Reduced-motion support.
- Text alternatives or tabular equivalents for important diagrams and plots.
- Zoom/reflow support on small screens.
- Touch targets sized for practical use.
- Captions/transcripts for instructional media.
- Accessible equations, with readable text explanations and copyable notation.

## Simulation-specific
- Sliders must have keyboard-operable alternatives and exact numeric entry where appropriate.
- Dragging apparatus must have a non-drag alternative.
- Readings must be exposed as text, not only drawn on a canvas.
- Do not announce every animation frame to assistive technology; announce meaningful state changes.
- Provide a pause or reduced-motion mode for animated processes.

## Phase 02 implementation

- Semantic landmarks include a skip link, header navigation, main content and footer.
- All navigation, search, filters, theme controls and the responsive menu have accessible names.
- Focus indicators use a visible three-pixel outline with offset.
- The responsive menu exposes `aria-expanded` and `aria-controls`.
- Important status text uses readable text and `aria-live` for result counts.
- Demonstration content, planned features and absent readings are explicitly labelled.
- Equations and future measurements are structured for readable text; no canvas-only value exists.
- Reduced motion is supported through the global media query.
- Light and dark theme contrast is checked by axe-core in Playwright.

## Verification

The current automated suite uses `@axe-core/playwright` against the home page in both themes and the
Explore, Subjects, About and Settings routes. Playwright also verifies the skip link, mobile menu,
experiment filtering and future workspace boundary. Manual keyboard and screen-reader review remains
required before a release; automated scans alone do not prove accessibility.
