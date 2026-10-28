<!-- GENERATED FILE - DO NOT EDIT. Gộp từ: AGENTS.md (workspace root), erp/AGENTS.md, erp/erp-web/.agents/AGENTS.md. Sửa nguồn rồi chạy /sync-agents. -->
<!-- Đường dẫn tương đối ở phần workspace và family tính từ workspace root; từ repo này dùng ../../ để lên root. -->

---

<!-- Nguồn: AGENTS.md (workspace root) -->

# Multi-Family Workspace Router

**ROUTING & RULES ONLY:** This is the single source of truth for this multi-family workspace (ERP + Klotus). Application-specific implementation rules live in each family or repo router, not here.

This workspace contains two independent application families: ERP (multi-module backend) and Klotus (public warranty & landing page).

---

## 🧭 Family Routing

Mandatory reading order when working on a specific family:

- **ERP** (API or Web): load 👉 [`./erp/AGENTS.md`](./erp/AGENTS.md), then the repo router:
  - Backend API: [`./erp/erp-api/.agents/AGENTS.md`](./erp/erp-api/.agents/AGENTS.md) + [`./erp/erp-api/CLAUDE.md`](./erp/erp-api/CLAUDE.md)
  - Frontend Web: [`./erp/erp-web/.agents/AGENTS.md`](./erp/erp-web/.agents/AGENTS.md) + [`./erp/erp-web/CLAUDE.md`](./erp/erp-web/CLAUDE.md)
- **Klotus** (Landing Page API or Web): load 👉 [`./klotus/AGENTS.md`](./klotus/AGENTS.md), then:
  - Landing API: [`./klotus/landing-page-api/.agents/AGENTS.md`](./klotus/landing-page-api/.agents/AGENTS.md)
  - Landing Web: [`./klotus/landing-page-web/.agents/AGENTS.md`](./klotus/landing-page-web/.agents/AGENTS.md)

---

## 🛡️ Critical Guardrails (MUST FOLLOW)

### No Root Pushing
- **FORBIDDEN**: Running `git add`, `git commit`, or `git push` from workspace root or intermediate directories (`./erp`, `./klotus`).
- **REQUIRED**: `cd` into the concrete child repository before any git operation:
  - `./erp/erp-api` (API changes)
  - `./erp/erp-web` (frontend changes)
  - `./klotus/landing-page-api` (Klotus API)
  - `./klotus/landing-page-web` (Klotus web)

### Tool Standards
- **BUN ONLY**: Use `bun` / `bunx` exclusively. NEVER use `npm` or `yarn`.
- **No Manual Containers**: Do NOT build or start production deployment containers on the local machine.
- **Local Dev Only**: Use `bun run start:dev` / `bun run dev` for local testing.

### Branch & Deployment Strategy
- **ERP**: Work on `erp-master` FIRST, then sync downstream to `erp-greenway-*`, `erp-klotus-*`.
- **Klotus**: Work on `master` branch.
- **Delivery Sequence**: `Database (Phase 1)` → `API Backend (Phase 2)` → `Web Frontend (Phase 3)` → `QC (Phase 4)`.
- **Remote**: Always push to `github-industries`.

### Database & Environment
- **By Default**: Dùng `DATABASE_URL` trong `.env` làm DB master (luôn đọc `.env` để xác nhận DB thực tế). Tenant khác dùng file `.env.<tenant>-<stage>` tương ứng với nhánh deploy (`greenway-production`, `greenway-staging`, `klotus-production`, `klotus-staging`). Không có biến `ERP_MASTER_DATABASE_URL`; `.env` trần có thể đang trỏ DB production nên luôn kiểm tra `DATABASE_URL` trước khi chạy script, và script phải nhận file env tường minh.
- **Xác nhận DB**: trước khi quét hoặc ghi DB, chạy `SELECT current_database();` để biết DB thực tế, báo anh tên DB trước khi ghi; không suy ra DB từ tên file.
- **Context Isolation**: Do NOT mix databases, `.env`, or schema between ERP and Klotus.
- **Verify Runtime**: Read the actual `.env` before making changes (no outdated assumptions).

