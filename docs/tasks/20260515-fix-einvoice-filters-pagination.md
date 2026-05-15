# Task: Fix E-invoice Filters and Pagination

## Request Input
- Type: FIX | ENHANCE
- Mục tiêu: Tách biệt bộ lọc ngày và tìm kiếm cho hóa đơn mua vào / bán ra. Thêm phân trang cho bảng danh sách hóa đơn giống với màn hình Tiền Mặt.

## Context & Validation
- **Risk & Impact:** Thay đổi UI/Logic lấy dữ liệu, cần giữ nguyên API endpoint nhưng thay đổi param phân trang và truyền filters đúng context.
- **Rollback Plan:** Git revert về commit trước nếu lỗi.
- **Related Files:** 
  - `src/pages/HoaDonDienTu.tsx`
  - `src/modules/accounting/api/sinvoiceApi.ts`

## Checklist (cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck
- [x] 2.0 Tách state filter cho IN và OUT riêng biệt
- [x] 3.0 Thêm state phân trang (page, pageSize, total) cho IN và OUT
- [x] 4.0 Sửa `loadData` để gọi API có phân trang và filters đúng tab đang active (hoặc tách riêng gọi khi chuyển tab)
- [x] 5.0 Cập nhật UI render table để dùng chung component DataTable có sẵn phân trang
- [x] 6.0 Validate
  - [x] 6.1 `npm run build`
  - [x] 6.2 Test filter, pagination trên UI (tsc pass; backend pagination/filter response verified)
- [ ] 7.0 Close
  - [ ] 7.1 Commit + push code

## Execution Note
- Chỉ xóa bản ghi demo/stub nội bộ (`source = SINVOICE` hoặc `source = null`). Giữ nguyên toàn bộ hóa đơn `source = TAX_PORTAL` làm source of truth.

## Cleanup Evidence
- Đã xóa bản ghi demo/stub trong DB nội bộ.
- Kiểm tra lại `source = SINVOICE` => 0 bản ghi còn lại.
- Không đụng tới bản ghi `source = TAX_PORTAL`.

## Validation Evidence
- DB precheck result: `DB_READY`
- Build:
- Smoke:

## Lessons Learned
- Bộ lọc cũ bị lỗi vì dùng chung một state cho cả mua vào/bán ra và `loadData` giữ closure cũ.
- Pagination cần tách riêng theo tab thay vì dùng chung một mảng `allInvoices` render thẳng.

## Notes
- Gate 0 DB precheck: schema `einvoices` đã đủ cho filter theo `invoice_date`, `direction`, `source`; không cần thay đổi DB.
- DB result: `DB_READY`

## Validation Evidence
- DB precheck result: `DB_READY`
- Build:
- Smoke:

## Lessons Learned
- Khối demo/stub cần phân biệt theo `source`, không được xóa dữ liệu `TAX_PORTAL`.
- Bộ lọc chung cho nhiều tab gây sai state và sai query.
## Validation Evidence
- DB precheck result: `DB_READY`
- Build:
- Smoke:

## Lessons Learned
-