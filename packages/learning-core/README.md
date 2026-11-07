# `@virtual-chemistry-lab/learning-core`

Framework-free learning, practical notebook, assessment, progress-tracking and report-generation domain package for Virtual Chemistry Lab.

## Responsibilities

- Versioned Zod schemas (`1.0.0`) for learning pathways, lessons, glossary entries, assessments, notebook sessions, observations, experimental data tables, calculation records, learner progress and practical reports.
- Curated, reference-sourced learning pathways, lessons, glossary entries and assessments integrated with `@virtual-chemistry-lab/experiment-library`.
- Calculation workbench adapters delegating exclusively to `@virtual-chemistry-lab/simulation-core`.
- Deterministic assessment scoring with numerical tolerance/unit checks and chemical equation conservation verification.
- Practical notebook session lifecycle, local key-value repository abstraction and Phase 05 session migration.
- Integrity-enforced practical report builder plus standards-compliant PDF 1.4, print-friendly HTML, CSV and JSON exporters.
