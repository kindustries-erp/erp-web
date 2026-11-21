---
name: erp-web-truth
description: Ngữ cảnh hiện hành của erp-web (frontend React/Vite của ERP) - lane giao hàng, hợp đồng với API, cấu trúc V1/V2, tooling, quy trình git/CI và bản đồ module. Load đầu tiên trước mọi task trong erp-web. Với việc tổ chức lại component hoặc migrate V2, dùng skill erp-ui-structure.
---

# ERP Web — Current Truth

Chỉ dùng trong repo `erp/erp-web`. Skill này chỉ giữ ngữ cảnh ngắn và các rule đã kiểm chứng. Chi tiết về shell và theme nằm ở `references/ui-shell-and-theme.md`.

## 1. Đọc theo thứ tự

1. `.agents/AGENTS.md` — router và mandates của web (kích thước file, i18n, No Blue).
2. `README.md`.
3. Plan và task hiện hành: Plane, project KINDU (skill `plane-work-items`). Antigravity Brain chỉ là bản phụ.

## 2. Lane và trạng thái

- Lane giao hàng chính: branch `erp-master`. Repo `erp/erp-web` đang ở `erp-master`.
- UI phải tiêu thụ đúng API contract thật. Trước khi viết hoặc sửa hook/API client, đối chiếu DTO với code API hoặc với module skill tương ứng.
- Không suy đoán từ note cũ. Trước khi sửa status, đối chiếu code + build/test + git state.

## 3. Trách nhiệm của tầng web

- Luồng UI, route wiring, hiển thị action theo trạng thái/quyền.
- Gọi đúng API contract thật.
- Bằng chứng: build, test, smoke route.

## 4. Cấu trúc V1 và V2

- `src/` chứa V1 (`src/core`, `src/modules`, `src/shared`).
- `src/v1/` (`@/v1/*`) chứa mã nguồn V1 cũ đã được di chuyển có hệ thống khi V2 hoàn thành:
  - `src/v1/pages/`: các trang V1 cũ (Users, Employees, Positions, Permissions, ActivityLog, Customers, Suppliers, Partners, EInvoice, WorkflowCanvas, CashflowVouchers, CashFlow, BankDeposit, CashFund, Login).
  - `src/v1/components/`: các shared components V1 cũ (DataTable, StandardTable, SpreadsheetPageTemplate, SortTh, TablePagination, StandardFormDrawer, DrawerModal, drawer/, SlidePanel, Combobox, DatePicker, EmptyState, ConfirmModal, Toast, DrawerDocumentTraceability...). Tại `src/shared/components/*` duy trì hệ thống Facade Re-export mỏng trỏ về `@/v1/components/*` để bảo vệ 100% tính tương thích ngược.
  - `src/v1/modules/`: các domain modules V1 cũ (users, hr-employees, hr, system-rbac, system-audit). Tại `src/modules/*` duy trì Facade Re-export trỏ về `@/v1/modules/*`.
- `src/v2/` chứa V2, chạy song song tại `/v2/*` và dùng chung bundle với V1.
- Alias `@/v2/*` → `src/v2/*`, `@/*` → `src/*`.
- Module V2 và shared V2 không import V1, ngoại trừ auth store dùng chung (`@/modules/auth/domain/authStore`).
- Key i18n trong V2 phải có prefix `v2.`.
- **URL chính không có `v2`**: URL chính thức của mọi trang luôn là `/<slug>` (ví dụ `/file-attachments`, `/employees-management`), không bao giờ `/v2/...` hay `/v3/...`.
  - **Module dùng chung component giữa `/*` và `/v2/*`**: Xóa bỏ URL `/v2/*` tương ứng trong cấu hình route; `App.tsx` tự động redirect các URL `/v2/*` cũ về URL chính `/<slug>`.
  - **Module có 2 component khác biệt giữa V1 và V2** (ví dụ: `customers`, `suppliers`, `invoices`, `audit-logs`, `admin-dashboard`): Hiển thị trực tiếp trong **Sidebar Menu Gốc** (`V2ShellLayout`), nhãn có hậu tố ` (v2)` (ví dụ: *Khách hàng (v2)*, *Nhà cung cấp (v2)*), URL dạng `/<slug>-v2` trong root shell, và **chỉ hiển thị/cho phép duy nhất tài khoản `admin@liouni.com` truy cập**. Người dùng khác bị chặn bởi guard và trả về `NotFound`.
  - **Phân vùng `/v2/*` không có sidemenu**: Loại bỏ hoàn toàn `V2Sidebar` và bottom nav khi truy cập `/v2/*`. Nội dung trang mở rộng toàn màn hình (full width).
  - Khi một module V2 sẵn sàng thay thế hoàn toàn V1, nối vào shell chính: thêm PageKey `<slug>` (`shared/types`, `shared/utils/pageUrl.ts`, `core/config/appStore/constants.ts`, nav/sidebar, `V2ShellLayout` breadcrumb), đăng ký component V2 trong `App.tsx` (map PageKey → trang V2), và giữ slug cũ của V1 làm `LEGACY_SLUGS` trỏ về PageKey mới. Mẫu: `employees-management`, `file-attachments`.
