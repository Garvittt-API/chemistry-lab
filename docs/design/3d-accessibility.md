# 3D accessibility and alternatives

Every molecule has four ways to access the same declared structure: interactive 3D, orthographic SVG, keyboard-accessible atom/bond lists and a full text description. Selected atom/bond details use an `aria-live` inspector. Source, assumptions, limitations and geometry values are HTML, not canvas-only labels.

The scene is focusable and documents its controls. Left/right arrows rotate, plus/minus zoom and Home resets; equivalent named buttons are available. OrbitControls supplies pointer rotate, zoom and pan. Equipment can also be selected, moved and rotated using HTML buttons. Focus outlines and selection use color plus inspector/state changes.

High-contrast element colors are optional. Atom labels can be toggled without losing list labels. Reduced-motion mode disables damping and does not autorotate; CSS disables the loading spinner animation. No important scientific fact depends on motion, depth perception, color alone or canvas interaction.

Automated axe tests are included in `apps/web/e2e/visualization.spec.ts` but could not execute locally because Playwright's browser CDN is blocked. Screen-reader testing with NVDA/JAWS/VoiceOver and human keyboard review remain **NEEDS HUMAN REVIEW**. Native mobile accessibility is **NOT IMPLEMENTED**.
