# Changelog

All notable changes to this project are recorded here. Follow Keep a Changelog conventions where practical.

## [Unreleased]
### Phase 02 — Design system and web foundation
- Added a scientific editorial visual system with semantic light/dark tokens, responsive layouts and reduced-motion support.
- Added responsive navigation, theme settings, home, experiment discovery, subject discovery, experiment detail, About, Help and My Lab foundations.
- Added explicitly labelled demonstration content and a future laboratory integration boundary without simulated results.
- Added axe-core accessibility scans, keyboard/menu coverage, filtering/detail-route tests and consistent Lucide icons.

### Added
- Initial product, architecture, design, science, security and development documentation pack.
- TypeScript pnpm/Turbo workspace with pinned Node.js and package-manager versions.
- Minimal Next.js App Router web application and Expo mobile application.
- Versioned Zod experiment metadata schema with valid and invalid unit tests.
- Strict TypeScript, ESLint, Prettier, Vitest, CI workflow, Dependabot configuration and environment conventions.

### Fixed
- Added repository line-ending attributes so clean Windows clones pass the formatting gate.

### Not yet implemented
- Chemistry simulation engine.
- Experiment content library.
- Authentication, persistence, synchronization or deployment.
- Web E2E learner journeys and native device builds.
