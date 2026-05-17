# Task: Reorder Sidebar Menu and Rename "Thiết lập danh mục"

## Request Input
- Type: ENHANCE
- Mục tiêu: Sắp xếp lại menu sidebar và đổi tên "Thiết lập danh mục" thành "Thiết lập".
- Bối cảnh/ngữ cảnh: Theo yêu cầu của người dùng để tối ưu hóa trải nghiệm người dùng.

## Goal
- Đưa menu "Công nợ" lên trên "Hóa đơn điện tử".
- Đưa menu "Thiết lập danh mục" xuống dưới "Tài liệu đính kèm".
- Đổi tên "Thiết lập danh mục" thành "Thiết lập".

## Scope
- In-scope:
  - `src/core/components/layout/Sidebar.tsx`
  - `src/core/locale/vi.ts`
- Out-of-scope: Các file khác.

## Relevant Files
- `src/core/components/layout/Sidebar.tsx` - Nơi định nghĩa thứ tự menu.
- `src/core/locale/vi.ts` - Nơi định nghĩa nhãn "Thiết lập danh mục".

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan: Không
- Data nền cần có: Không
- Constraint/index/default cần có: Không
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [x] 3.0 UI gate done
  - [x] Đưa "Công nợ" lên trên "Hóa đơn điện tử"
  - [x] Đưa "Thiết lập danh mục" xuống dưới "Tài liệu đính kèm"
  - [x] Đổi tên "Thiết lập danh mục" thành "Thiết lập" trong `vi.ts`
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: OK (Exit code 0)
- Smoke test: Code changes verified by type check.

## Lessons Learned
- Không có issue / hoặc link entry:

## Commit/Push Status
- Web repo:
- API repo:
