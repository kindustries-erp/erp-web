# Task: Multi-modal stack offset 2.5% (Execution)

## Request Input

- Type: ENHANCE
- Mục tiêu: Khi mở nhiều modal cùng lúc, modal cũ giữ nguyên vị trí; modal mới slide trái tuần tự 2.5% (modal 2: 2.5%, modal 3: 5%, ...).
- Bối cảnh/ngữ cảnh: Case Nhan vien + Phan quyen, Tien gui + Phan quyen, Tien gui + Hach toan.

## Goal

Chuẩn hóa cơ chế stacked drawer tại shared DrawerModal để các flow nhiều modal dùng chung 1 thuật toán offset thay vì hardcode từng màn.

## Scope

- In-scope:
  - Shared DrawerModal stack orchestration.
  - Refactor call-sites đang hardcode stackOffset cho 3 case target.
- Out-of-scope:
  - Đổi schema DB.
  - Đổi API contract.

## Relevant Files

- src/shared/components/DrawerModal.tsx
- src/modules/hr/components/NhanSu/EmployeeDrawer.tsx
- src/modules/system/components/PermissionMatrixDrawer.tsx
- src/modules/finance/components/TienGui/BankVoucherDrawer.tsx

## Gate 0 — DB Precheck

- Collections/fields liên quan: none (UI-only).
- Data nền cần có: none.
- Constraint/index/default cần có: none.
- Kết quả: DB_READY
- Nếu DB_GAP_FOUND: N/A

## Checklist (realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (no change)
- [x] 3.0 UI gate done
- [ ] 4.0 Validation
  - [x] 4.1 npx tsc --noEmit
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code
  - [ ] 5.3 Tổng kết evidence
