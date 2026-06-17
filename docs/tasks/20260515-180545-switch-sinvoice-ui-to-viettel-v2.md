# Task: Switch SInvoice UI surface to Viettel v2.49

> **HISTORICAL REFERENCE ONLY**
> Task này thuộc SInvoice / tax-portal / Directus-era finance flow cũ. Không dùng làm default implementation guidance cho lane `erp-master` hiện tại nếu user không mở lại scope finance legacy.


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
  - [x] 4.2 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence
- [x] 6.0 Final V2 cutover follow-up
  - [x] 6.1 Chuyển wording/UI IN/OUT từ cổng thuế sang Viettel v2.49
  - [x] 6.2 Giữ page size chỉ 15 / 30 / 50 và cảnh báo chunking theo tháng
  - [x] 6.3 Build + deploy + smoke runtime lại

## Validation Evidence

- DB precheck result:
  - `DB_READY` theo task API và trạng thái schema/config hiện có
- Build:
  - `npx tsc --noEmit` => exit 0
  - image build tại `/opt/stacks/liouni-erp-web` bằng `docker compose build --no-cache` => success
  - redeploy: `docker compose up -d` tại `/opt/stacks/liouni-erp-web` => success
- Smoke test:
  - container `liouni-erp-web` recreated và `Up`
  - bundle runtime trong container chứa marker mới:
    - `Đồng bộ Viettel v2.49`
    - `Cấu hình Viettel v2.49`
    - `Đồng bộ hóa đơn bán ra qua Viettel Tax Portal`
    - `Đồng bộ hóa đơn mua vào qua Viettel Tax Portal`
  - xác nhận page Hóa đơn điện tử đã đổi wording public-facing sang Viettel v2.49 draft-only, giữ nguyên tab tax portal và wording IN/OUT đã tách rõ khỏi luồng draft-only

## Lessons Learned

- API surface remap có thể làm lệch wording UI hàng loạt; giữ tên route/hàm nội bộ để tránh lan phạm vi refactor, chỉ đổi text public-facing và typing cần thiết.

## Commit/Push Status

- Web repo:
  - commit: `eeb4216` — `Align einvoice UI with Viettel v2 surface`
  - push: `origin/master` success
- API repo:
  - handoff dependency đã push ở API repo riêng
- DB/directus staging: không đổi schema; chỉ reuse state hiện có
