# Task: Trung tâm Quản lý Thuế UI

## Request Input (bạn chỉ cần điền phần này)
- Type: FEATURE
- Mục tiêu: Gộp các nghiệp vụ thuế vào 1 trang quản lý chung, vẫn giữ tab Xuất hóa đơn SInvoice và thêm tab hóa đơn bán ra/mua vào/cấu hình.
- Bối cảnh/ngữ cảnh: API xuất hóa đơn là SInvoice Viettel; API lấy hóa đơn đầu vào/đầu ra là tài khoản Tổng cục Thuế khác biệt. User muốn quản lý tập trung bằng tabs.

## Goal
Biến trang `Hóa đơn điện tử` hiện tại thành trung tâm quản lý thuế có 4 tabs: Xuất hóa đơn, Hóa đơn bán ra, Hóa đơn mua vào, Cấu hình.

## Scope
- In-scope:
  - Refactor `src/pages/HoaDonDienTu.tsx` thành layout tab.
  - Tách API client phục vụ tax portal config/sync/list.
  - Hiển thị tập trung dữ liệu `SINVOICE` và `TAX_PORTAL` với filter theo nguồn/hướng.
- Out-of-scope:
  - Tự động hạch toán từ hóa đơn thuế vào bút toán.
  - OCR/PDF parsing chi tiết.

## Relevant Files
- `src/pages/HoaDonDienTu.tsx` - trang orchestration chính
- `src/modules/accounting/api/sinvoiceApi.ts` - API SInvoice hiện hữu
- `src/modules/accounting/api/taxPortalApi.ts` - API tax portal mới

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `einvoices.source`, `einvoices.direction`, `einvoices.tax_status`
  - `tax_portal_configs`
- Data nền cần có:
  - Có ít nhất 1 config SInvoice và khả năng tạo config Tax Portal.
- Constraint/index/default cần có:
  - `einvoices_source_chk`, `einvoices_direction_chk`, indexes source/direction.
- Kết quả: `DB_GAP_FOUND`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `../liouni-erp-api/docs/tasks/20260515-integration-viettel-sinvoice-in-out.md`

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Tab Xuất hóa đơn
  - [x] 3.2 Tab Hóa đơn bán ra
  - [x] 3.3 Tab Hóa đơn mua vào
  - [x] 3.4 Tab Cấu hình hợp nhất
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result: dùng schema mới `tax_portal_configs` + `einvoices.source/direction/tax_status` từ Gate 0 DB task; có backup và verify Directus fields.
- `npx tsc --noEmit`: PASS.
- Smoke test: PASS. Trang `Hóa đơn điện tử` hiển thị đủ 4 tab; KPI cập nhật `Hóa đơn bán ra=3`, `Hóa đơn mua vào=1`, `Nguồn cổng thuế=2`; tab `Hóa đơn bán ra` hiển thị invoice `TOUT-*`; tab `Hóa đơn mua vào` hiển thị invoice `TIN-*`; tab `Cấu hình` render đủ 2 form và web bundle mới chứa marker message `Lưu cấu hình cổng thuế thành công.` / `Lưu cấu hình SInvoice thành công.` sau redeploy.

## Lessons Learned
- UI config/save cho tax portal phụ thuộc backend singleton semantics của Directus; khi backend sửa đúng `PATCH /items/tax_portal_configs`, UI hoạt động lại mà không cần đổi contract phía frontend.
- Sau khi user bấm Lưu cấu hình, UI phải hiển thị trạng thái hai pha: lưu thành công và kiểm tra kết nối thành công/thất bại. Nếu chỉ báo “lưu thành công” sẽ gây hiểu nhầm là đã kết nối được tới Viettel/CQT.

## Commit/Push Status
- Web repo: pushed `566d454` (`feat: show config connection status`); trước đó có `935eb1d` (`feat: add tax management center tabs`) và `4e2cca9` (docs evidence)
- API repo / DB task ref: API pushed `79c633f` (`feat: add config connection checks`); trước đó có `7cd7805` (`feat: add tax portal invoice center flow`) và `c0f239d` (docs evidence); DB task `/opt/repos/liouni-erp-api/docs/tasks/20260515-integration-viettel-sinvoice-in-out.md`
- DB/directus staging: apply+verify+document (no code push required)
