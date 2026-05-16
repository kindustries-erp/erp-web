# Task — Branch master data rollout phase 1 branch tab

## Request Input (bạn chỉ cần điền phần này)
- Type: ENHANCE
- Mục tiêu: Bổ sung tab cấu hình Chi nhánh trong Thiết lập danh mục để CRUD branch master data.
- Bối cảnh/ngữ cảnh: BranchSelect đã được nhúng vào form nghiệp vụ nhưng chưa có màn hình riêng để tạo/sửa chi nhánh trên UI.

## Goal
Thêm tab "Chi nhánh" trong khu vực Thiết lập danh mục, cho phép xem danh sách, tạo mới, sửa, bật/tắt trạng thái chi nhánh bằng API `/api/v1/branches` đã có sẵn.

## Scope
- In-scope:
  - Tạo tab/màn hình quản lý chi nhánh trong Thiết lập danh mục
  - List branches + drawer tạo/sửa
  - Các field cơ bản: code, name, address, note, is_active
  - Đồng bộ i18n tối thiểu cho text hiển thị mới
  - Build + deploy + smoke check route liên quan
- Out-of-scope:
  - Phân quyền theo chi nhánh
  - Bulk import/export chi nhánh
  - Phase 2 required branch_id

## Relevant Files
- `src/modules/branches/api/branchApi.ts`
- `src/modules/branches/api/BranchSelect.tsx`
- `src/modules/settings/components/*`
- `src/pages/*` hoặc route/tab compose hiện hữu cho Thiết lập danh mục
- i18n locale files nếu cần

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `branches`
- Data nền cần có:
  - 3 chi nhánh seed `BR001`, `BR002`, `BR003`
- Constraint/index/default cần có:
  - unique branch code
  - fields code/name/address/note/is_active tồn tại và API `/api/v1/branches` hoạt động
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit` (đạt gián tiếp qua `npm run build`)
  - [x] 4.2 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: đạt gián tiếp qua `npm run build` PASS
- Smoke test: `curl -I http://127.0.0.1:8808/thiet-lap-quy?tab=branch` -> 200, `curl -I https://dev.erp.liouni.com/thiet-lap-quy?tab=branch` -> 200

## Lessons Learned
- Branch API web client ban đầu gọi sai endpoint legacy `/branches/*`; cần đồng bộ toàn bộ sang `/api/v1/branches` và dùng kiểu `PaginatedResponse<Branch>` cho danh sách/lookup.

## Commit/Push Status
- Web repo: pushed `master` at commit `48f08f8` (`feat: add branch catalog tab to ERP settings`)
- API repo: không đổi thêm ở task này
- DB/directus staging: đã sẵn sàng từ phase 1
