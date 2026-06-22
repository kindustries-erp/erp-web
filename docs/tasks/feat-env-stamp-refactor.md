# Feature: Environment Stamp Refactor

## Context

Enhance the `EnvStamp` component by extracting the environment variable parsing logic into a reusable global Zustand store (`useEnvStore`).
Introduced a shared enum `AppEnvironment` to avoid hardcoded string literals and improve type safety. Also added support for custom background colors for specific environments (purple for Klotus, green for Greenway, blue for Blueway).

## Changes

- Created `src/core/constants/environments.ts` with `AppEnvironment` enum.
- Created `src/core/store/useEnvStore.ts` using Zustand to manage environment state globally.
- Refactored `src/core/components/EnvStamp.tsx` to use the global store and enum, and added dynamic background colors based on the environment.

## Verification

- Lint passed: `bun run lint:check`
- Types passed: `bunx tsc --noEmit`

## Definition of Done

- [x] Code implemented
- [x] Checks run and passed
- [x] Pushed to `erp-master` via `github-industries`
