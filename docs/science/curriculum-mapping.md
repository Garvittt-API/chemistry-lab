# Curriculum Mapping (CBSE-first)

Status: implemented in `packages/experiment-library/src/content/curricula.json`
(registry `cbse-chemistry-2025-26`), validated by `curriculumSchema` in
`packages/experiment-schema/src/curriculum.ts`. Every experiment-to-curriculum
link in the current collection is `proposed_pending_verification`.

## Purpose

Learners and educators need to see where an experiment fits in a syllabus. A
curriculum mapping says: *this experiment supports the topic X of curriculum Y
for academic level Z*. It does **not** say the curriculum board endorses,
requires, or has reviewed this content.

## The CBSE registry

`cbse-chemistry-2025-26` describes the CBSE Chemistry course for classes
XI–XII as published by the Central Board of Secondary Education in the
curriculum circular for the 2025-26 academic session
([Circular Acad-14/2025](https://cbseacademic.nic.in/web_material/Circulars/2025/14_Circular_2025.pdf),
verified 2026-11-05). The registry carries:

- `source` — the official document identity (title, publisher, published date,
  URL, verification status and date).
- `topics` — named curriculum topics as *we* label them for mapping
  (`cbse-12-electrochemistry`, `cbse-practical-volumetric-analysis`, …), each
  with a note that the wording is our labelling, not a quoted syllabus code.
  CBSE does not publish rigid topic codes; inventing codes would be a
  fabrication, so topic entries carry descriptions instead.

## Confidence vocabulary

| confidence | meaning |
| --- | --- |
| `proposed_pending_verification` | An informed proposal based on the published curriculum document read at source-list level. **Every mapping in the current collection has this status.** |
| `verified_against_official_document` | A qualified reviewer has opened the official subject PDF/syllabus and confirmed the specific unit/practical wording. Requires evidence; only a reviewer may set it. |

A mapping with `confidence: "proposed_pending_verification"` must carry a
`syllabusNote` explaining the intended connection and `evidenceRefIds` pointing
at the reference entries that support the *existence and scope* of the
curriculum (never at invented syllabus quotations). Both rules are enforced by
`curriculumMappingSchema` super-refinement.

## Honest limits recorded during the 2026-11-05 content pass

- NCERT chapter PDFs verified live: Class XI Unit 1 (`kech101.pdf`), Class XI
  Unit 4 Chemical Bonding (`kech104.pdf`, corroborated), Class XII Unit 3
  Chemical Kinetics (`lech103.pdf`). Other chapter-level NCERT citations in the
  collection use book-index pages plus chapter names and are marked
  accordingly in their reference notes.
- Curriculum topic labels such as "Volumetric analysis" paraphrase the
  practical-list language of the circular; the exact practical wording for each
  class must be re-checked against the subject PDFs before any mapping is
  upgraded. Until then the interface always shows "Proposed — pending
  verification" next to every mapping.

## Evolution

New curricula (state boards, other countries) are new registry entries with
their own `source` verification; experiments gain additional mapping entries.
No experiment may claim a mapping without both a registry entry and the
confidence rules above.
