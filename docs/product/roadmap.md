# Product Roadmap

This is a sequence of gated phases, not a promise of calendar dates. Each phase must be accepted before the next begins.

| Phase | Outcome | Exit gate |
|---|---|---|
| 01 Foundation | Requirements, architecture, repo, tooling, CI and docs | Clean install/build/checks; decisions reviewed |
| 02 Design + web shell | Accessible design system and responsive web foundation | Design/accessibility review and E2E smoke tests |
| 03 Experiment library | Versioned content schema, discovery and editorial workflow | Valid content pipeline and reviewed sample content |
| 04 Simulation core | Independent scientific models and validation harness | Reference cases pass; assumptions documented |
| 05 2D experiments | Complete interactive learning flows | End-to-end experiments reviewed and tested |
| 06 3D visualization | Focused 3D molecular/lab experiences | Pedagogical value, correctness and performance verified |
| 07 Learning tools | Notebook, calculations, reports and assessments | Data labels, export and accessibility verified |
| 08 Accounts/progress | Optional identity and progress | Privacy, security and retention approved |
| 09 Mobile | Android/iOS application | Device testing and platform UX review |
| 10 Offline/sync | Offline content and safe synchronization | Conflict, privacy and recovery tests pass |
| 11 Quality assurance | Independent scientific, security and accessibility review | Critical findings resolved |
| 12 Launch | Production deployment and open-source release | Licensing, operations, docs and support ready |

## Phase gate
A phase is complete only when:
- Scope and acceptance criteria are met.
- Relevant automated and manual tests pass.
- Known limitations and failures are recorded.
- Documentation and project state are updated.
- Security, accessibility and scientific risks are reviewed.
- The project owner explicitly accepts the phase.

## Scope discipline
Do not add accounts, databases, AI tutoring, cloud sync, payments or elaborate 3D infrastructure merely because they may be useful later. Add them only when a validated requirement justifies the complexity.
