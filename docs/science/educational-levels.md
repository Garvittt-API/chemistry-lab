# Educational Levels

Status: implemented in `packages/experiment-library/src/content/educational-levels.json`,
validated by `educationalLevelSchema` in
`packages/experiment-schema/src/educational-levels.ts`.

## Purpose

A single vocabulary of learner levels, used consistently by experiments,
curriculum mappings and product surfaces (CBSE Class XI/XII maps onto
`higher-secondary`, for example). Levels are stable identifiers with display
labels and reading descriptions.

## The six levels

| id | label | intended audience |
| --- | --- | --- |
| `beginner` | Beginner | Learners meeting the topic for the first time; no assumed laboratory experience. |
| `school` | School | Middle/early secondary (roughly classes VI–X in the Indian system). |
| `higher-secondary` | Higher Secondary | Senior secondary (classes XI–XII; the CBSE Chemistry core audience). |
| `undergraduate` | Undergraduate | First university degree courses. |
| `postgraduate` | Postgraduate | Advanced coursework and project work. |
| `advanced-research` | Advanced / Research | Research-level discussion and specialist content. |

## Rules

- An experiment lists one or more `educationalLevels`; the list is the set of
  audiences the content is *written for*, not a claim about who may read it.
- Curriculum mappings carry their own `academicLevel` (the level of the mapped
  syllabus item), which must be one of these six identifiers.
- Difficulty (`introductory` / `intermediate` / `advanced`) is a separate axis
  on each experiment: level says *who*, difficulty says *how demanding*.
- New levels require a schema-compatible registry entry; identifiers are never
  reused for different meanings.