### Pre-Commit/Push Checklist
- **Commit** (`pre-commit`, lint-staged): eslint --fix + prettier trên file staged, cộng test liên quan (`jest --findRelatedTests` / `vitest related`). Bypass khẩn cấp: `git commit --no-verify`.
- **Push** (`pre-push`): chỉ `bun run type:check`. Bypass: `SKIP_TESTS=1`.
- **Full test / build / check:ci**: chạy ở GitHub CI (pipeline từng repo), không chạy tự động ở local. Chạy tay khi cần: `bun run verify:final` (ERP) hoặc `bun run check:ci`.
```bash
git commit
git pull --rebase github-industries [target-branch]
git push github-industries [target-branch]
```

---

## 📋 Workflow Catalog (single source of truth)

Each workflow is a slash command (e.g. `/plan-and-task`, `/erp-git-workflow`). Claude command stubs in `.claude/commands/` are generated from the canonical file; only edit the originals in `.agents/workflows/`. After changing anything in `.agents/`, run `/sync-agents`.

Global workflows in `./.agents/workflows/`:

- `sync-agents.md` — sync `.agents` sang `.claude` và `.trae` bằng `sync-agents.sh`.
- `routing.md` — workspace routing.
- `plan-and-task.md` — plan, approval, execution, and checkpoint workflow.
- `clean-brain.md` — session and plan cleanup.
- `erp-git-workflow.md` — ERP master-first Git workflow.
- `erp-web-v2-refactor.md` — ERP Web v2 migration workflow.
- `api-service-refactor.md` — ERP API service/controller refactoring.
- `api-v2-refactor.md` — ERP API v2 module architecture (plop `api-module-v2`, Facade + sub-services + spec).
- `standardize-table.md` — ERP table standardization.
- `ui-atomic-refactor.md` — UI atomic refactoring.

ERP workflows in `./erp/.agents/workflows/`:

- `erp-branch-sync-workflow.md` — sync `erp-master` to downstream branches.

Klotus workflows in `./klotus/.agents/workflows/`:

- `routing.md` — routing theo family và repo.
- `delivery-workflow.md` — bàn giao DB/API/Web/QC.
- `clean-brain.md` — bảo trì workspace.

Repo-level workflows (e.g. `erp/erp-web/.agents/workflows/standardize-drawer.md`, `klotus/landing-page-api/.agents/workflows/klotus-git-workflow.md`) are listed in each repo's own router.

---

## 🚀 Quick Reference: Common Scenarios

### Scenario 1: Starting a New Feature / Refactor / Bugfix
1. Load `/plan-and-task` workflow.
2. Execute **5 phases**: Discovery → Tech Plan → Task Breakdown (X.Y.Z) → Approval → Execution.
3. Create `implementation_plan.md` with clear DoD and verification commands.
4. Use Antigravity Brain (`walkthrough.md` for execution tracking).
5. Update the task checklist in realtime as you progress.
6. When done: update the Module Skill (`erp/erp-api/.agents/skills/modules/<module>/SKILL.md` or `erp/erp-web/.agents/skills/modules/<module>/SKILL.md`).

### Scenario 2: Committing & Pushing Code (ERP)
1. Load `/erp-git-workflow` workflow.
2. Ensure you're on `erp-master`.
3. Commit (pre-commit lint + test liên quan), then `git pull --rebase github-industries erp-master`.
4. Push (pre-push type-check). Full test/build chạy trên GitHub CI sau khi push.

### Scenario 3: Building a Data Table (ERP Web)
1. Load `/standardize-table` workflow.
2. Follow 4 steps: Table component, Header Filters, Server-side API call, STT 1-based, QC.
3. Use existing `SpreadsheetPageTemplate` and `DataTable` components.
4. Verify filter, sort, pagination work end-to-end.

### Scenario 4: Building a Form Drawer (ERP Web)
1. Load `/standardize-drawer` workflow.
2. Follow 4 steps: StandardFormDrawer, Responsive sizing (`vw`), Collapsible sections, Top tabs.
3. Ensure form fields use proper validation and translation keys.

### Scenario 5: Refactoring Large Service (ERP API)
1. Load `/api-service-refactor` workflow.
2. Scan file sizes: Controller >300 LoC, Service >500 LoC.
3. Choose a pattern: Sub-Controllers, Sub-Services Facade, Pure Engine.
4. Maintain 100% backward compatibility via the Facade pattern.
5. Use a clean DI constructor (NO overloading / union types).
6. Add unit tests co-located with each sub-service.

