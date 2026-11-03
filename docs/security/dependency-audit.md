# Phase 01 Dependency Audit

CI runs `pnpm audit --audit-level=high`, which passed in the Phase 01 environment with no high or
critical advisories.

The 2026-11-03 audit also reported two moderate transitive advisories in the Expo/React Native
toolchain (`glob` and `minimatch`). They are not direct application dependencies and are used by
development/configuration tooling. They remain visible in the audit output and should be revisited
when the Expo SDK is upgraded; forcing incompatible transitive major versions would be less safe than
retaining the vendor-supported dependency graph at this scaffold stage.

No credentials, API keys, personal data, or local environment files are committed. The lockfile is
checked in, `.env.example` contains only a non-secret public development setting, and CI uses
read-only repository permissions.
