# Task: Thử nghiệm Gom Page Dòng Tiền và dùng TabBar

## Request Input
- Type: ENHANCE
- Mục tiêu: Gom các page tổng hợp, tiền mặt, ủy nhiệm chi vào 1 page, và dùng tab để chuyển qua lại.
- Bối cảnh/ngữ cảnh: Thử nghiệm UI mới cho phần dòng tiền. Chỉ thử nghiệm, không commit và push code.

## Goal
Tạo một giao diện thử nghiệm gộp 3 trang (Tổng hợp, Tiền mặt, Tiền gửi/Ủy nhiệm chi) vào trang Dòng tiền, sử dụng component hoặc style tương tự `TabBar.tsx` để chuyển đổi giữa các tab.

## Scope
- In-scope:
  - Khảo sát file `src/pages/DongTien.tsx`, `src/pages/TienMat.tsx`, `src/pages/TienGui.tsx`.
  - Sửa đổi `src/pages/DongTien.tsx` để tích hợp 3 view và thêm tab.
  - Tái sử dụng hoặc mô phỏng style của `TabBar.tsx` cho phần tabs.
- Out-of-scope:
  - Sửa đổi DB hay API.
  - Commit và push code (tuân thủ yêu cầu user).

## Relevant Files
- `src/pages/DongTien.tsx` - Trang đích để gộp.
- `src/core/components/layout/TabBar.tsx` - Tham khảo style tabs.
- `src/pages/TienMat.tsx` - Tham khảo nội dung Tiền mặt.
- `src/pages/TienGui.tsx` - Tham khảo nội dung Tiền gửi/Ủy nhiệm chi.

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan: Không có (chỉ sửa UI)
- Data nền cần có: Có sẵn
- Constraint/index/default cần có: Có sẵn
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done (N/A)
- [ ] 3.0 UI gate done
  - [x] 3.1 Khảo sát và chuẩn bị code cho 3 view
  - [x] 3.2 Tạo giao diện Tabs trong `DongTien.tsx`
  - [x] 3.3 Tích hợp nội dung của 3 view vào các tab
  - [x] 3.4 Ẩn menu Tiền mặt, UNC trong Sidebar
  - [x] 3.5 Quản lý state tab qua URL và giữ mounted
- [ ] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow liên quan (Cần check lại trên trình duyệt)
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (Không có issue)
  - [x] 5.2 Commit + push code (Bỏ qua theo yêu cầu của user)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: Thành công (Exit code 0)
- Smoke test: Cần kiểm tra lại trực quan trên trình duyệt vì agent không có môi trường hiển thị.

## Lessons Learned
- Không có issue / hoặc link entry

## Commit/Push Status
- Web repo: Không commit/push (Thử nghiệm)
- API repo: N/A
- DB/directus staging: N/A
