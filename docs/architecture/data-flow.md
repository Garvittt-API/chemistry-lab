# Data Flow and Trust Boundaries

## Experiment execution

The execution flow below describes the future content-to-simulation boundary. Phase 01 implements
only the content validation boundary and does not execute a chemistry model.
1. App requests a versioned experiment definition.
2. Schema validator checks structure, required fields and supported schema version.
3. UI renders explanatory content and supported controls.
4. User input is parsed with explicit units and validated against model constraints.
5. Pure simulation function receives typed input and documented conditions.
6. Model returns typed outputs plus warnings/metadata where relevant.
7. Output validation checks finite values, units and model invariants.
8. UI presents readings, chart/visualization and explanation.
9. Notebook stores observations with provenance labels and experiment/model versions.

## Phase 01 implementation

Imported metadata is parsed with `experimentMetadataSchema.safeParse`. The schema accepts structured
content and review provenance, rejects unsupported schema versions and malformed fields, and contains
no executable content fields. The web and mobile scaffolds consume the schema version constant; no
simulation output or notebook record is produced yet.

## Phase 02 presentation flow

App Router pages consume typed, explicitly labelled demonstration content from `apps/web/lib`.
Search and filter state remains local to the Explore view. Theme preference is local browser display
state only and never crosses the content or domain boundary. Detail pages render content sections and
future integration boundaries without constructing a model, measurement or notebook record.

## Trust boundaries
- User-entered values are untrusted.
- Imported experiment files are untrusted.
- Third-party assets and remote content are untrusted until reviewed.
- Browser/mobile storage can be modified by the user.
- Future API requests require authentication, authorization, rate limits and validation.

## Provenance labels
Every recorded value should be distinguishable as:
- `simulated` (`simulation_generated` in `@virtual-chemistry-lab/learning-core`)
- `theoretical` / engine-derived (`engine_calculated` or `reference_expected`)
- `user-entered` (`user_entered`)
- `imported_external` (for externally imported JSON session files)
- `measured` (only when actually measured using a real physical device or instrument — never emitted by the virtual lab)

Do not call a simulated value an experimental measurement. Practical reports built in Phase 07 (`buildPracticalReport`) enforce non-removable `title` and `simulation_disclosure` sections and explicitly flag blank or incomplete sections rather than fabricating numbers or conclusions.

## Phase 07 local persistence, import and export boundaries
- **Local storage (`vcl-learning-store-v1`):** Treated as untrusted input on read; validated through `learningStoreSnapshotSchema.safeParse`. Malformed or tampered payloads are quarantined to `vcl-learning-store-corrupted-backup` and replaced with a clean empty snapshot while surfacing a recovery warning.
- **External JSON session import (`importSessionJson`):** Enforces a 2 MB payload limit, strips prototype-pollution keys (`__proto__`, `constructor`, `prototype`), validates against `sessionExportBundleSchema`, assigns a fresh local `sessionId` on collision, and re-tags non-reference provenance entries as `imported_external`.
- **Report & data exports (`exportReportPdf`, `exportReportHtml`, `exportSessionCsv`, `exportSessionJson`):** Escape all untrusted strings for their target format (PDF 1.4 literal string escaping + WinAnsi transliteration, HTML entity escaping, RFC 4180 CSV quoting + spreadsheet formula-injection neutralization).

## Versioning
Persist experiment content version, schema version, simulation model version and relevant model conditions with a result. If a model changes, old notebook records must remain interpretable.
