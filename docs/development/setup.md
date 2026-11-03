# Development Setup

## Prerequisites
- Git.
- Node.js `24.18.1` (also recorded in `.nvmrc`).
- pnpm `12.16.1`, activated through the repository's `packageManager` field.
- A supported editor/IDE.
- Android Studio and/or Xcode only when native mobile development is required.

## Verify local tools
```powershell
node --version
npm --version
git --version
corepack --version
corepack pnpm --version
```

Expected versions for this foundation are Node `24.18.1`, npm `11.16.0`, Git `2.55.0` or newer,
Corepack `0.35.0` or newer, and pnpm `12.16.1`.

## Install dependencies

From the repository root:

```powershell
corepack enable
corepack pnpm install
```

If `corepack enable` cannot write the Node.js installation directory on Windows, install pnpm
`12.16.1` through the approved local Node.js package-management mechanism and verify
`pnpm --version` before running the commands below.

## Start applications

```powershell
corepack pnpm --filter @virtual-chemistry-lab/web dev
corepack pnpm --filter @virtual-chemistry-lab/mobile dev
```

The web application runs through Next.js. The mobile command starts Expo and requires a simulator,
device, or Expo-compatible client for interactive use.

## Toolchain policy
Exact versions are pinned in workspace manifests and the lockfile. Compatibility was checked against
the installed registry metadata: Next.js `16.4.4` requires Node `>=20.9.0`, Expo `58.0.23` supports
Node `^22.13.0 || ^24.3.0`, and React Native `0.88.1` supports Node `^22.13.0 || ^24.3.0`.

## Environment variables
- Commit only `.env.example` with dummy values and descriptions.
- Keep actual `.env*` files ignored.
- Never put secrets in client-side variables or source control.
