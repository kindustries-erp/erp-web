# Task: HĐĐT SInvoice Config Modal & DB Persistence

## Request Input

- Type: FEATURE
- Mục tiêu: Tạo Slide Modal cấu hình thông tin kết nối Viettel SInvoice, lưu vào DB và cho phép reset.
- Bối cảnh: Hiện tại thông tin kết nối đang bị fix cứng hoặc lỗi connection, cần cho phép user nhập URL, Username, Password thực tế.

## Goal

- Thêm UI Slide Modal (Config) trong trang Hóa đơn điện tử.
- API Backend lưu trữ/cập nhật cấu hình vào bảng `sinvoice_configs`.
- Hỗ trợ nút Reset/Xóa cấu hình.

## Scope

- In-scope: UI Modal, CRUD API cho Config, Persistence vào Postgres (via Directus).
- Out-of-scope: Xử lý lỗi connection reset của Viettel (sẽ làm sau khi có URL đúng).

## Relevant Files

- `liouni-erp-web/src/pages/HoaDonDienTu.tsx` - Thêm UI Modal
- `liouni-erp-api/src/sinvoice/sinvoice.controller.ts` - Thêm endpoint config
- `liouni-erp-api/src/sinvoice/sinvoice.service.ts` - Logic lưu DB qua Directus SDK

## Gate 0 — DB Precheck (bắt buộc)

- Collections: `sinvoice_configs` đã tồn tại.
- Fields: `api_url`, `username`, `password`, `supplier_tax_code`.
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend: API Endpoint GET/POST `/api/v1/sinvoice/config`
- [x] 3.0 Frontend:
  - [x] 3.1 Thêm `sinvoiceApi.ts` function cho config
  - [x] 3.2 Implement `ConfigModal` component
  - [x] 3.3 Gắn trigger nút "Cấu hình" trên trang HĐĐT
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Lưu thử config và reload trang xem có giữ data không
- [ ] 5.0 Close
  - [ ] 5.1 Commit + push code

## Validation Evidence

- DB precheck result: OK
- `npx tsc --noEmit`: DONE
- Smoke test: DONE

## San sang thuc thi

User vui lòng xác nhận kế hoạch trên.