---

## 📚 Skills & Module Knowledge

- All skills are registered in [`./.agents/skills.json`](./.agents/skills.json) and organized by repo:
  - `erp/erp-api/.agents/skills/` — Backend skills (DB migrate, module scanning, deployment)
  - `erp/erp-web/.agents/skills/` — Frontend skills (UI pattern detection, components)
  - `klotus/landing-page-api/.agents/skills/` — Klotus API skills
  - `klotus/landing-page-web/.agents/skills/` — Klotus web skills
- Module knowledge: `erp/erp-api/.agents/skills/modules/<module-name>/SKILL.md` (backend) or `erp/erp-web/.agents/skills/modules/<module-name>/SKILL.md` (frontend).
- Before modifying any core module, read its SKILL.md first. After schema/API changes, update it with `scan-module-knowledge` or manually.

---

## 🧠 Brain & Planning

- Create `implementation_plan.md` for every feature/refactor/bugfix.
- Use `walkthrough.md` for real-time execution tracking.
- Save progress in `.agents/` ➔ Antigravity Brain (Claude Code internal storage).
- Use `/clean-brain` periodically to clean old sessions.
- **Pause**: document current state in `## ⏸️ Session Checkpoint`.
- **Resume**: read the checkpoint to identify exactly where you left off.

---

## 🔗 Canonical Routers

- **Workspace canonical router**: [`./AGENTS.md`](./AGENTS.md) (`.agents/AGENTS.md` chỉ là stub tương thích)
- **ERP Family**: [`./erp/AGENTS.md`](./erp/AGENTS.md)
- **Klotus Family**: [`./klotus/AGENTS.md`](./klotus/AGENTS.md)
- **Validate agent system**: `bash ./.agents/scripts/validate-agent-system.sh`

---

## ⚠️ Common Anti-Patterns (AVOID)

- ❌ Don't run git from workspace root or intermediate directories
- ❌ Don't mix ERP (`erp-master`) and Klotus (`master`) branches
- ❌ Don't use `npm` or `yarn` (use `bun`/`bunx` only)
- ❌ Don't hardcode strings in UI (use i18n translation keys)
- ❌ Don't start with code before creating an `implementation_plan.md`
- ❌ Don't leave ad-hoc `.ts` files at repo root (breaks `dist/` output structure)
- ❌ Don't reference outdated docs (always verify with actual code state)
- ❌ Don't mix database schemas, `.env`, or domain models between ERP and Klotus
- ❌ Don't push code that fails `type:check` (pre-push) or whose CI run is red on GitHub

---

## 🎯 Hierarchy

1. **Workspace** (`CLAUDE.md` → `AGENTS.md`) — guardrails, routing, workflow catalog
2. **Family** (`./erp/AGENTS.md`, `./klotus/AGENTS.md`) — family rules
3. **Repo** (`./erp/erp-api/CLAUDE.md`, etc.) — repo mandates
4. **Workflow** (`.agents/workflows/`) — executable procedures
5. **Module** (`erp/erp-*/.agents/skills/modules/*/SKILL.md`) — domain knowledge

**Always read in order** when starting work on a specific part of the codebase.

---

<!-- Nguồn: erp/AGENTS.md -->

# ERP Family Agent Entry

Entry point for AI agents working in the ERP family (thư mục `erp/` trong workspace root). Workspace-level rules and the global workflow catalog live in `../AGENTS.md`.

## Child Repositories

| Việc | Vào repo | Rule chi tiết |
|------|----------|---------------|
| Backend (NestJS, TypeORM, PostgreSQL) | `./erp-api` (Remote `github-industries`, branch `erp-master`) | [`./erp-api/.agents/AGENTS.md`](./erp-api/.agents/AGENTS.md) |
| Frontend (React, Vite, React Query) | `./erp-web` (Remote `github-industries`, branch `erp-master`) | [`./erp-web/.agents/AGENTS.md`](./erp-web/.agents/AGENTS.md) |

