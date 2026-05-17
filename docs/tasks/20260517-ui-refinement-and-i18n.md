# Task: UI Refinement and i18n Updates

## Request Input
- Type: ENHANCE
- Mục tiêu: Hoàn thiện giao diện TabBar, rút ngắn URL paths, cập nhật breadcrumbs và thêm i18n.
- Bối cảnh/ngữ cảnh: Theo yêu cầu của user về việc tối ưu UI, đổi tên menu, rút ngắn URL và xử lý breadcrumbs động.

## Goal
Tối ưu hóa trải nghiệm người dùng, đảm bảo tính nhất quán của giao diện và hỗ trợ đa ngôn ngữ đầy đủ.

## Scope
- In-scope:
  - Cập nhật bóng đổ của TabsList trong `PageWithTabsLayout.tsx`.
  - Rút ngắn URL paths trong `pageUrl.ts` (cong-no, thiet-lap).
  - Thêm i18n cho `appStore.ts` và đồng bộ với `TabBar.tsx`.
  - Xử lý breadcrumbs động cho các trang có tab (Đối tác, Nhân sự, Thiết lập).
  - Sửa breadcrumb cho trang Tài liệu và Hóa đơn.
- Out-of-scope:
  - Thay đổi logic nghiệp vụ.

## Relevant Files
- `src/shared/components/PageWithTabsLayout.tsx`
- `src/shared/utils/pageUrl.ts`
- `src/core/config/appStore.ts`
- `src/core/components/layout/TabBar.tsx`
- `src/core/locale/vi.ts`
- `src/core/locale/en.ts`
- `src/pages/DoiTac.tsx`
- `src/pages/NhanSu.tsx`
- `src/pages/ThietLapQuy.tsx`

## Gate 0 — DB Precheck (bắt buộc)
- Kết quả: `DB_READY` (Không liên quan đến DB).

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence
- `npx tsc --noEmit`: Đã chạy và không có lỗi.
- Smoke test: Đã kiểm tra trực quan các thay đổi.

## Lessons Learned
- Không có issue.

## Commit/Push Status
- Web repo: Done
