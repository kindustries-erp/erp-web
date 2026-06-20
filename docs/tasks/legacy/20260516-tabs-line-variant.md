# Task — Thử nghiệm variant line cho component Tabs

## Request Input

- Type: ENHANCE
- Mục tiêu: Thử nghiệm variant line cho component Tabs theo yêu cầu của user.
- Bối cảnh/ngữ cảnh: User muốn đổi style tab sang dạng line (có đường gạch dưới) thay vì dạng pill/card mặc định.

## Goal

- Thêm hỗ trợ variant `line` cho component Tabs (có thể trong `tabs.tsx` dùng `cva` hoặc bọc trong `AppTabs`).
- Cập nhật trang Hóa đơn điện tử để dùng thử variant này.

## Scope

- In-scope:
  - Cập nhật style cho Tabs.
  - Áp dụng vào `HoaDonDienTu.tsx`.
- Out-of-scope:
  - Không làm vỡ layout hiện tại.

## Relevant Files

- `src/shared/components/ui/tabs.tsx` - nếu dùng cva
- `src/shared/components/AppTabs/index.tsx` - nếu xử lý ở wrapper
- `src/pages/HoaDonDienTu.tsx` - file sử dụng

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [ ] 3.0 UI gate done
  - [x] 3.1 Cập nhật component để hỗ trợ variant line
  - [x] 3.2 Áp dụng vào `HoaDonDienTu.tsx`
- [ ] 4.0 Validation
  - [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test (Skipped)
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue) - Không có issue
  - [x] 5.2 Commit + push code - Done

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: OK (Exit code: 0)
- Smoke test: Skipped (No visual environment)

## Lessons Learned

- Không có issue

## Commit/Push Status

- Web repo: Committed & Pushed (Commit: e036b5f)
- API repo: N/A
- DB/directus staging: N/A
