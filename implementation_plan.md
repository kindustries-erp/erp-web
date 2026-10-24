# Enhance Glassmorphism cho V2 Drawer

**Track**: `T1` — shared drawer visual refinement.
**RequestFeedback**: `false` — plan approved for implementation.

## Web Frontend

- [x] **Task 3.3.1: Đồng bộ drawer glass tokens light/dark và V1 fallback**
  - **DoD**: Sheet dùng blur 20px và shadow nhẹ theo theme; overlay blur 1px ở cả hai theme; light surface alpha 0.35, dark alpha 0.75, overlay alpha 0.2; fallback hoạt động trên route V1.
  - **Files**: `src/v2/shared/ui/sheet/sheet.tsx`, `src/v2/shared/styles/v2-theme.css`, `src/styles/panels.css`, `src/styles/themes/orcaq.css`
  - **Verification**: Scoped Sheet test và drawer desktop/mobile tests.
- [x] **Task 3.3.2: Khóa glass style contract bằng regression tests**
  - **DoD**: Sheet test xác nhận background token, blur/saturate/contrast classes, overlay dark tối thiểu và drawer marker; desktop/mobile drawer regressions pass.
  - **Files**: `src/v2/shared/ui/sheet/sheet.test.tsx`
  - **Verification**: `bunx vitest run src/v2/shared/ui/sheet/sheet.test.tsx src/v2/shared/components/organisms/v2-standard-drawer/desktop/V2StandardDrawer.desktop-content.test.tsx src/v2/shared/components/organisms/v2-standard-drawer/mobile/V2StandardDrawer.mobile.test.tsx`

## QC & Knowledge

- [x] **Task 4.1.1: Chạy typecheck và final gate checks**
  - **Verification**: Scoped (3 files/12 tests) và full suite (571 files/2,528 tests; 2 files/12 tests skipped) PASS; `bun run build`, `bun run check:ci` PASS. `verify:final` không gọi do yêu cầu worktree sạch sau commit/rebase.
- [x] **Task 4.3.1: Cập nhật drawer knowledge và walkthrough**
  - **DoD**: Ghi nhận token contract, kiểm tra light/dark, QC và giới hạn UI smoke.

## Session Checkpoint

- **Active Task**: Không còn task đang thực hiện.
- **Tiến độ**: Follow-up theo screenshot tinh chỉnh drawer alpha, blur, overlay và shadow; các lần kiểm tra scoped/build/check:ci đã pass ở từng bước được ghi bên dưới.
- **Follow-up 2**: Theo yêu cầu nhìn rõ dải màu phía sau, giảm bề mặt light alpha xuống 0.38 và dark xuống 0.58. Scoped tests (3 files/12 tests) và `bun run check:ci` PASS.
- **Follow-up 3**: Cập nhật theo yêu cầu mới: light 0.2, dark 0.7, blur 15px, overlay 15% (bao gồm OrcaQ). Scoped tests (3 files/12 tests), `bun run check:ci`, `bun run build` và `git diff --check` PASS.
- **Follow-up 4**: Drawer blur tăng lên 20px và thêm blur 4px cho overlay phía sau ở light/dark. Scoped tests (3 files/12 tests) và `bun run check:ci` PASS.
- **Follow-up 5**: Giảm overlay blur xuống 2px, tăng overlay alpha lên 0.2 ở light/dark. Scoped tests (3 files/12 tests) và `bun run check:ci` PASS.
- **Follow-up 6**: Overlay blur 1px, thêm shadow nhẹ qua `--drawer-shadow`, light alpha 0.35 và dark alpha 0.65. Scoped tests (3 files/12 tests), `bun run check:ci`, `bun run build` và `git diff --check` PASS.
- **Follow-up 7**: Light alpha 0.3, dark alpha 0.7 trên theme và V1 fallback.
- **Follow-up 8**: Light alpha 0.35, dark alpha 0.75. `bun run build`, `bun run check:ci`, `bun run test` (571 files/2,528 tests passed; 2 files/12 tests skipped), và `git diff --check` PASS.
- **Git Status**: Thay đổi implementation/docs chưa commit trên `erp-master`, dự kiến commit và rebase trước Final Gate.
- **Hành động tiếp theo**: Commit thay đổi đã QC, rebase `github-industries/erp-master`, chạy `verify:final`, rồi push.

