# Threat Model

## Assets
- Source code and release integrity.
- Experiment content and scientific provenance.
- User notebook entries and account data if accounts are later added.
- Secrets, signing keys and CI credentials.
- Availability and integrity of the learning service.

## Likely threats
- Malicious or malformed imported experiment content.
- Cross-site scripting through user or contributed content.
- Dependency or supply-chain compromise.
- Secret leakage in source, logs or build artifacts.
- Unauthorized access to future user records.
- Abuse of future APIs or file upload endpoints.
- Unsafe rendering of formulas, Markdown, SVG or HTML.
- Data loss or corruption during future offline synchronization.

## Mitigations
- Schema validation and safe parsing at boundaries.
- Render untrusted content as text or through a vetted sanitizer.
- No arbitrary executable code in experiment definitions.
- Lockfiles, dependency review and automated advisory scanning.
- Least-privilege CI permissions and short-lived credentials where possible.
- No secrets in client bundles.
- Minimize personal data; define retention and deletion before accounts launch.
- Authorization checks on every future server-side resource.
- Backups and recovery tests before persistent cloud data is introduced.

## Out of scope for Phase 01–07
No authentication, payment, public user uploads, multi-tenant API or cloud synchronization should be introduced without a new threat-model review.

## Phase 07 untrusted-input and export mitigations
- **JSON session import (`importSessionJson`):** Rejects payloads exceeding 2 MB, recursively strips `__proto__` / `constructor` / `prototype` keys prior to schema validation, validates through bounded Zod schemas, strips ASCII control characters, and marks imported records as `imported_external`.
- **HTML practical report export (`exportReportHtml`):** Escapes `&`, `<`, `>`, `"`, and `'` across all user-entered titles, observations, table cells, and notes (`escapeHtml`); never injects raw user HTML.
- **CSV dataset export (`exportSessionCsv`):** Applies RFC 4180 quoting and prefixes cells starting with `=`, `+`, `-`, `@`, tab, or CR/LF with a leading apostrophe (`'`) so spreadsheet applications do not execute formula payloads.
- **PDF 1.4 export (`exportReportPdf`):** Escapes `\`, `(`, `)` and transliterates non-WinAnsi characters safely inside content streams without external font or script embedding.
