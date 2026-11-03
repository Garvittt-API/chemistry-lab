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

## Verification
Combine automated checks with keyboard-only testing, screen-reader testing and manual review by users with disabilities where possible. Automated scans alone do not prove accessibility.
