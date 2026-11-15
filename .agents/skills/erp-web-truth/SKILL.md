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
- Thứ tự giao hàng: DB → API → UI → QC.
- UI phải tiêu thụ đúng API contract thật. Trước khi viết hoặc sửa hook/API client, đối chiếu DTO với code API hoặc với module skill tương ứng.
- Không suy đoán từ note cũ. Trước khi sửa status, đối chiếu code + build/test + git state.

## 3. Trách nhiệm của tầng web

- Luồng UI, route wiring, hiển thị action theo trạng thái/quyền.
- Gọi đúng API contract thật.
- Bằng chứng: build, test, smoke route.

## 4. Cấu trúc V1 và V2

- `src/` chứa V1 (`src/core`, `src/modules`, `src/shared`).
- `src/v2/` chứa V2, chạy song song tại `/v2/*` và dùng chung bundle với V1.
- Alias `@/v2/*` → `src/v2/*`, `@/*` → `src/*`.
- Module V2 và shared V2 không import V1, ngoại trừ auth store dùng chung (`@/modules/auth/domain/authStore`).
- Key i18n trong V2 phải có prefix `v2.`.
- Migrate V1 → V2 chỉ làm khi user ra lệnh (rolling migration). Chi tiết: skill `erp-ui-structure`.

## 5. Tooling

- Dùng `bun` / `bunx`.
- Script trong `package.json`:
  - `type:check` = `tsc --noEmit`
  - `check:ci` = `tsc --noEmit` + eslint `--max-warnings=0` + `prettier --check`
  - `build` = `tsc` + `vite build`
  - `test` = `vitest --run`
  - `lint` / `lint:check` / `check:style`
- Storybook: `build-storybook`.
- Generator: `bun run plop` (ví dụ `v2-module`, `v2-component`).

## 6. Git, hook và CI (đã đối chiếu với `.husky/` và `.github/workflows/`)

- **pre-commit**: `bunx lint-staged`.
- **pre-push**: `bun run type:check`. Chỉ bypass bằng `SKIP_TESTS=1` hoặc `HUSKY_SKIP_TESTS=1` khi đã verify thủ công.
- **CI `pipeline-erp-master.yml`** (trigger vào `erp-master`):
  - Type, Lint & Format: `bun run check:ci`
  - Unit tests: `bun run test`
  - Build check (chỉ PR): `bun run build`
  - Build & push image
  - Deploy qua Komodo
- Luồng chuẩn: test → commit → `git pull --rebase` → push. Chi tiết: skill `erp-git-workflow`.
- Chỉ commit/push khi user yêu cầu, và chỉ trong đúng repo con (`erp-web`).

## 7. Quy tắc làm việc

- Plan theo `/erp-plan` (cơ chế plan của agent). Chỉ làm sau khi user xác nhận `OK`. Theo dõi task trên Plane bằng skill `plane-work-items`.
- Cấu trúc page: page → domain hook/query → domain components → shared primitives.
- Mọi file React trên 180 dòng phải tách, trừ file V1 cũ không được chạm trong task.
- i18n đầy đủ VI/EN, không hardcode chuỗi hiển thị.
- Không dùng màu `blue-*` (No Blue Mandate). Dùng token ngữ cảnh.
- Dùng `must` cho chuẩn đã được enforce trong repo, `prefer` cho hướng đi mục tiêu.
- Nếu tạo component hoặc helper mới thay vì dùng lại, ghi lý do vào task.
- Task chỉ xong khi có bằng chứng validate và trạng thái commit/push.

## 8. Bản đồ module

Tài liệu chi tiết của từng module nằm tại `.agents/skills/modules/<module>/SKILL.md` (routing, PageKey, cột bảng, drawer, modal, API client, UX).

- **Sản xuất & BOM**: `production-core`, `bom-core`
- **Kho & tồn kho**: `inventory-dashboard`, `erp-inventory-items`, `erp-inventory-stock`, `erp-inventory-tracking`, `erp-inventory-transactions`, `erp-inventory-adjustments`, `erp-inventory-vouchers`
- **Phụ tùng VinFast**: `vinfast-parts-stock`, `vinfast-parts-dashboard`
- **Garage**: `garage-cases`, `garage-dashboard`, `inventory-movements-garage` (chứng từ kho và tồn kho Garage, thay trang Nhập kho Garage; lõi `inventory-movements` và `goods-receipts`; lõi PO dùng chung ở `src/v2/core/purchase-orders/`)
- **Đối tác & nhà cung cấp**: `business-partners`, `erp-suppliers`
- **Tài chính & hóa đơn**: `erp-invoice`, `bank-statements`, `cash-vouchers`
- **Quản trị, cấu hình, core store**: `rbac-core`, `app-store`
- **Layout và thành phần chuẩn V2**: `v2-layout`, `v2-foundation`, `v2-auth`, `v2-admin-layout`; bảng và drawer V2 nằm trong skill `standardize-table` (`standardize-table/references/v2-table.md`) và `standardize-drawer` (`standardize-drawer/references/v2-drawer.md`)
- **AI Hub V2**: `ai-hub` (core `src/v2/core/ai-hub`, chatbot nổi dùng chung `V2FloatingChat` trong `src/v2/shared`, trợ lý AI đọc hóa đơn gắn ở trang garage-procurement tab `requests`)
- **Shell và điều hướng**: xem `references/ui-shell-and-theme.md`

Khi cần quét mới hoặc cập nhật tài liệu module: skill `scan-module-knowledge`.

## 9. Bằng chứng cần có

- Số liệu build/test/smoke phải lấy từ lần chạy hiện tại.
- Báo cáo scope test và route đã kiểm. Nếu không chạy được, nói rõ là chưa chạy và lý do.
