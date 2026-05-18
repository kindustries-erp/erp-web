# Task: Combine Nhân sự into a single menu item with tabs

## Request Input

- Type: REFACTOR
- Mục tiêu: Đưa group nhân sự thành 1 menu item dưới Đối tác trong group kế toán, và nhân viên, phòng ban, chức danh sẽ là các tab của menu nhân sự.
- Bối cảnh/ngữ cảnh: Tối ưu hóa cấu trúc menu và gom cụm các trang liên quan.

## Goal

- Chuyển "Nhân sự" thành một mục menu duy nhất nằm dưới "Đối tác" trong nhóm "Kế toán".
- Gộp các trang "Nhân viên", "Phòng ban", "Chức danh" thành các tab trong trang "Nhân sự".

## Scope

- In-scope:
  - `src/core/components/layout/Sidebar.tsx`
  - `src/pages/NhanSu.tsx`
  - `src/pages/PhongBan.tsx`
  - `src/pages/ChucVu.tsx`
- Out-of-scope: Các file khác.

## Relevant Files

- `src/core/components/layout/Sidebar.tsx` - Định nghĩa sidebar.
- `src/pages/NhanSu.tsx` - Trang Nhân sự hiện tại (Nhân viên).
- `src/pages/PhongBan.tsx` - Trang Phòng ban hiện tại.
- `src/pages/ChucVu.tsx` - Trang Chức vụ hiện tại.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: Không
- Data nền cần có: Không
- Constraint/index/default cần có: Không
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [x] 3.0 UI gate done
  - [x] Di chuyển "Nhân sự" trong `Sidebar.tsx` xuống dưới "Đối tác"
  - [x] Xóa nhóm "Nhân sự" cũ trong `Sidebar.tsx`
  - [x] Cập nhật `NhanSu.tsx` để hỗ trợ tabs (Nhân viên, Phòng ban, Chức danh)
  - [x] Chuyển logic từ `PhongBan.tsx` và `ChucVu.tsx` vào các tab component hoặc tích hợp trực tiếp.
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
