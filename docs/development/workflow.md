# Development Workflow

## Branches
- `main`: protected, releasable branch.
- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `chore/<short-name>`

## Commits
Use clear conventional-style messages, for example:
- `feat(web): add responsive application shell`
- `feat(schema): define experiment metadata contract`
- `test(core): add dilution reference cases`
- `docs(science): clarify concentration conventions`

## Pull requests
- Keep PRs focused and reasonably small.
- Explain why the change is needed.
- List tests actually run and their results.
- Include screenshots for UI changes where useful.
- Link issues/tasks and update project state.
- Do not merge with failing required checks.

## Solo development
Use PRs even as a solo developer when practical. Self-review the diff, test the clean checkout and avoid pushing directly to `main`.

## Phase 01 local verification

Use the pinned package manager through Corepack and run the same gates used by CI:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build:web
corepack pnpm validate:mobile
corepack pnpm security:audit
```

Do not record a gate as passing unless its command completed successfully in the current
environment.
