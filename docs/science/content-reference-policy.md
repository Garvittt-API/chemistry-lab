# Content Reference Policy

Status: policy in force for all content authored since 2026-11-05; the
verification vocabulary lives in `referenceSchema`
(`packages/experiment-schema/src/references.ts`).

## Non-negotiable rules

1. **Never invent citations, DOIs, URLs, PubChem CIDs, ISBNs or page numbers.**
   A reference that cannot be traced to a real source must not exist in a
   record; where a source is needed but not yet verified, the record says so.
2. **Every scientific claim lists `sourceRefIds`; every reference lists
   `supportsClaims`.** A reference that supports no claim in the record is
   either removed or explicitly marked as background ("supports no specific
   claims").
3. **Cross-checked or not, say which.** Each reference carries a
   `verificationStatus`; the UI displays it.

## Verification vocabulary

| status | meaning | how it is earned |
| --- | --- | --- |
| `cross_checked_2026_11_05` | The exact official URL/identifier was verified during the 2026-11-05 content pass. | Either the page/PDF was fetched directly and matched the cited content, **or** at least two independent sources cite the exact official URL for the claimed content (corroboration). The reference `notes` say which method was used. |
| `standard_bibliographic_entry` | An established bibliographic entry (e.g. a textbook chapter) whose *existence* is common knowledge but which was not re-checked in this pass. | Default for name-based citations where no verified URL is available (e.g. PubChem entries whose exact CID could not be confirmed). |
| `requires_review` | The entry is a placeholder or the author could not verify it. | Used explicitly, never silently. |
| `retracted_or_disputed` | Known to be retracted or disputed. | — |

The date suffix in `cross_checked_2026_11_05` is the verification batch
identifier. Future batches add their own dated status values via the schema.

## Source hierarchy (preferred order)

1. **Official educational resources** — NCERT textbooks (direct chapter PDFs
   such as `https://ncert.nic.in/textbook/pdf/kech101.pdf`, or book-index pages
   such as `https://ncert.nic.in/textbook.php?kech1=0` with the chapter named in
   the citation text).
2. **Authoritative databases** — PubChem compound entries for hazard evidence,
   cited as `https://pubchem.ncbi.nlm.nih.gov/compound/<CID>` **only** with a
   verified CID (NaOH 14798, HCl 313, KMnO₄ 516875, Na₂S₂O₃ 24477, CuSO₄
   24462, KSCN 516872 as of the 2026-11-05 batch). Unverified substances use a
   name-based entry with the database root URL and
   `verificationStatus: standard_bibliographic_entry`.
3. **Official curriculum documents** — CBSE curriculum circulars from
   `cbseacademic.nic.in` (see `curriculum-mapping.md`).
4. **Institutional safety data sheets** — for hazard detail beyond database
   GHS statements; marked `requires_review` until the specific institution's
   SDS is attached.

## What references may and may not support

- Hazard claims must point at hazard evidence (official database or SDS), not
  at textbooks.
- Curriculum mapping evidence points at curriculum documents only.
- Worked examples cite the source of their *method and constants*; their
  arithmetic is ours and is marked illustrative (`isIllustrative: true`) unless
  derived from recorded measurements.

## Reporting errors

Any user can report a wrong citation through the repository issue tracker (see
`docs/contributing/experiment-submission.md`). Confirmed citation defects are
content corrections: they bump the record's `contentVersion` and appear in its
`revisionHistory`.
