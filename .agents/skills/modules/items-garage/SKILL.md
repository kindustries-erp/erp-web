# items-garage (web)

Gợi ý mã hàng từ danh mục garage cho bảng dòng chứng từ. Ghi nhận 2026-11-12.

## 1. Cấu trúc
- `src/v2/shared/context/LineItemCodeFieldContext.tsx`: `LineItemCodeInput` (ô mã mặc định `V2Input`) và `LineItemCodeFieldProvider` để module thay ô mã. Dùng trong `ProcurementLinesEditor` (PR/PO) và `GoodsReceiptLinesTable`. Module erp không bọc provider nên không đổi hành vi.
- `src/v2/modules/items-garage/`: `listGarageItemOptions(search)` (`GET /api/v2/items-garage`, cần `garage_items:read`) và `GarageItemCodeField` (V2Input + `datalist`, debounce 250ms, từ 2 ký tự).

## 2. Hành vi
- Gõ tự do; mã chưa có sẽ được API tạo khi lưu chứng từ (`source = MANUAL`).
- Gõ đúng một mã gợi ý thì điền tên (và đơn vị ở phiếu nhận hàng) nếu ô đang trống, không ghi đè.
- Bọc provider ở `GarageProcurementRequestsPage` (PR, PO) và `GarageGoodsReceiptsPage`.

## 3. Lưu ý
- Thiếu quyền đọc danh mục: truy vấn lỗi, ô vẫn nhập tay bình thường (`retry: false`).