Skills nằm ở `erp-api/.agents/skills/` và `erp-web/.agents/skills/`, đăng ký trong `./.agents/skills.json`. Đọc `erp-*-current-truth/SKILL.md` của repo trước khi sửa code.

## Strict Guardrails

1. **MASTER-FIRST**: Mọi thay đổi (feature, bugfix, refactor, UI, config) phải làm và test trên `erp-master` trước. Commit trực tiếp vào `erp-greenway-*` hoặc `erp-klotus-*` bị cấm. Sync xuống nhánh downstream theo workflow merge chuẩn (`git merge erp-master`).
2. **NO ROOT PUSHING**: Cấm chạy `git add`, `git commit`, `git push` từ `./erp` hoặc workspace root. Luôn `cd` vào `./erp-api` hoặc `./erp-web`.
3. **Delivery Sequence**: `DB -> API -> UI -> QC`.
4. **Tooling**: Chỉ dùng `bun` / `bunx`. Không dùng `npm` hay `yarn`.
5. **Local Dev Only**: Dev local chạy `bun run start:dev` / `bun run dev` (API port 10010). Không build container thủ công.
6. **Isolation**: ERP dùng nhánh `erp-master`, Klotus dùng `master`. Không trộn database, `.env`, schema hay collection (`klotus_*`) giữa hai hệ.
7. **Final Gate**: chạy `bun run verify:final` một lần trên commit cuối; push theo workflow bằng `--no-verify`.

## ERP Workflows

Workflow ERP nằm ở `./.agents/workflows/`:

- `erp-branch-sync-workflow.md` — sync `erp-master` sang nhánh downstream.
- `routing.md`, `clean-brain.md`, `erp-web-v2-refactor.md`.

Workflow global (`plan-and-task.md`, `erp-git-workflow.md`, `standardize-table.md`, `api-service-refactor.md`, `ui-atomic-refactor.md`, ...) xem catalog ở `../AGENTS.md`.

Kế hoạch và verify theo Antigravity Brain: `implementation_plan.md` -> `walkthrough.md`, cập nhật checklist realtime.

## TypeORM Query Relations

Khi dùng `relations` trong `find`, `findAndCount`, ... phải kiểm tra relation đã khai báo trong entity với decorator tương ứng (`@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany`). Thiếu sẽ gây lỗi 500 `EntityPropertyNotFoundError` lúc runtime.

---

<!-- Nguồn: erp/erp-web/.agents/AGENTS.md -->

# ERP Web Agent Bootstrap

Source of truth for this repo (`./erp-web`).

## Read order

1. `.agents/skills/erp-web-current-truth/SKILL.md`

## Web Specific Agent Mandates

### 1. UI Reusability Enforcer (Anti-Reinvention)

- **CRITICAL:** Do NOT build basic components like Modal, Drawer, Table/Spreadsheet, or Filter Panel from scratch.
- Always use `grep_search` in `src/shared/components/` (e.g., `ConfirmModal`, `StandardFormDrawer`, `DataTable`, `FilterPanel`) first. V2 components live in `src/v2/shared/components/`.
- If found, read its interface/props and reuse it.

### 2. Atomic Design & Clean Code

- **Max File Size:** Any React file exceeding 180 lines MUST be split (v1 legacy files over 180 lines are exempt unless touched by the task; see `ui-atomic-refactor`).
- Extract complex state/API logic into `hooks/` (e.g., `use[Feature]Logic.ts`).
- Extract helper functions into `utils/`.
- Extract sub-components into their own files. Do NOT group multiple large React components in a single file.

### 3. React Query Mandate

- When handling Server State (fetch data, create, update, delete) in React, you **MUST** use `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`).
- **NEVER** use `useEffect` + `fetch/axios` for manual server state management.

### 4. Web Auto-TDD (Test Driven)

- After creating or modifying a core function, hook, layout, or critical UI component, you **MUST** generate a corresponding `.test.tsx` or `.test.ts` file.
- The unit test must cover the happy path and basic user interactions (e.g., click button, render layout correctly).

### 5. Strict Pre-push Hook

- Commit: pre-commit tự chạy lint-staged (eslint, prettier, `vitest related` trên file staged). Không chạy full test thủ công.
- Push: pre-push chạy `bun run type:check`. Do NOT push if it fails.
- Full test / build / check:ci chạy trên GitHub CI. Không push tiếp khi CI của nhánh đang đỏ.

