# Feature: Environment Stamp

## Context

Add a floating stamp component (`EnvStamp`) that reads the `__APP_ENV__` variable and displays the current environment at the top center of the screen.

## Changes

- Created `src/core/components/EnvStamp.tsx`.
- Modified `src/App.tsx` to include `<EnvStamp />` in the main shell.

## Verification

- Lint passed: `bun run lint:check`
- Types passed: `bunx tsc --noEmit`
- Tests passed: `bun run test`
- Build passed: `bun run build`

## Definition of Done

- [x] Code implemented
- [x] Checks run and passed
- [x] Pushed to `erp-master` via `github-industries`
