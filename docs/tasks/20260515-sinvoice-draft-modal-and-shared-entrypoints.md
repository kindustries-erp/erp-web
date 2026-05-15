# Task: SInvoice Draft Modal và Shared Entry Points

## Request Input (bạn chỉ cần điền phần này)
- Type: FEATURE
- Mục tiêu: Chỉ cho phép tạo hóa đơn nháp trên UI, ẩn surface ký/phát hành, và tránh duplicate UI giữa Phải thu và Quản lý Thuế bằng shared modal.
- Bối cảnh/ngữ cảnh: Hiện tab Xuất hóa đơn chưa có form nhập liệu thực tế; user cũng có nút xuất hóa đơn ở trang công nợ nên cần shared UX thay vì 2 form riêng.

## Goal
Tạo một shared modal nhập liệu hóa đơn nháp dùng lại cho cả AR Workbench và trang Hóa đơn điện tử; tab Xuất hóa đơn chỉ còn surface tạo nháp an toàn.

## Scope
- In-scope:
  - Tạo shared modal/component cho draft invoice.
  - Gắn shared modal vào trang Hóa đơn điện tử và AR Workbench.
  - Ẩn/bỏ mọi CTA ký số/phát hành/demo flow trên UI xuất hóa đơn.
  - Hiển thị rõ trạng thái bản nháp và hướng test cho user.
- Out-of-scope:
  - Phát hành thật/ký số hóa đơn.
  - Thay đổi schema DB.
  - Đồng bộ hóa đơn đầu vào/đầu ra từ cổng thuế.

## Relevant Files
- `src/pages/HoaDonDienTu.tsx` - trang trung tâm thuế hiện tại, đang chứa tab Xuất hóa đơn.
- `src/modules/accounting/api/sinvoiceApi.ts` - API client e-invoice frontend.
- `src/pages/PhaiThu.tsx` - entry page của AR Workbench.
- `src/modules/finance/components/ArWorkbenchPanel/index.tsx` - nơi gắn entry point "Xuất hóa đơn nháp" từ công nợ.

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `einvoices.status`
  - `einvoices.direction`
  - `einvoices.source`
- Data nền cần có:
  - Đã có cấu hình SInvoice hợp lệ trong singleton `sinvoice_configs`.
  - Collection `einvoices` vẫn nhận được record draft từ API.
- Constraint/index/default cần có:
  - Không đổi schema; chỉ yêu cầu API persist được `status=DRAFT`, `source=SINVOICE`, `direction=OUT`.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): không áp dụng.

## Checklist (bắt buộc cập nhật realtime)
- [ ] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
  - [ ] 3.1 Tạo shared draft modal/component
  - [ ] 3.2 Gắn entry point tại Quản lý Thuế
  - [ ] 3.3 Gắn entry point tại AR Workbench với prefill
  - [ ] 3.4 Ẩn/bỏ CTA ký số/phát hành/demo flow
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
