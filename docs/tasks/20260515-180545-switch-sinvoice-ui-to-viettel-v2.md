# Task: Switch SInvoice UI surface to Viettel v2.49

## Request Input (bạn chỉ cần điền phần này)
- Type: ENHANCE
- Mục tiêu: Chuyển hẳn UI Hóa đơn điện tử sang dùng surface `sinvoice` mới đã được remap sang Viettel v2.49, không cần toggle; giữ legacy v1 chỉ để backend tham chiếu/comment lại.
- Bối cảnh/ngữ cảnh: User đã duyệt thực thi. API scope đi kèm là đổi default route `sinvoice` sang Viettel v2.49. UI phải phản ánh đúng draft-only safety, không thêm toggle, không mở actions phát hành/ký số.

## Goal
Đảm bảo ERP Web dùng đúng contract sau khi backend `sinvoice` chuyển hẳn sang Viettel v2.49, đồng thời giữ UX an toàn draft-only và không làm hỏng các tab tax portal hiện có.

## Scope
- In-scope:
  - Rà `HoaDonDienTu.tsx`, `SinvoiceDraftModal`, `sinvoiceApi.ts`
  - Cập nhật text/flow để surface `sinvoice` thể hiện là Viettel v2 draft-only
  - Giữ nguyên tab Hóa đơn bán ra / Hóa đơn mua vào đang dùng tax portal hiện tại
  - Build, smoke, commit, push nếu có đổi web
- Out-of-scope:
  - Thêm toggle chọn v1/v2
  - Mở action ký số/phát hành/xóa thật
  - Đổi schema DB/directus

## Relevant Files
- `src/pages/HoaDonDienTu.tsx` - page orchestration Hóa đơn điện tử
- `src/modules/accounting/api/sinvoiceApi.ts` - API contract client
- `src/modules/accounting/components/SinvoiceDraftModal.tsx` - shared modal draft-only

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `einvoices`
  - `sinvoice_configs`
  - `tax_portal_configs`
- Data nền cần có:
  - backend `sinvoice` routes vẫn mount và trả được health/local/create/config/tax-portal
  - `einvoices` vẫn lưu draft nội bộ và tax-portal records như trước
- Constraint/index/default cần có:
  - `status` default `DRAFT`
  - không cần schema mới cho pass UI này
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result:
  - `DB_READY` theo task API và trạng thái schema/config hiện có
- `npx tsc --noEmit`:
  - pending
- Smoke test:
  - pending

## Lessons Learned
- Không có issue

## Commit/Push Status
- Web repo: pending
- API repo: pending
- DB/directus staging: apply+verify+document (no code push required)
