# Task: Chuẩn hóa ERP Web sang Bun

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Chuẩn hóa sạch toàn bộ ERP Web từ npm/pnpm sang Bun
- Bối cảnh/ngữ cảnh: Repo hiện còn lẫn `package-lock.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, scripts/Husky/Dockerfile dùng npm; cần chuyển đồng bộ sang Bun để tránh drift.

## Goal

Chuẩn hóa một package manager duy nhất cho `liouni-erp-web` là Bun, đồng bộ local tooling, Husky, Docker build, README và deploy path runtime, không đổi nghiệp vụ UI.

## Scope

- In-scope:
  - `package.json` scripts
  - lockfiles package manager
  - `.husky/pre-commit`
  - `Dockerfile`
  - `README.md`
  - verify Gitea workflow có cần đổi hay không
  - build/test/deploy verify runtime
- Out-of-scope:
  - API repo
  - Directus staging schema/data
  - Thay đổi business logic UI
  - Đổi tên Gitea workflow/action

## Relevant Files

- `package.json` - scripts và package-manager contract
- `.husky/pre-commit` - local commit gate
- `Dockerfile` - build image runtime
- `README.md` - hướng dẫn cài/chạy/build
- `.gitea/workflows/deploy-staging.yml` - verify deploy path có cần đổi không
- `package-lock.json` - legacy npm lockfile cần dọn
- `pnpm-lock.yaml` - legacy pnpm lockfile cần dọn
- `pnpm-workspace.yaml` - legacy pnpm workspace marker cần dọn nếu không còn cần

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A (tooling-only task, không đụng DB/Directus)
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done — N/A (tooling-only)
- [x] 3.0 UI gate done
  - [x] 3.1 Cài Bun 1.3.14 trên host (`~/.bun/bin/bun`)
  - [x] 3.2 Dọn `package-lock.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`; generate `bun.lock`
  - [x] 3.3 `package.json` `docker:deploy` đổi sang `bun run`
  - [x] 3.4 `.husky/pre-commit` đổi `npm/npx` → `bun/bunx`
  - [x] 3.5 `Dockerfile` đổi `node:20-alpine` → `oven/bun:1`, `npm ci/build` → `bun install --frozen-lockfile / bun run build`
  - [x] 3.6 `README.md` cập nhật yêu cầu Bun, thay toàn bộ npm commands → bun
  - [x] 3.7 Gitea workflow `.gitea/workflows/deploy-staging.yml` không cần đổi (chỉ SSH vào server rồi docker compose build)
- [x] 4.0 Validation
  - [x] 4.1 `bun run build` PASS (exit 0, vite build 4.00s)
  - [x] 4.2 `bunx vitest run` PASS (14 files, 68 tests)
  - [x] 4.3 `bun run format` PASS; `bunx lint-staged` PASS
  - [x] 4.4 Docker build `--no-cache` PASS (Bun builder → nginx runner)
  - [x] 4.5 Container `liouni-erp-web` Up, logs sạch
  - [x] 4.6 `http://127.0.0.1:8808/` → HTTP 200; `https://dev.erp.liouni.com/` → HTTP 200
  - [x] 4.7 Bundle: `/usr/share/nginx/html/assets/index-C1AUp8TH.js` (hash mới)
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue) — không phát sinh issue mới cần lesson file; đã fix luôn warning Husky v10 header trước khi close
  - [x] 5.2 Commit + push code (web)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` (tooling-only task, không đụng DB/Directus)
- `bun run build`: PASS — vite v5.4.21, 2892 modules, 4.00s, PWA precache 11 entries OK
- `bunx vitest run`: PASS — 14 test files, 68 tests
- `bun run format`: PASS (unchanged)
- `bunx lint-staged`: PASS
- Docker build `--no-cache`: PASS — image `liouni-erp-web-liouni-erp-web:latest`, SHA `dae2407...`
- Container status: `Up 0.0.0.0:8808->80/tcp`
- Runtime local: HTTP 200 `http://127.0.0.1:8808/`
- Runtime live: HTTP 200 `https://dev.erp.liouni.com/`
- Bundle: `index-C1AUp8TH.js` (new hash xác nhận build Bun)
- Gitea workflow: không đổi (chỉ SSH deploy, không gọi npm/bun trực tiếp)

## Lessons Learned

- Không có issue / hoặc link entry: `docs/lessons-learned/<file>.md#<anchor>`

## Commit/Push Status

- Web repo: `ac8b408` pushed → `origin/staging`
- API repo: N/A
- DB/directus staging: N/A
