# Task: FIX settings pages i18n + URL slug + breadcrumb + layout consistency

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu:
  1. Fix bug i18n translation cho 2 page `thietlap-quy` và `thietlap-nh`.
  2. Đổi URL page thành slug chuẩn: `thiet-lap-quy`, `thiet-lap-ngan-hang`, `thiet-lap-tai-khoan`.
  3. Fix breadcrumb cho các page trên, tham khảo pattern page `tien-mat`.
  4. Căn layout tổng thể 3 page mới theo pattern `tien-mat`: bỏ `max-width`, nhưng phải đảm bảo responsive.
- Bối cảnh/ngữ cảnh:
  - Hiện tại route key nội bộ là `thietlap-quy|thietlap-nh|thietlap-tk`, URL slug public chưa theo chuẩn gạch nối đầy đủ.
  - 2 page `Quỹ` và `Ngân hàng` còn lỗi/thiếu i18n key hiển thị.
  - Breadcrumb của nhóm Thiết lập chưa đồng nhất hành vi với page `tien-mat`.
  - 3 page mới đang dùng wrapper `max-w-[1400px]`, user muốn full-width theo shell hiện có.

## Goal

Hoàn tất kế hoạch chi tiết theo gate DB -> API -> UI để sửa i18n + slug URL + breadcrumb + layout cho các page Thiết lập, không làm thay đổi DB schema/API contract và không gây regression điều hướng.

## Scope

- In-scope:
  - `src/core/locale/{vi,en}.ts`
  - `src/modules/settings/components/{QuyTab,NHTab,TKTab}.tsx`
  - `src/pages/{ThietLapQuy,ThietLapNganHang,ThietLapTaiKhoan}.tsx`
  - `src/shared/utils/pageUrl.ts`
  - `src/shared/types/index.ts` (nếu cần cập nhật key map/type hỗ trợ URL mapping)
  - `src/core/components/layout/Sidebar.tsx` (nếu cần sync navigate key)
  - `src/core/routing/index.ts`, `src/App.tsx` (nếu cần sync route key nội bộ)
  - Thành phần breadcrumb liên quan (trong `src/core/components/layout/*` hoặc nơi page `tien-mat` đang dùng)
- Out-of-scope:
  - Thay đổi DB schema / migration.
  - Thay đổi API contract backend.
  - Refactor module ngoài phạm vi Thiết lập & cơ chế breadcrumb liên quan.

## Relevant Files

- `src/core/locale/vi.ts` - nguồn i18n tiếng Việt cho settings.\*
- `src/core/locale/en.ts` - nguồn i18n tiếng Anh cho settings.\*
- `src/modules/settings/components/QuyTab.tsx` - text/label/table cho Quỹ
- `src/modules/settings/components/NHTab.tsx` - text/label/table cho Ngân hàng
- `src/modules/settings/components/TKTab.tsx` - tham chiếu namespace settings.tk để đồng bộ
- `src/pages/ThietLapQuy.tsx` - page wrapper/layout Quỹ
- `src/pages/ThietLapNganHang.tsx` - page wrapper/layout NH
- `src/pages/ThietLapTaiKhoan.tsx` - page wrapper/layout TK
- `src/shared/utils/pageUrl.ts` - map page key <-> URL slug
- `src/core/components/layout/Sidebar.tsx` - điều hướng menu Thiết lập
- `src/core/routing/index.ts` - route registry nội bộ
- `src/App.tsx` - render theo currentPage
- Files breadcrumb của page `tien-mat` - chuẩn tham chiếu hành vi UI/UX

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `cash_funds`
  - `bank_accounts`
  - `chart_of_accounts`
- Data nền cần có:
  - Có thể rỗng; cần đủ để render empty state không crash.
- Constraint/index/default cần có:
  - Không có yêu cầu mới cho task này.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Phân rã kế hoạch theo thứ tự DB -> API -> UI

### Gate 1 — DB (read-only verification)

