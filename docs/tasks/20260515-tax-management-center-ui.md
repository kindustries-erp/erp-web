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
- [ ] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
  - [ ] 3.1 Tab Xuất hóa đơn
  - [ ] 3.2 Tab Hóa đơn bán ra
  - [ ] 3.3 Tab Hóa đơn mua vào
  - [ ] 3.4 Tab Cấu hình hợp nhất
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result:
- `npx tsc --noEmit`:
- Smoke test:

## Lessons Learned
- Không có issue / hoặc link entry: `docs/lessons-learned/<file>.md#<anchor>`

## Commit/Push Status
- Web repo:
- API repo:
- DB/directus staging: apply+verify+document (no code push required)
