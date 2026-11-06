# Chemistry Taxonomy

Status: implemented in `packages/experiment-library/src/content/taxonomy.json`
(registry version 1.0.0), validated by `taxonomyRegistrySchema` in
`packages/experiment-schema/src/taxonomy.ts`.

## Purpose

The taxonomy gives every experiment a stable, machine-checkable place in the
subject structure of chemistry: a primary **discipline**, one or more
**subdiscipline** memberships, and one or more **topics**. It is designed for
extensibility: new topics and subdisciplines can be added without invalidating
existing experiment records, because records reference identifiers, not
positions.

## Design

- **Discipline** — the top level: 15 branches of chemistry, from `general-chemistry` to `forensic-chemistry`. Each discipline carries a description, optional related disciplines, and the educational levels it commonly serves.
- **Subdiscipline** — a named area within a discipline (for example `analytical-chemistry-separation-science`). Subdisciplines reference the discipline's topics by identifier.
- **Topic** — the finest unit (`solutions-and-concentration`, `volumetric-analysis`, …). Topics are registered **inside a discipline**, and topic identifiers are unique within a discipline.

Deliberate choices:

1. **No static `experimentIds` in the taxonomy.** Discipline-to-experiment
   references are *derived* at query time (the library's query API computes
   them from experiment records). This avoids stale lists when content is added
   or reclassified, and keeps the taxonomy free of content-bookkeeping.
2. **`parentDisciplineId` is reserved, not used.** The initial registry keeps
   all 15 disciplines top-level and expresses connections through
   `relatedDisciplineIds` (for example physical and analytical chemistry share
   `spectroscopy-and-structure` topics). No hierarchy is claimed until
   subject-matter experts agree on one.
3. **Cross-cutting topics may be registered under more than one discipline.**
   Topic identifiers are unique *per discipline* by design. A concept such as
   `acids-and-bases` legitimately belongs to both the general-chemistry
   vocabulary (where `ph-and-indicators` sits) and the analytical-chemistry
   vocabulary (where `acid-base-titration` sits); the registry repeats the topic
   under each discipline that uses it, and every experiment's topic list must
   resolve inside its own primary discipline's vocabulary (enforced by
   `buildCatalog`).
4. **Labels are display strings; identifiers are forever.** Experiments
   reference `disciplineId`/`topicIds`; renaming a label never breaks content.

## The 15 disciplines

| id | label | initial experiments |
| --- | --- | --- |
| `general-chemistry` | General Chemistry | standard solution preparation, dilution, pH & indicators, VSEPR |
| `organic-chemistry` | Organic Chemistry | — (planned) |
| `inorganic-chemistry` | Inorganic Chemistry | flame tests |
| `physical-chemistry` | Physical Chemistry | reaction rates, FeSCN equilibrium, spectroscopy (draft) |
| `analytical-chemistry` | Analytical Chemistry | acid–base titration, paper chromatography |
| `environmental-chemistry` | Environmental Chemistry | — (planned) |
| `biochemistry` | Biochemistry | — (planned) |
| `industrial-chemistry` | Industrial Chemistry | — (planned) |
| `materials-chemistry` | Materials Chemistry | — (planned) |
| `electrochemistry` | Electrochemistry | Daniell cell |
| `nuclear-chemistry` | Nuclear Chemistry | — (planned) |
| `polymer-chemistry` | Polymer Chemistry | — (planned) |
| `medicinal-chemistry` | Medicinal Chemistry | — (planned) |
| `computational-chemistry` | Computational Chemistry | — (planned) |
| `forensic-chemistry` | Forensic Chemistry | — (planned) |

Disciplines with zero experiments are kept visible on purpose: the taxonomy
describes the *subject*, and empty branches show the planned scope and where
contributions are welcome. They are never presented as containing content.

## Evolution rules

- New discipline: add a full entry with `introducedInTaxonomyVersion` set to the
  registry version that introduces it.
- New topic/subdiscipline: add within its discipline; never repurpose an
  existing identifier for a different meaning.
- Removed topics: never reuse their identifiers; mark deprecated in the
  registry notes instead of deleting history.
- Experiment records validate their classification against the registry at
  catalog build time (`buildCatalog` fails on unknown identifiers), so content
  and taxonomy cannot drift silently.