### 6. i18n Translation Mandate

- You **MUST** use the project's i18n translation system (e.g., `useTranslation`, `t('key')`) for **all user-facing text** including titles, labels, placeholders, buttons, and validation messages.
- **NEVER** hardcode raw strings like `title="Xác nhận"`. Always use translation keys.

### 7. Rebase First Conflict Resolution

- When pushing code and encountering a conflict, your **first priority** is to use `git pull --rebase github-industries erp-master`.
- Only if the rebase presents overly complex conflicts, you may `git rebase --abort` and resolve using a standard merge (`git pull origin erp-master`).

---

## Current Truth

- Main ERP lane hiện tại: **GitHub + branch `erp-master`**
- Repo này là Web repo của lane active.
- Old dev domains không phải current-truth endpoints mặc định.

### Repo role

- UI flows
- route wiring
- action visibility by status/state
- consuming real API contract
- build/test/route smoke evidence cho Web lane

---

## Working Contract

### Order

1. DB
2. API
3. UI
4. QC

### Rules

- inspect before edits
- MUST use bun/bunx exclusively (do NOT use npm)
- evidence-first
- before commit/push, `cd` into the repo root (`./erp-web`)
- **Strict Git Workflow**: You MUST follow the exact commit/push sequence defined below (pull -> build -> check:ci -> test -> commit -> push).
- push this repo with `github-industries`
- when debugging and testing API locally, always start dev on port 10010
- by default, work on the `DATABASE_URL` in `.env` (master; luôn đọc `.env` để xác nhận DB thực tế); use the matching `.env.<tenant>-<stage>` file (greenway/klotus) only when explicitly indicated; scripts must take the env file explicitly (a bare `.env` may point at a production DB)
- before any DB scan or write, run `SELECT current_database();` to confirm the actual DB and report it before writing; never infer the DB from a file name
- reuse existing components/hooks/utils/helpers/functions/page patterns first
- extend/adapt before forking parallel patterns
- cancel or delete actions must have modal confirm (e.g. ConfirmModal)
- delete operations must be soft delete with `isDeleted` flag

---

### Git Workflow Mandates

1. **Master-First Mandate**: ALL code modifications, features, bug fixes, UI enhancements, and refactoring **MUST** be performed and tested on `erp-master` FIRST. Direct commits to downstream branches (`erp-greenway-*`, `erp-klotus-*`) are strictly prohibited.

2. When asked to **commit code**, you MUST execute the following in order:
   - Ensure current branch is `erp-master`
   - `git commit` (pre-commit tự chạy lint-staged và `vitest related` trên file staged; không chạy full test thủ công)

3. When asked to **pull code**, you MUST execute the following in order:
   - If there are uncommitted changes, you MUST execute the full **commit code** sequence first.
   - `git pull --rebase github-industries erp-master` (and resolve conflicts if any)

4. When asked to **push code**, you MUST execute the following in order:
   - If there are uncommitted changes, you MUST execute the full **commit code** sequence first.
   - `git pull --rebase github-industries erp-master` (and resolve conflicts if any)
   - `git push github-industries erp-master` (pre-push chạy `bun run type:check`; full test/build/check:ci chạy trên GitHub CI, theo dõi CI sau khi push)

5. When asked to **sync/deploy to downstream branches** (`erp-greenway-production`, `erp-greenway-staging`, `erp-klotus-*`):
   - First ensure `erp-master` is committed, tested, and pushed to `github-industries erp-master`.
   - Run `../.agents/scripts/sync-branch.sh <target-branch> --push` or follow `erp-git-workflow.md` Scenario 4.
   - Always return back to `erp-master` after syncing.

**Git Execution Context**: You MUST perform all Git operations (add, commit, pull, push) exclusively inside the `erp-web` directory. NEVER run git commands from the workspace root. When pulling or pushing, ALWAYS specify the remote `github-industries` (e.g., `git push github-industries erp-master`).

### Required behavior

