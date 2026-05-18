# Task: AR Workbench invoice 500 + dropdown counterparty + clarify Workbench vs Sổ công nợ (ERP PLAN mode)

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX + ENHANCE
- Mục tiêu:
  1. Tạo invoice trong AR Workbench bị 500 error.
  2. Trong AR Workbench, modal Phiếu thu và modal Phiếu đặt cọc phải dùng dropdown list thay vì nhập tay counterparty_id.
  3. Làm rõ AR Workbench và tab Sổ công nợ là cùng hay khác vì gây nhầm.
- Bối cảnh/ngữ cảnh:
  - User báo lỗi runtime khi tạo invoice.
  - UX hiện tại còn nhập UUID tay ở một số modal AR Workbench.
  - Cần rõ ràng về ranh giới chức năng giữa flow mới và flow legacy.

## Goal

Lập kế hoạch DB-first để sửa lỗi tạo invoice, chuẩn hóa UI chọn đối tác theo pattern Tiền mặt, và làm rõ chức năng Workbench vs Legacy mà không phá flow dữ liệu hiện có.

## Scope

- In-scope:
  - Điều tra nguyên nhân 500 tại flow `POST /api/v1/ar-workbench/sales-invoices`.
  - Chuẩn hóa 2 modal AR Workbench (Phiếu thu, Đặt cọc) sang dropdown đối tác.
  - Bổ sung copy/UI clarity cho phân tách Workbench vs Sổ công nợ hiện tại.
  - Validation build/type/smoke cho route `/phai-thu`.
- Out-of-scope:
  - Thiết kế lại toàn bộ AR module.
  - Thay đổi nghiệp vụ kế toán ngoài 3 mục nêu trên.
  - Migrate/xóa dữ liệu lịch sử tab legacy.

## Relevant Files

- Web
  - `src/pages/PhaiThu.tsx` - hiện có 2 tab và copy “Flow mới chạy song song...”.
  - `src/modules/finance/components/ArWorkbenchPanel/index.tsx` - UI tab invoice + sales-invoice drawer.
  - `src/modules/finance/components/ArWorkbenchPanel/PaymentReceiptsTab.tsx` - modal Phiếu thu hiện nhập tay `counterparty_id`.
  - `src/modules/finance/components/ArWorkbenchPanel/CustomerAdvancesTab.tsx` - modal Đặt cọc cần đồng bộ dropdown đối tác.
  - `src/modules/finance/components/CashVoucherDrawer/index.tsx` - nguồn pattern tái dùng (Combobox partner).
  - `src/modules/finance/api/financeApi.ts` - AR API contracts used by UI.
- API
  - `src/ar-workbench/ar-workbench.controller.ts` - endpoint sales invoice/payment/advance.
  - `src/ar-workbench/ar-workbench.service.ts` - logic createSalesInvoice/createPaymentReceipt/createCustomerAdvance.
  - `src/ar-workbench/dto/create-ar-sales-invoice.dto.ts` - validate input hóa đơn.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `ar_documents`, `ar_document_lines`, `payment_vouchers`, `ar_applications`, `business_partners`, `chart_of_accounts`, `journal_entries`, `journal_entry_lines`.
- Data nền cần có:
  - Có business partner hợp lệ để chọn từ dropdown.
  - Có chart_of_accounts tối thiểu cho 131/511/3331 và 111/112 phục vụ AR invoice/receipt/advance flows.
- Constraint/index/default cần có:
  - AR invoice path cần tạo được `ar_documents` + `ar_document_lines` và post sang JE.
  - Payment/advance path cần lưu `payment_vouchers` với snapshot counterparty fields.
- Kết quả: `DB_READY`
- Evidence precheck (read-only):
  - Đã kiểm tra `/fields/<collection>` qua Directus cho 8 collections nêu trên, tất cả trả `EXISTS`.
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging):
  - N/A

## UI consistency mandate mapping (Cash -> AR/AP)

- Partner picker:
  - Hiện tại
    - AR Workbench Phiếu thu: `input` tay `counterparty_id`.
    - AR Workbench Đặt cọc: cần xác nhận và đồng bộ cùng pattern.
  - Tái dùng
    - `Combobox` + option list đối tác theo pattern `CashVoucherDrawer` (external counterparty).
- Search/filter/select/date/modal shell:
  - Giữ `SearchInput`, `Combobox`, `DatePicker`, `DrawerModal/DrawerField/DrawerSection` đồng nhất với flow Tiền mặt.
- Data compatibility:
  - Chỉ thay UX chọn đối tác (ID vẫn là source-of-truth payload), không đổi schema payload lõi.

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
  - [ ] 2.1 Reproduce 500 với payload tối thiểu và capture directus/api error chi tiết
  - [ ] 2.2 Sửa root-cause tại `createSalesInvoice`/DTO/service mapping
  - [ ] 2.3 Verify create invoice thành công và không phá post/reverse path
- [ ] 3.0 UI gate done
  - [ ] 3.1 Đổi modal Phiếu thu sang dropdown đối tác (không nhập tay UUID)
  - [ ] 3.2 Đổi modal Đặt cọc sang dropdown đối tác (không nhập tay UUID)
  - [ ] 3.3 Bổ sung UI clarity Workbench vs Sổ công nợ (label/help text) để tránh nhầm
- [ ] 4.0 Validation
  - [ ] 4.1 API `npm run build`
  - [ ] 4.2 Web `npx tsc --noEmit`
  - [ ] 4.3 Smoke `/phai-thu` + tạo invoice + mở 2 modal dropdown
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result:
  - `ar_documents, ar_document_lines, payment_vouchers, ar_applications, business_partners, chart_of_accounts, journal_entries, journal_entry_lines: EXISTS`.
- `npx tsc --noEmit`:
  - PLAN mode: chưa chạy (chưa code).
- Smoke test:
  - PLAN mode: chưa chạy (chưa code).

## Risk + Rollback

- Risk:
  - Thay input -> dropdown có thể ảnh hưởng flow nhập nhanh khi chưa load options.
  - Fix 500 có thể động vào mapping fields bắt buộc của Directus.
- Rollback:
  - Revert commit web/api tương ứng.
  - Không có thay đổi schema ở scope hiện tại; nếu phát hiện DB gap sẽ tách DB task riêng theo gate.

## Lessons Learned

- Chưa phát sinh (PLAN mode).

## Commit/Push Status

- Web repo: PLAN mode, chưa thay đổi code.
- API repo: PLAN mode, chưa thay đổi code.
- DB/directus staging: precheck read-only, không apply schema/data.

## Kế hoạch thực thi ngắn (DB -> API -> UI)

1. API gate: reproduce 500 + bắt lỗi chi tiết + sửa root cause create invoice.
2. UI gate: thay 2 modal sang dropdown counterparty theo pattern Cash.
3. UI clarity gate: làm rõ “Workbench mới” vs “Sổ công nợ hiện tại” bằng copy/tooltip trạng thái use-case.
4. Validation gate: build/typecheck/smoke route + smoke create invoice/receipt/advance.
5. Close gate: lessons (nếu có), commit/push web+api, cập nhật evidence task.

## Sẵn sàng thực thi

Đã có plan + Gate 0 = DB_READY. Nếu bạn xác nhận, mình sẽ chuyển sang execution theo đúng gate DB -> API -> UI và update checklist realtime.
