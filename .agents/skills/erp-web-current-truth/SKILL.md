---
name: erp-web-current-truth
description: Web-specific local-only skill for ERP. Use when working in this repo to load the repo-local current-truth context, index, and implementation rules without relying on external docs.
---

# ERP Web Current-Truth

Use this skill only inside this repository.

## Local read order

1. `@.agents/AGENTS.md`
2. `@README.md`
3. Antigravity Brain (`implementation_plan.md` & `walkthrough.md`)

## Current truth

- Main ERP lane = GitHub + branch `erp-master`
- API contract phải bám schema, constraint, relation, và runtime config đang dùng thật

## Web responsibilities

- UI flows
- route wiring
- action visibility by state/status
- consuming the real API contract
- build / test / route smoke evidence

## Working rules

- Follow DB -> API -> UI -> QC
- Inspect current state before edits
- Use Bun/Bunx first
- Be evidence-first
- Manage all task execution, planning, and verification in Antigravity Brain (`implementation_plan.md` -> `walkthrough.md`)
- Keep task checklist updated in realtime
- **Strict Git Workflow**: Follow the exact sequence: pull -> build -> check:ci -> test -> commit -> push (see rules for exact trigger definitions).
- When task docs are stale, verify with code + build/test + git state before correcting status/checklist

## Module Knowledge Repository (.agents/skills/modules/)

Mỗi domain/module frontend đều có tài liệu tri thức chuyên sâu (Routing, PageKey, Table columns, Drawers, Modals, API client, UX) được lưu tại `.agents/skills/modules/<module-name>/SKILL.md`.

- Khi làm việc trên module cụ thể: Đọc trực tiếp skill của module đó:
  - **Sản xuất & BOM**: `production-core`, `bom-core`
  - **Kho & Tồn kho**: `inventory-dashboard`, `erp-inventory-items`, `erp-inventory-stock`, `erp-inventory-tracking`, `erp-inventory-transactions`, `erp-inventory-adjustments`, `erp-inventory-vouchers`
  - **Phụ tùng VinFast**: `vinfast-parts-stock`, `vinfast-parts-dashboard`
  - **Tài chính & Hóa đơn**: `erp-invoice-web`
  - **Quản trị, Cấu hình & Core Stores**: `rbac-core`, `app-store`
  - **Kiến trúc Layout & Thành Phần Chuẩn V2 (Atomic 5 tầng)**: `v2-layout`, `v2-drawer`, `v2-table`, `v2-foundation`
  - **Hybrid Shell V2 Layout**: `V2ShellLayout` tại `src/core/components/layout/V2ShellLayout.tsx` đóng vai trò là App Shell chính thống của ERP Web, mang lại diện mạo V2 (Dual-Card Floating Background, V2Sidebar với collapsible 58px/210px, V2RightPanel với Frosted Glass Topbar và V2TabBar) cho toàn bộ các trang nghiệp vụ V1 thông qua 2 adapter `useV2AdaptedNavSections` và `useV2AdaptedTabs`. Menu `HỆ THỐNG` (`sec-settings`) quản lý đầy đủ các trang thiết lập và cấu hình bao gồm Hòm thư hệ thống, Người dùng & Tài khoản, Phân quyền vai trò, Nhật ký hoạt động, Chi nhánh, Tài khoản ngân hàng (`settings-bank`, icon `Landmark`, gắn `BANK_STATEMENTS`), Quỹ tiền mặt (`settings-cash-fund`, icon `Banknote`, gắn `CASH_STATEMENTS`), Thẻ hệ thống (Tags) và Trường tùy chỉnh (`custom-fields` với icon `Sliders`). Icon V2 phải đi qua registry `src/v2/shared/components/atoms/v2-icon/icons.ts`. `currentBranchId` (persist localStorage `erp-app`) được hook `useEnsureValidCurrentBranch` (`src/core/components/layout/hooks/`) đưa về chi nhánh đầu khi không còn hợp lệ; hook này được gọi trong `V2ShellLayout` và `Topbar`.
  - **Sidebar Navigation Chuẩn Atomic**: Menu `GARAGE` và `KẾ TOÁN` được tổ chức thành các Organisms độc lập (`garage-nav-section`, `accounting-nav-section`) phẳng hóa submenu, mỗi file < 150 LoC, co-located tests và bảo vệ bởi RBAC tương ứng.
  - **Dark Classic Teal Scheme & Design Tokens (4-Tier Depth)**: Theme `Classic Dark` tuân thủ mô hình 4 tầng chiều sâu phân lớp kết hợp sắc thái Teal Scheme: L0 Canvas (`--app-shell-bg: #121417`) -> L1 Shell Canvas (`--main-panel-bg: #16191f`, `--sidebar-bg: #15181e`) -> L2 Card/Table Surface (`--surface: #1d2129`) -> L3 Controls/TableHeader/Inputs (`--surface-hover: #252b34`, `--table-header-bg`). Accent thương hiệu chính mang sắc Teal/Mint (`--primary: #14b8a6`, `--primary-fg: #ffffff`, `--primary-accent: #2dd4bf`), Active menu sidebar nhận tint teal (`--sidebar-active-bg: rgba(20,184,166,0.12)`, text `#2dd4bf`), Data Table spreadsheet cell border dùng `dark:border-white/[0.04]`, các khối Card/Table nổi lên nhờ Soft Ambient Shadow (`0 10px 30px -4px rgba(0,0,0,0.5)`).
  - **V2 Standard Drawer Dark Theme**: Vỏ Drawer (`V2DrawerSheet`) nổi khối dạng floating card với deep ambient shadow đa tầng `dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]`, overlay tối sâu có blur nhẹ (`dark:bg-black/60 dark:backdrop-blur-[2px]`). Header/Footer viền mỏng `dark:border-white/[0.06]`, icon drawer mang sắc Teal (`text-teal-400`), section background `#20242e`, count badge nhận Teal tint và action button Primary trong footer dùng màu Teal rực rỡ (`bg-teal-500 hover:bg-teal-600 shadow-[0_2px_12px_rgba(20,184,166,0.35)]`).
- Khi cần quét mới hoặc cập nhật tài liệu cho một module: Sử dụng skill `scan-module-knowledge` (`.agents/skills/scan-module-knowledge/SKILL.md`).

## Team-scale reminders

- Use `must` only for standards already enforced in this repo; use `prefer` for target-direction conventions.
- Keep page boundaries clean: page -> domain hook/query -> domain components -> shared primitives.
- If a new helper/component is created instead of reusing one, note the reason in the task artifact.
- A frontend task is not done until validation evidence and commit/push status are recorded.

