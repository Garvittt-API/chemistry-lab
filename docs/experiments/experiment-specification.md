# Experiment Content Specification

This is a conceptual contract. The actual machine-readable schema must be implemented and versioned in `packages/experiment-schema`.

## Required fields
- Stable experiment ID.
- Schema version and content version.
- Title, summary and discipline.
- Target learner level and curriculum tags.
- Learning objectives and prerequisites.
- Estimated duration and difficulty.
- Theory and equations with symbol definitions.
- Equipment list.
- Chemicals/materials and safety information.
- Procedure steps.
- Simulation model identifier/version.
- Inputs with types, units, valid ranges and defaults.
- Outputs with types, units and display precision.
- Observations and expected/reference cases.
- Model assumptions and limitations.
- References and asset provenance.
- Author, reviewer, review date and review status.

## Content rules
- No fabricated references or results.
- No hidden executable scripts in content files.
- No unsafe operational detail beyond approved educational scope.
- Avoid ambiguous quantities and unspecified units.
- Separate the pedagogical procedure from the simulation controls.
- Label expected results as theoretical/reference/simulated as appropriate.

## Versioning
A content change that affects meaning, procedure, safety, equations or model configuration requires a new content version. Schema version changes only when the contract changes. Keep old notebook records interpretable.
