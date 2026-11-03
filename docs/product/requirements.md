# Product Requirements

## Product scope
A curriculum-aware library of chemistry learning modules and interactive virtual experiments, delivered through a responsive web application first, with mobile applications planned.

## Functional requirements
### Discovery
- Browse by discipline, level, topic, curriculum and experiment type.
- Search experiments by name, concept, equipment and learning objective.
- Display review status, difficulty, estimated duration and prerequisites.

### Experiment learning page
- Show objective, theory, equations, equipment, procedure and safety notes.
- Identify required knowledge and expected learning outcomes.
- Link references and show content/model version.

### Simulation
- Provide controls only for variables supported by the scientific model.
- Show units and valid ranges.
- Update outcomes predictably and explain important changes.
- Provide reset, pause/step where applicable, and accessible alternatives to drag-only interactions.
- Clearly identify assumptions and limitations.

### Practical notebook
- Record observations, calculations and conclusions.
- Label values as simulated, theoretical, manually entered or measured.
- Allow export only after data integrity and privacy requirements are defined.

### Learning and assessment
- Include concept checks and reflection questions.
- Give explanations for answers, not only scores.
- Track progress only when privacy and persistence are implemented.

## Non-functional requirements
- Responsive layout and keyboard accessibility.
- Reasonable performance on mid-range devices.
- Clear error and empty states.
- Secure handling of user input and imported content.
- Testable scientific logic independent of rendering.
- Localization-ready content and formatting.
- Offline support is a later explicit milestone, not an assumed Phase 01 feature.

## Content quality requirements
Each published experiment must have a content owner, references, review status, target audience, safety classification, version, model assumptions and limitations.

## MVP boundary
The first learning MVP should contain a small, high-quality set (approximately 8–12) of reviewed experiments. Candidate topics include solution preparation/dilution, acid-base titration, pH, paper chromatography and molecular structure. Final selection requires curriculum and safety review.

## Open questions
- Which school boards and university syllabi should be prioritized?
- Which languages are required for the first release?
- Which experiments have qualified reviewers available?
- What minimum device/browser support is realistic?