- Migrate V1 → V2 chỉ làm khi user ra lệnh (rolling migration). Chi tiết: skill `erp-ui-structure`.

## 5. Tooling

- Dùng `bun` / `bunx`.
- Script trong `package.json`:
  - `type:check` = `tsc --noEmit`
  - `check:ci` = `tsc --noEmit` + eslint `--max-warnings=0` + `prettier --check`
  - `build` = `tsc` + `vite build`
  - `test` = `vitest --run` (chỉ chạy test trong V2: `src/v2/**/*.{test,spec}.{ts,tsx}`)
  - `test:v2` = `vitest --run` (alias chỉ chạy V2)
  - `test:all` = `vitest --run --include 'src/**/*.{test,spec}.{ts,tsx}'` (chạy toàn bộ khi audit thủ công)
  - `e2e:*` = chạy các luồng E2E Playwright trong `e2e/*.e2e.mjs`
  - `lint` / `lint:check` / `check:style`
- Storybook: `build-storybook`.
- Generator: `bun run plop` (ví dụ `v2-module`, `v2-component`).

## 6. Git, hook và CI (đã đối chiếu với `.husky/` và `.github/workflows/`)

- **pre-commit**: `bunx lint-staged` (chỉ kích hoạt `vitest related` với file staged thuộc `src/v2/**/*.{ts,tsx}`; ngoài v2 chỉ chạy eslint/prettier).
- **pre-push**: `bun run type:check`. Chỉ bypass bằng `SKIP_TESTS=1` hoặc `HUSKY_SKIP_TESTS=1` khi đã verify thủ công.
- **CI `pipeline-erp-master.yml`** (trigger vào `erp-master`):
  - Type, Lint & Format: `bun run check:ci`
  - Unit tests: `bun run test` (chỉ chạy unit tests V2)
  - Build check (chỉ PR): `bun run build`
  - Build & push image
  - Deploy qua Komodo
- Luồng chuẩn: test → commit → `git pull --rebase` → push. Chi tiết: skill `erp-git-workflow`.
- Chỉ commit/push khi user yêu cầu, và chỉ trong đúng repo con (`erp-web`).

## 7. Quy tắc làm việc

- Plan theo `/erp-plan`. Mandate (kích thước file, i18n, reuse, Definition of done) nằm ở `.agents/AGENTS.md`, không lặp lại ở đây.
- Cấu trúc page: page → domain hook/query → domain components → shared primitives.
- Không dùng màu `blue-*` (No Blue Mandate). Dùng token ngữ cảnh.

## 8. Bản đồ module

Trước khi sửa hoặc thêm module, đọc `references/module-map.md` (cùng thư mục skill này) để tìm module, rồi đọc tiếp `../modules/<module>/SKILL.md` của module đó (routing, PageKey, cột bảng, drawer, modal, API client, UX). Bản đồ là file tự sinh từ `description` trong frontmatter của từng module, không sửa tay; module mới hoặc đổi phạm vi thì sửa `description` rồi chạy `/sync-agents`.

Bảng và drawer V2: skill `standardize-table` (`../standardize-table/references/v2-table.md`) và `standardize-drawer` (`../standardize-drawer/references/v2-drawer.md`). Shell và điều hướng: `references/ui-shell-and-theme.md`. Quét mới hoặc cập nhật tài liệu module: skill `scan-module-knowledge`.

## 9. Bằng chứng cần có

- Số liệu build/test/smoke phải lấy từ lần chạy hiện tại.
- Báo cáo scope test và route đã kiểm. Nếu không chạy được, nói rõ là chưa chạy và lý do.