---

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

---

# Chuyển Invoice Detail Drawer sang `V2StandardDrawer`

**Track**: `T2` — migrate giao diện drawer, không migrate toàn bộ module.
**RequestFeedback**: `false` — plan được người dùng duyệt để triển khai.

## Web Frontend

- [x] **Task 3.3.1: Bổ sung right panel theo tab cho V2StandardDrawer**
  - **DoD**: Tab V2 có panel phải riêng, fallback về `rightPanel` gốc, nhất quán Desktop/Mobile; tương thích use case hiện có.
  - **Verification**: 3 scoped test files, 14 tests PASS.
- [x] **Task 3.3.2: Chuyển Invoice Detail Drawer sang V2StandardDrawer**
  - **DoD**: Giữ tab/sub-tab, panel phải, actions, loading/error, close confirm, modal, deep link; cả main và standalone consumer dùng cùng drawer.
  - **Verification**: Module invoice + V2 drawer suite PASS (69 files, 272 tests; 9 skipped); `bunx tsc --noEmit` PASS.

## QC & Knowledge

- [x] **Task 4.1.1: Kiểm tra parity và chất lượng**
  - **DoD**: Scoped unit/integration tests, typecheck, audit No Blue/i18n/LoC; hướng dẫn kiểm tra UI desktop/mobile.
  - **Ghi chú**: UI smoke có hướng dẫn trong walkthrough nhưng chưa chạy vì browser session đang ở màn đăng nhập.
- [x] **Task 4.3.1: Đồng bộ module skills và walkthrough**
  - **Files**: Module skill `erp-invoice`, `v2-drawer`, `walkthrough.md`.
  - **Kết quả**: Cập nhật skills; `sync-agents.sh --sync` validation PASS.

## Session Checkpoint

- **Active Task**: Không còn task đang thực hiện.
- **Tiến độ**: Đã chuyển drawer dùng chung sang V2, giữ tab/panel theo trạng thái; test/typecheck/audit và knowledge sync hoàn tất.
- **Git Status**: Thay đổi implementation và tài liệu chưa commit trên `erp-master`.
- **Việc tiếp theo**: Kiểm tra UI thủ công tại route hóa đơn ở desktop/mobile trước khi gộp.

---

# Sửa trạng thái hai nút và hoàn thiện Dark Mode cho V2StandardDrawer

**Track**: `T1` — chỉnh sửa component dùng chung hiện có.
**RequestFeedback**: `false` — plan được người dùng duyệt để triển khai.

## Web Frontend

- [x] **Task 3.3.1: Sửa mapping trạng thái hai nút hóa đơn**
  - **DoD**: Hai nút thể hiện active state khớp với nội dung đang hiển thị; test xác nhận state mặc định và chuyển mode.
  - **Verification**: Scoped Vitest PASS (6 files, 26 tests), gồm navigation mode và shared button group.
- [x] **Task 3.3.2: Chuẩn hóa Dark Mode của V2StandardDrawer**
  - **DoD**: Bề mặt shared drawer và nhóm nút dùng token V2 nhất quán trên Desktop/Mobile.
  - **Verification**: V2 drawer suite PASS (11 files, 45 tests).

## QC & Knowledge

- [x] **Task 4.1.1: Kiểm tra chất lượng và đồng bộ tri thức**
  - **DoD**: Scoped tests, typecheck, LoC audit; cập nhật skills `v2-drawer` và `erp-invoice` khi cần.
  - **Verification**: `bunx tsc --noEmit` PASS; `git diff --check` PASS; module skills và walkthrough cập nhật.

## Session Checkpoint

- **Active Task**: Không còn task đang thực hiện.
- **Tiến độ**: Sửa style button-group theo token; dark surface, viền và shadow dùng theme V2. Scoped tests và typecheck PASS.
- **Git Status**: Có thay đổi chưa commit từ migration drawer trước; các thay đổi hiện tại được giữ nguyên.
- **Hành động tiếp theo**: Kiểm tra UI thủ công trên theme sáng/tối ở Desktop/Mobile khi có phiên đăng nhập.
