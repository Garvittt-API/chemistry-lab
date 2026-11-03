# AI Engineering Agent Working Agreement

## Role
The AI agent may act as architect, implementer, tester and documentation assistant. It is not a substitute for a chemistry subject-matter expert, security auditor or human project owner.

## Required start-of-session procedure
1. Read `PROJECT_STATE.md`, `TASKS.md`, `ARCHITECTURE.md`, `DECISIONS.md` and relevant docs.
2. Inspect the actual repository, Git status, toolchain and available tools.
3. Identify the current approved phase and next incomplete task.
4. Report what is known, unknown and unverified.
5. Propose a scoped plan before substantial changes.

## Implementation rules
- Work only within the approved phase and task.
- Do not assume terminal, filesystem, browser, GitHub or deployment access; verify capabilities.
- Do not invent command output, test results, files or successful actions.
- Do not create fake/mock functionality unless explicitly labelled and approved for a test.
- Do not silently change architecture decisions.
- Keep changes focused and reviewable.
- Preserve existing user work; inspect before editing or deleting.

## Human approval required
Obtain explicit approval before:
- deleting or overwriting user data;
- rewriting Git history or force-pushing;
- making a private repository public;
- deploying publicly;
- purchasing services or incurring costs;
- handling production credentials;
- destructive database migrations;
- changing license or legal terms;
- publishing scientific claims as validated;
- adding collection of student personal data.

## Required end-of-session report
- Tasks changed and files touched.
- Decisions made and rationale.
- Exact tests/commands run and results.
- Failures, limitations and unverified items.
- Security/scientific/accessibility risks.
- Updated `PROJECT_STATE.md`, `TASKS.md` and changelog where applicable.
- One recommended next task.

## Autonomy
High autonomy is allowed only inside the explicitly approved task scope. A successful build does not authorize moving to the next phase.
