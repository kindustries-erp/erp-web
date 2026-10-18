# Business Partners trên ERP Web V2

RequestFeedback: false

## Web Frontend

- [x] **Task 3.1.1: Tạo domain/API/query V2**
  - **DoD**: một module dùng chung CUSTOMER/VENDOR; query V2 ánh xạ đầy đủ hợp đồng API server-side.
  - **Verification**: `bunx vitest run src/v2/modules/business-partners/api/businessPartnersApi.test.ts`
- [x] **Task 3.2.1: Xây bảng và page Business Partner V2**
  - **DoD**: 11 cột, desktop spreadsheet, mobile cards, filter/search/sort/page, preset tương thích V1.
  - **Verification**: `bunx vitest run src/v2/modules/business-partners/tests/integration/BusinessPartnersPage.test.tsx`
- [x] **Task 3.3.1: Xây drawer form và confirm delete**
  - **DoD**: xem/tạo/sửa/xóa mềm, sinh mã, dirty guard, ba section và mutation refresh.
  - **Verification**: `bunx vitest run src/v2/modules/business-partners/tests/integration/BusinessPartnersPage.test.tsx`
- [x] **Task 3.2.2: Gắn route, RBAC và menu mobile Danh mục**
  - **DoD**: `/v2/customers`, `/v2/suppliers`, ẩn route/action theo quyền; mobile truy cập qua Danh mục.
  - **Verification**: `bunx vitest run src/v2/app/router/v2RouteConfig.test.ts src/v2/app/layouts/v2-app-layout/v2Navigation.test.ts`

## QC & Knowledge

- [x] **Task 4.1.1: Final Gate Web** — `build -> check:style -> full test` PASS trên working tree; wrapper `verify:final` yêu cầu commit sạch.
- [x] **Task 4.3.1: Cập nhật module skill và walkthrough**

## Session Checkpoint

- **Active Task**: Không còn task đang thực hiện.
- **Branch**: `erp-master` (behind remote 1 commit lúc bắt đầu)
- **Verification**: 32 scoped Vitest tests PASS; build/style PASS; full suite 479 files, 2.092 tests PASS, 12 skipped.

---

# Bugfix Garage Debts: Tinh gọn bảng Phải trả và bố trí lại card Thu KH/Thu BH

RequestFeedback: false

## Gates

- [x] **Task 1.1.1: Xác nhận DB Gate**
  - **Kết quả**: `DB_READY`; thay đổi chỉ thuộc UI, không cần schema/migration.
- [x] **Task 2.1.1: Xác nhận API Gate**
  - **Kết quả**: API hiện có đủ breakdown phải thu/phải trả; giữ nguyên contract.

## Web Frontend

- [x] **Task 3.2.1: Điều kiện hóa cột bảng phân loại**
  - **Files**: `MonthClassificationTable.tsx`
  - **DoD**: Bảng phải trả chỉ còn cột tổng; bảng phải thu giữ breakdown hóa đơn.
  - **Verification**: `bunx tsc --noEmit`
- [x] **Task 3.3.1: Chuyển card Thu KH/Thu BH sang right panel theo tab**
  - **Files**: `GarageMonthDetailDrawer.tsx`, `MonthPayerKpiGrid.tsx`
  - **DoD**: Card chỉ nằm trong right panel của tab Đối tượng HĐ và xếp dọc.
  - **Verification**: `bunx tsc --noEmit`
- [x] **Task 3.3.2: Bổ sung test hồi quy**
  - **Files**: Tests gần component bị ảnh hưởng.
  - **DoD**: Khóa hành vi cột và vị trí card theo tab.
  - **Verification**: Scoped Vitest.

## QC & Knowledge

- [x] **Task 4.1.1: QC toàn diện**
  - **Verification**: `bun run build && bun run check:ci && bun run test`
- [x] **Task 4.3.1: Đồng bộ tài liệu**
  - **Files**: `walkthrough.md`, module skill `garage-dashboard`.

## Session Completion

- **Active Task**: Không còn task đang thực hiện.
- **Verification gần nhất**: Build + check:ci + full test PASS (434 files, 1.875 tests; 2 files/12 tests skipped).
- **Branch**: `erp-master`
- **DB/API**: Không thay đổi.

---

# Enhance Garage Month Detail Drawer theo chuẩn Standardize Drawer

- [x] **Task 1.1.1: Xác nhận DB/API Gate** — `DB_READY`, `API_READY`; giữ nguyên contract.
- [x] **Task 3.2.1: Chuẩn hóa hai bảng thành DrawerSection độc lập**
  - **Files**: `GarageMonthDetailDrawer.tsx`, `MonthClassificationTable.tsx`
  - **Verification**: `bunx tsc --noEmit`
- [x] **Task 3.2.2: Tách cột Số phiếu**
  - **Verification**: Scoped Vitest của `MonthClassificationTable`
- [x] **Task 3.2.3: Làm rõ nét table header**
  - **Verification**: Component test + kiểm tra light/dark
- [x] **Task 3.3.1: Tinh gọn right panel và đổi tên tab**
- [x] **Task 3.3.2: Dọn model UI cũ không còn sử dụng**
- [x] **Task 4.1.1: Test và QC toàn diện** — build, check:ci, full suite và scoped regression pass.
- [x] **Task 4.3.1: Đồng bộ tài liệu**

## Session Checkpoint

- **Active Task**: Không còn task đang thực hiện.
- **Branch**: `erp-master`
- **DB/API**: Không thay đổi.
- **Verification**: `bun run build` PASS; `bun run check:ci` PASS; `bun run test` PASS (434 files, 1,876 tests passed, 12 skipped); scoped drawer tests PASS (2 files, 6 tests).

---

# Chuẩn hóa bảng Garage Month Detail Drawer

- [x] Header ngắn gọn + tooltip, giữ nguyên breakdown và cột Số phiếu.
- [x] Giới hạn vùng bảng khoảng 5 dòng, hỗ trợ cuộn dọc/ngang scoped.
- [x] Pagination client-side riêng cho Thu khách hàng/Thu bảo hiểm, mặc định 5 dòng, options 5/10/20.
- [x] Bổ sung regression test pagination và chạy QC.

## Verification mới nhất

- `bunx vitest run` scoped: 3 files, 7 tests passed.
- `bunx tsc --noEmit` PASS.
- `bun run build` PASS.
- `bun run check:ci` PASS.
- `bun run test` PASS: 435 files, 1,877 tests passed, 12 skipped.

---

# Garage Drawer: tách bảng Thu KH/Thu BH

- [x] Tách Thu khách hàng và Thu bảo hiểm thành hai `DrawerSection` độc lập.
- [x] Dùng chung `DataTable`/style với bảng chi tiết tháng, có scroll scoped và header đồng nhất.
- [x] Ép cột Loại nghiệp vụ căn trái.
- [x] Scoped tests và full QC pass.
