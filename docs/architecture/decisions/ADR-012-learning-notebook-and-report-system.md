# ADR-012: Framework-independent learning, practical notebook, and deterministic report export system

- Status: Implemented; owner and qualified scientific review pending
- Date: 2026-11-07

## Context
Phase 07 introduces structured learning pathways, theory lessons, a chemistry glossary, deterministic self-check assessments, a practical laboratory notebook, structured practical report generation, and multi-format report/data exports (PDF, HTML, CSV, JSON) alongside local progress tracking.

These capabilities must preserve the platform's core invariants:
1. Scientific calculations and chemical equation checks must execute through `@virtual-chemistry-lab/simulation-core` rather than duplicating formulas in UI components or inventing AI-graded responses.
2. Every recorded observation, table row, and calculation must carry explicit provenance (`user_entered`, `simulation_generated`, `engine_calculated`, `reference_expected`, `imported_external`) and never masquerade as physical laboratory instrument data.
3. No accounts, authentication, backend database, or cloud synchronization may be introduced before Phase 08/10 privacy and security gates are approved.
4. Adding heavyweight third-party client PDF/HTML rendering dependencies increases supply-chain surface area and bundle weight unnecessarily when deterministic structured scientific documents are needed.

## Decision
Create `@virtual-chemistry-lab/learning-core` as a pure, framework-free TypeScript package validated with Zod `4.6.7` and tested with Vitest:
- **Learning & assessment domain:** Author versioned learning pathways (4), lessons (10), glossary entries (30), and assessments (9) cross-linked to the published `@virtual-chemistry-lab/experiment-library` catalog (`cbse-chemistry-2025-26`) and `@virtual-chemistry-lab/simulation-core`. Strip answer keys and explanations via `toLearnerQuestions()` prior to submission, and grade numerical units, chemical formulas, and balanced equations deterministically via `simulation-core`.
- **Calculation workbench adapters:** Provide 8 pure adapters (`molar_mass`, `moles_and_mass`, `molarity`, `dilution`, `reaction_balancing`, `stoichiometry_limiting_reagent`, `percent_yield`, `acid_base_ph`) wrapping `simulation-core` with step-by-step derivations, model IDs/versions, assumptions, and precision conventions.
- **Practical notebook & local persistence:** Persist versioned `LearningStoreSnapshot` (`schemaVersion: "1.0.0"`) locally via a pluggable `StorageAdapter` (`localStorage` on web under `vcl-learning-store-v1`, `MemoryStorageAdapter` in tests/SSR). Include a non-destructive migration helper (`migratePhase05SessionToNotebookSession`) from Phase 05 `ExperimentSession` records and quarantine malformed storage payloads under `vcl-learning-store-corrupted-backup` rather than crashing or silently fabricating state.
- **Deterministic report builder & zero-dependency exporters:** Assemble structured 20-section practical reports (`buildPracticalReport`) with mandatory non-removable `title` and `simulation_disclosure` sections and completeness diagnostics for missing user sections. Export reports and data via pure deterministic serializers in `learning-core`:
  - Standards-compliant multi-page PDF 1.4 (`exportReportPdf` + `verifyGeneratedPdf`) using built-in Type1 Helvetica fonts, WinAnsi transliteration for chemical symbols, wrapped tables, provenance tags, and byte-accurate cross-reference (`xref`) tables.
  - Self-contained print-ready HTML (`exportReportHtml`) with strict HTML entity escaping (`escapeHtml`) and inline SVG XY plots.
  - RFC 4180 CSV (`exportSessionCsv`) with spreadsheet formula-injection neutralization (`neutralizeSpreadsheetFormula` for leading `=`, `+`, `-`, `@`, tab, CR/LF).
  - Bounded, prototype-pollution-guarded, Zod-validated JSON session export/import (`exportSessionJson`, `importSessionJson`, 2 MB cap) that marks externally imported entries as `imported_external` unless already `reference_expected`.

Web routes (`/learn/*`, `/notebook/*`, `/my-lab`) and `LearningStoreProvider` live in `apps/web` as thin presentation and browser-download adapters.

## Alternatives
- **Third-party client PDF/HTML-to-canvas libraries (`jspdf`, `pdfkit`, `html2canvas`):** Rejected; adds transitive supply-chain surface, font/canvas quirks, and rasterized text instead of deterministic, verifiable, searchable PDF 1.4 output testable in pure Node/Vitest.
- **LLM/adaptive grading or auto-generated report conclusions:** Rejected; violates Phase 07 scope and scientific integrity rules against fabricated learner conclusions or unreviewed AI tutoring.
- **Backend database / cloud sync now:** Rejected per ADR-005; deferred to Phases 08 and 10 pending privacy and threat-model approval.

## Consequences
All learning, calculation, assessment, notebook, progress, and export logic is portable to Expo mobile in Phase 09 without rewriting domain rules. Local browser data remains device-bound unless explicitly exported/imported as JSON by the learner, and all authored lessons/glossary/assessments carry explicit `pending_scientific_review` status until reviewed by a qualified chemistry educator.
