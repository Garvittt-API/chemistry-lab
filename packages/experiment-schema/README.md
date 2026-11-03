# Experiment Schema

`@virtual-chemistry-lab/experiment-schema` contains the versioned Zod contract for educational
experiment metadata. It describes content, safety, provenance and review status; it does not execute
code or define a chemistry simulation model.

## Usage

Parse imported or user-provided metadata at the trust boundary:

```ts
import { experimentMetadataSchema } from "@virtual-chemistry-lab/experiment-schema";

const result = experimentMetadataSchema.safeParse(untrustedValue);
if (!result.success) {
  // Show a safe validation error and do not render the content as trusted data.
}
```

The exported `ExperimentMetadata` type is inferred from the same schema. Experiment IDs use
lowercase kebab-case and must be unique within the content collection that owns them. The schema
version is currently `1.0.0`; `contentVersion` is an independent semantic version for the meaning of
one experiment document.

## Contract areas

- Identity and versions: `id`, `schemaVersion`, `contentVersion`.
- Learning metadata: title, description, discipline, level, objectives, prerequisites, difficulty
  and duration.
- Educational content: theory/equations, equipment, materials and ordered procedure steps.
- Safety: precautions, PPE, disposal guidance and optional emergency notes.
- Provenance: references, author information and review status.

## Extension strategy

1. Add optional, backward-compatible metadata fields within the current schema version when the field
   does not change the meaning of existing content.
2. Add required fields, change validation semantics, rename fields or alter interpretation only in a
   new schema version.
3. Keep `contentVersion` changes independent: increment it when an individual document's meaning,
   procedure, safety information or references change.
4. Update valid/invalid schema tests and this guide with every contract change.
5. Never add executable scripts, arbitrary component names, HTML, or renderer-specific state to this
   metadata contract. Simulation inputs and outputs require a separately reviewed domain contract.