1. Verify 3 collection nêu trên vẫn tồn tại và các field chính không đổi so với contract UI đang dùng.
2. Xác nhận task này không cần migration, không cần seed bắt buộc.
3. Chốt Gate 1 = `DB_READY`.
   Deliverable: ghi evidence DB precheck vào task.

### Gate 2 — API/workflow gate

1. Kiểm tra các API call trong `QuyTab/NHTab/TKTab` không phụ thuộc URL slug, chỉ phụ thuộc API endpoint/domain service.
2. Xác nhận việc đổi slug URL chỉ tác động layer routing (`pageUrl`, sidebar navigate, parse URL), không đổi request payload/response.
3. Chốt no-impact với backend workflow.
   Deliverable: ghi rõ "API contract unchanged" + file evidence.

### Gate 3 — UI gate

1. i18n fix:
   - Rà toàn bộ key đang hiển thị tại `QuyTab` và `NHTab`, đảm bảo dùng namespace `settings.quy.*` và `settings.nh.*` nhất quán.
   - Bổ sung key thiếu ở `vi.ts` và `en.ts` (title, desc, table headers, placeholders, errors...).
2. URL slug fix:
   - Cập nhật mapping URL thành:
     - `/thiet-lap-quy`
     - `/thiet-lap-ngan-hang`
     - `/thiet-lap-tai-khoan`
   - Giữ route key nội bộ ổn định (nếu không cần đổi), chỉ đổi slug public.
   - Đảm bảo deep-link + refresh + back/forward hoạt động đúng.
3. Breadcrumb fix:
   - So khớp pattern page `tien-mat` (cách đặt label, cấp breadcrumb, active segment).
   - Áp dụng đồng nhất cho 3 page Thiết lập.
4. Layout consistency + responsive:
   - Bỏ `max-width` wrapper ở 3 page mới để đồng bộ `tien-mat`.
   - Giữ spacing/padding theo shell chuẩn.
   - Verify responsive ở breakpoint mobile/tablet/desktop: không vỡ table/drawer/header.

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result:
  - `DB_READY` (task không yêu cầu thay đổi schema/data).
- `npx tsc --noEmit`:
  - Sẽ bổ sung sau khi thực thi.
- Smoke test:
  - Sẽ bổ sung sau khi thực thi.

## Risk + Rollback

- Risk 1: Đổi slug URL có thể làm mismatch giữa `pathToPage` và `pageToPath`, gây lỗi refresh/deep-link.
- Risk 2: Breadcrumb fix có thể ảnh hưởng các page dùng chung component breadcrumb.
- Risk 3: Bỏ `max-width` có thể gây tràn ngang ở table trên màn hình nhỏ.
- Rollback:
  - Tách commit theo cụm (i18n / URL / breadcrumb / layout) để revert từng phần nếu cần.
  - Nếu regression nghiêm trọng: revert toàn bộ commit task để quay về trạng thái ổn định trước đó.

## Danh sách evidence cần thu thập

1. Diff i18n (`vi.ts`, `en.ts`) thể hiện fix key cho `settings.quy` và `settings.nh`.
2. Diff routing URL (`pageUrl.ts`, nếu có file liên quan) thể hiện slug mới `thiet-lap-*`.
3. Diff breadcrumb implementation và ảnh hưởng sang 3 page Thiết lập.
4. Diff layout wrapper của 3 page (bỏ max-width, giữ responsive).
5. Kết quả `npx tsc --noEmit` pass.
6. Smoke test điều hướng:
   - Sidebar -> 3 page Thiết lập
   - Refresh tại từng URL mới
   - Back/forward browser
   - Breadcrumb click behavior
7. Commit hash + push status + evidence deploy (khi được phép thực thi/deploy).

## San sang thuc thi

Ke hoach da du chi tiet theo ERP PLAN mode (DB -> API -> UI), da co Gate 0 = `DB_READY`, checklist realtime, gate validations, risk/rollback va danh sach evidence.
Cho ban xac nhan "Thuc thi" de bat dau sua code/test/deploy.
