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
  - **Hybrid Shell V2 Layout**: `V2ShellLayout` tại `src/core/components/layout/V2ShellLayout.tsx` đóng vai trò là App Shell chính thống của ERP Web, mang lại diện mạo V2 (Dual-Card Floating Background, V2Sidebar với collapsible 58px/210px, V2RightPanel với Frosted Glass Topbar và V2TabBar) cho toàn bộ các trang nghiệp vụ V1 thông qua 2 adapter `useV2AdaptedNavSections` và `useV2AdaptedTabs`. Menu `HỆ THỐNG` (`sec-settings`) quản lý đầy đủ các trang thiết lập và cấu hình bao gồm Hòm thư hệ thống, Người dùng & Tài khoản, Phân quyền vai trò, Nhật ký hoạt động, Chi nhánh, Thẻ hệ thống (Tags) và Trường tùy chỉnh (`custom-fields` với icon `Sliders`).
  - **Sidebar Navigation Chuẩn Atomic**: Menu `GARAGE` và `KẾ TOÁN` được tổ chức thành các Organisms độc lập (`garage-nav-section`, `accounting-nav-section`) phẳng hóa submenu, mỗi file < 150 LoC, co-located tests và bảo vệ bởi RBAC tương ứng.
- Khi cần quét mới hoặc cập nhật tài liệu cho một module: Sử dụng skill `scan-module-knowledge` (`.agents/skills/scan-module-knowledge/SKILL.md`).

## Team-scale reminders

- Use `must` only for standards already enforced in this repo; use `prefer` for target-direction conventions.
- Keep page boundaries clean: page -> domain hook/query -> domain components -> shared primitives.
- If a new helper/component is created instead of reusing one, note the reason in the task artifact.
- A frontend task is not done until validation evidence and commit/push status are recorded.