- load `@.agents/skills/erp-web-current-truth/SKILL.md`
- use repo-local context as default guidance
- MUST use bun/bunx exclusively (do NOT use npm)
- when debugging and testing API locally, always start dev on port 10010
- by default, work on the `DATABASE_URL` in `.env` (master; luôn đọc `.env` để xác nhận DB thực tế); use the matching `.env.<tenant>-<stage>` file (greenway/klotus) only when explicitly indicated; scripts must take the env file explicitly (a bare `.env` may point at a production DB)
- before any DB scan or write, run `SELECT current_database();` to confirm the actual DB and report it before writing; never infer the DB from a file name
- follow DB -> API -> UI -> QC
- inspect current state before edits
- use evidence-first wording
- before push/commit, `cd` vào root của repo hiện tại (`./erp-web` từ workspace root)
- **Strict Git Workflow**: You MUST follow the `Git Workflow Mandates` defined above for all commits and pushes (Master-First).
- push with `github-industries`
- always check branch 1st when push. All modifications must be developed and pushed on `erp-master` 1st, then merged/synced downstream to other branches.
- reuse existing components/hooks/utils/helpers/services/functions/page patterns first
- extend/adapt before duplicating
- manage all task execution, planning, and verification in Antigravity Brain (`implementation_plan.md` -> `walkthrough.md`)
- keep task checklist updated in realtime
- if task status in docs drifts from code reality, verify by code + build/test + git state before correcting the artifact

### Architecture & Development Standards

- **TDD**: Prefer Test-Driven Development for new features and non-trivial fixes. If not practical, add or update the nearest affected automated test before closing the task.
- **State Management**: Use `useState` for component inner state. Use `zustand` for state shared across multiple places. Use `@tanstack/react-query` with `axios` for server/API state.
- **Imports**: Use alias imports. Group 3rd-party imports first, followed by a blank line, then custom code imports.
- **Modularity**: Apply atomic design and a modular mindset. Break down components, hooks, utilities, and functions into the smallest possible, reusable units.
- **Forms & Validation**: Prefer `react-hook-form` + schema-based validation for new complex forms or when refactoring unstable forms. Do not force a partial migration that makes the codebase more inconsistent.
- **Options Fields**: Prefer explicit enums/typed options for option-based fields; keep naming aligned with existing domain types.
- **Page boundaries**: Pages should orchestrate layout, query hooks, and domain components; avoid pushing business-heavy logic directly into `src/pages/*`.
- **Definition of done**: A frontend task is not done until task checklist is updated, validation evidence is recorded, and commit/push status is stated clearly.

### Teamwork guardrails

- Use `must` only for standards already enforced or verified in this repo; use `prefer` for target-direction conventions.
- If introducing a new page/module, record route wiring, page key, app store registration, API client dependency, and permission impact in the task.

### Anti-drift / anti-patterns

- Do not reference non-existent bootstrap files.
- Do not let historical docs override repo-local current truth.
- Do not add domain-heavy logic into shared generic components.
- Do not report a task DONE from docs alone; verify with code state, build/test evidence, and git state.

### SpreadsheetPageTemplate filtering bug

When using `SpreadsheetPageTemplate`, NEVER pass `filterState`, `filterPanelOpen`, `activeFilterCount`, or `onFilterToggle` props. The template interface has been refactored. Always pass the FULL `FilterPanelReturn` object directly to the `filter` prop:

```tsx
// Correct
const filterPanel = useFilterPanel(config);
<SpreadsheetPageTemplate
  ...
  filter={filterPanel}
/>

// Wrong - will crash FilterPanel with "Cannot read properties of undefined (reading 'search')"
<SpreadsheetPageTemplate
  ...
  filterState={filterPanel.state}
/>
```

### Table Column Width / Layout Stretching

When using `SpreadsheetPageTemplate` or `DataTable`, the table uses `table-layout: fixed`. To protect fixed-width columns (`__actions`, `__expand`, `__selection`) from browser stretching when the container is larger than the total column sizes:

You do NOT need to set `w-full` on any columns. The `DataTable` template has been updated with a structural CSS fix (an invisible auto-sizing spacer column) that automatically absorbs any excess screen width.

However, to prevent the table from appearing cramped on large monitors, you **should** define explicit `size` properties (e.g. `size: 150`, `size: 250`) on your normal data columns so `table.getTotalSize()` is reasonably large.
