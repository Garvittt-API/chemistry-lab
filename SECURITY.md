# Security Policy

## Scope
This policy covers the project repository, applications, APIs (if introduced), build/release pipeline and official distribution artifacts.

## Reporting a vulnerability
Do not publish exploitable vulnerability details in a public issue. Use GitHub's private vulnerability reporting feature if enabled, or the private security contact published by maintainers.

Include:
- A concise description and impact.
- Affected version/commit and environment.
- Reproduction steps or proof of concept.
- Suggested mitigation, if known.

Do not include real student data, credentials or unrelated personal information.

## Response expectations
Maintainers should acknowledge reports promptly, assess severity, coordinate a fix and disclosure timeline, and publish an advisory when appropriate. Do not promise a fixed response SLA until the project has operational capacity.

## Security baseline
- Keep dependencies updated and review advisories.
- Use lockfiles and reproducible installs.
- Never commit secrets; use environment variables and secret stores.
- Apply least privilege to CI tokens and integrations.
- Validate all imported experiment/content data.
- Avoid unsafe HTML rendering and arbitrary code execution.
- Use HTTPS for production services.
- Minimize collection and retention of personal data.
- Perform threat modeling before accounts, sync, uploads or APIs are introduced.

## Phase 01 implementation notes

- CI runs a high/critical dependency audit and uses read-only repository permissions.
- The lockfile is committed and dependency updates are monitored through Dependabot.
- The current scaffold has two known moderate transitive advisories in the Expo/React Native toolchain;
  see `docs/security/dependency-audit.md`.
