# Task: Cleanup Legacy Directus PO Import/Template Code

- **Date:** 2026-07-01
- **Mục tiêu:** Xóa các đoạn mã nguồn (dead-code) liên quan đến tính năng tải template và import file Excel Purchase Order (PO) từ thư mục `src/modules/manufacturing`. Các API liên quan đã không còn tồn tại trên NestJS Backend, và các tính năng này là của thiết kế cũ dựa trên Directus.
- **Phạm vi tác động:** Chỉ Frontend Web (repo `liouni-erp-web`), không ảnh hưởng Backend.
- **Bằng chứng kiểm tra (Gate 0):** API endpoint `/api/v1/erp-manufacturing/purchase-orders/template/download` không được cài đặt trên Backend, component UI không gọi `downloadPoTemplate` hay `importPoExcel`.

## Thay đổi chi tiết (UI Gate)
- **[MODIFY]** `src/modules/manufacturing/api/manufacturingApi.ts`
  - Đã xóa `interface PoImportResult`.
  - Đã xóa hàm `downloadPoTemplate`.
  - Đã xóa hàm `importPoExcel`.

## Đảm bảo chất lượng (QC)
- [ ] Build thành công (không có missing references hay syntax errors).
- [ ] Đã chạy linter và type check.
