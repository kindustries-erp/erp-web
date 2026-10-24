# Enhance Glassmorphism cho V2 Drawer

## Thay đổi

- V2 Sheet dùng `--drawer-blur: 20px`, saturate `190%` và contrast `102%`, đồng bộ filter với V1 mà không ảnh hưởng popup/modal.
- Bề mặt drawer light dùng alpha `0.35`, dark dùng alpha `0.75`; overlay light/dark dùng alpha `0.2` và blur nhẹ `1px`. Drawer có `--drawer-shadow` nhẹ riêng theo theme.
- Fallback cho drawer V2 trên route V1 áp dụng alpha light riêng, không đổi V1 slide-panel. OrcaQ dùng cùng blur `20px`.
- Cập nhật module skill `v2-drawer` ghi nhận token contract.

## Verification

- `bunx vitest run src/v2/shared/ui/sheet/sheet.test.tsx src/v2/shared/components/organisms/v2-standard-drawer/desktop/V2StandardDrawer.desktop-content.test.tsx src/v2/shared/components/organisms/v2-standard-drawer/mobile/V2StandardDrawer.mobile.test.tsx` — 3 files, 12 tests PASS.
- `bunx tsc --noEmit` — PASS; `bun run build` — PASS (có warning chunk/dynamic import); `bun run check:ci` — PASS.
- `bun run test` — 571 files PASS, 2 skipped; 2,528 tests PASS, 12 skipped.
- `bash ../../.agents/scripts/sync-agents.sh --check` — Agent system validation PASS.
- `bun run verify:final` chưa chạy vì script đòi working tree sạch sau commit/rebase; không có commit/push trong scope.
- UI smoke light/dark desktop/mobile chưa chạy trong browser; cần phiên đăng nhập.

## Follow-up: Light glass chưa rõ trong screenshot

- Nguyên nhân: light surface alpha `0.82` chỉ cho backdrop xuyên qua 18%; drawer gần full màn hình và nền phía sau sáng đồng màu làm blur khó nhận biết. Sheet trước đó cũng chỉ có blur, thiếu saturate/contrast như V1.
- Điều chỉnh: light V2 drawer alpha `0.68`, filter `blur(24px) saturate(190%) contrast(102%)`; fallback light giới hạn vào V2 Sheet trên route V1.
- Follow-up backdrop: dark overlay giảm từ 60% xuống 8%, bỏ blur trên overlay; blur 24px giữ ở sheet surface. Scoped sheet/drawer tests (3 files, 12 tests), `bun run check:ci`, `bun run build`, và `git diff --check` pass. Build hiện có cảnh báo chunk size và dynamic/static imports.
- Verification follow-up 1: 3 scoped files / 12 tests PASS; `bun run check:ci` PASS; `bun run build` PASS. Full suite phía trên đã chạy trước follow-up style-only.
- Follow-up 2: giảm surface alpha light từ 0.68 xuống 0.38, dark từ 0.88 xuống 0.58. Scoped tests (3 files/12 tests) và `bun run check:ci` PASS.
- Follow-up 3: theo yêu cầu mới, surface alpha light 0.2/dark 0.7, blur 15px và overlay 15%; OrcaQ dùng cùng blur 15px. Scoped tests (3 files/12 tests), `bun run check:ci` và `bun run build` PASS. Build hiện có cảnh báo chunk size và dynamic/static imports.
- Follow-up 4: tăng drawer blur lên 20px, thêm overlay backdrop blur 4px ở light/dark. Scoped tests (3 files/12 tests) và `bun run check:ci` PASS.
- Follow-up 5: giảm overlay blur xuống 2px và tăng overlay alpha lên 0.2 ở light/dark. Scoped tests (3 files/12 tests) và `bun run check:ci` PASS.
- Follow-up 6: overlay blur 1px, shadow nhẹ theo theme, light alpha 0.35 và dark alpha 0.65. Scoped tests (3 files/12 tests), `bun run check:ci` và `bun run build` PASS. Build có warning chunk size và dynamic/static imports.
- Follow-up 7: light alpha 0.3, dark alpha 0.7 ở theme tokens và V1 fallback.
- Follow-up 8: light alpha 0.35, dark alpha 0.75.
- Delivery QC: `bun run build`, `bun run check:ci`, `bun run test` (571 files/2,528 tests passed; 2 files/12 tests skipped), `git diff --check` PASS. Final Gate sẽ chạy sau commit và rebase.

---

# Business Partners trên ERP Web V2

## Kết quả

- Thêm module dùng chung cho `/v2/customers` và `/v2/suppliers`, phân biệt bằng `CUSTOMER`/`VENDOR`.
- Desktop dùng bảng server V2; mobile dùng card, menu thao tác và filter modal.
- Drawer một cột có ba section, hỗ trợ xem/tạo/sửa, sinh mã, dirty guard và xóa mềm qua confirm modal.
- Route và thao tác tuân theo quyền `business_partners`; menu mobile có mục `Danh mục`.
- Preset tiếp tục dùng table ID V1 để giữ cấu hình cột đã lưu.

## Verification

```bash
bunx vitest run src/v2/modules/business-partners/api/businessPartnersApi.test.ts src/v2/modules/business-partners/tests/integration/BusinessPartnersPage.test.tsx src/v2/shared/components/organisms/v2-standard-table/mobile/V2StandardTable.mobile.test.tsx src/v2/app/router/v2RouteConfig.test.ts
bunx vitest run src/v2/app/layouts/v2-app-layout/v2Navigation.test.ts src/v2/app/layouts/v2-app-layout/v2Navigation.filter.test.ts src/v2/app/layouts/v2-app-layout/V2AppLayout.test.tsx
bun run type:check
```

- Business Partner/route/mobile filter: 21 tests PASS, gồm create → mutation → refetch cho CUSTOMER và VENDOR.
- Navigation/layout regression: 10 tests PASS.
- ESLint scoped và TypeScript: PASS.
- Build và style toàn repo: PASS.
- Full Vitest: 479 files, 2.092 tests PASS, 12 skipped.
- `verify:final` không được gọi trực tiếp vì guard yêu cầu working tree đã commit; chuỗi lệnh bên trong script đã chạy đầy đủ trên mã hiện tại.

## Kiểm tra thủ công

1. Mở `/v2/customers` và `/v2/suppliers` bằng tài khoản có quyền read.
2. Kiểm tra search, filter, sort, pagination và preset trên desktop; mở filter và row action trên mobile.
3. Tạo rồi sửa bằng fixture/mocked API; kiểm tra dirty guard, refresh bảng và confirm xóa.
4. Mở route V1 tương ứng và xác nhận preset vẫn được đọc bằng cùng table ID.

---

# Garage Drawer Table Scroll Fix

## Change

- Drawer header stacking level is `z-40`.
- Top navigation tabs use `sticky z-30 isolate` with the drawer header background.
- DataTable scroll containers use `isolate`; table headers remain `sticky z-20`.
- Drawer body and StandardFormDrawer left content use `flex/min-h-0` so nested table scrolling stays inside the drawer viewport.

## Verification

```bash
bunx vitest run src/shared/components/DataTable/__tests__/DataTableStickyFooter.test.tsx
bunx tsc --noEmit
bun run check:ci && bun run test
```

## Manual check

1. Open Garage > Công nợ garage and open a monthly detail drawer.
2. Scroll the Phải thu/Phải trả tables and confirm the table header remains inside the table area.
3. Scroll the drawer body and confirm the drawer title, close button, fullscreen button and top tabs remain above the table content.
4. Switch to Đối tượng HĐ and repeat for Thu khách hàng and Thu bảo hiểm.
5. Verify horizontal table scrolling and opening a row detail drawer still work.

---

# Garage Debts Payable Columns & Payer Cards

## Change

- Bảng `Bảng Phải trả theo chi phí` chỉ còn cột tổng `Còn phải trả`; hai cột có HĐ/không HĐ chỉ còn trên bảng Phải thu.
- Tab `Phân loại theo đối tượng` dùng right panel chung, chứa duy nhất `DrawerSection` `Cơ cấu Thu KH vs Thu BH` với hai card Thu Khách hàng và Thu Bảo hiểm xếp dọc.
- Right panel của tab `Phân loại Nghiệp vụ` cũng dùng section cơ cấu này; các section tổng quan/thống kê/hoàn tất cũ đã được gỡ.

## Verification

```bash
bunx vitest run src/modules/garage/components/organisms/garage-month-detail-drawer/components/MonthClassificationTable.test.tsx src/modules/garage/components/GarageMonthDetailDrawer.test.tsx
bun run build
bun run check:ci
bun run test
```

- Scoped: 2 test files, 5 tests passed.
- Full suite: 434 test files, 1,875 tests passed; 2 files/12 tests skipped.

## Standardize Drawer enhancement (2026-10)

- Hai bảng phân loại nằm trực tiếp trong hai `DrawerSection` độc lập, có thể thu gọn và có `titleExtra` hiển thị số lượng phân loại.
- Cột `Số phiếu` đứng ngay sau `Loại nghiệp vụ`; summary row đặt tổng số phiếu ở cột mới. Header chỉ được làm đặc và bỏ blur trong hai bảng này.
- Right panel dùng chung cho hai tab Phải thu và chỉ chứa `Cơ cấu Thu KH vs Thu BH`; chế độ Phải trả ẩn panel khi không có breakdown.
- Tab đổi tên thành `Phân loại theo đối tượng`. Scoped regression: 5 tests pass; `bunx tsc --noEmit` pass.

## Standardize Table pagination & headers (2026-10)

- Header bốn bảng dùng nhãn ngắn, tooltip diễn giải đầy đủ và header nền đặc scoped; không thay đổi `DataTable` toàn hệ thống.
- Bảng phân loại có viewport tối đa khoảng 5 dòng body, sticky header và cuộn dọc/ngang.
- Hai bảng Thu khách hàng/Thu bảo hiểm paginate client-side độc lập, mặc định 5 dòng/trang với lựa chọn 5/10/20; summary vẫn tính trên toàn bộ tập đã lọc.
- Scoped tests: 3 files, 7 tests pass. Full suite: 435 files, 1,877 tests pass; 2 files/12 tests skipped.

## Partner table drawer sections (2026-10)

- Tab `Phân loại theo đối tượng` hiển thị Thu khách hàng và Thu bảo hiểm trong hai `DrawerSection` riêng.
- Hai bảng dùng cùng `DataTable` contract/style với bảng chi tiết tháng, bao gồm vùng scroll và header scoped.
- Cột nghiệp vụ trong bảng phân loại được căn trái để nội dung dễ đọc.

## Manual check

1. Mở `garage-debts?tab=overview`, chọn một tháng trong bảng tiến độ thu tiền.
2. Ở tab Phân loại nghiệp vụ, xác nhận hai bảng nằm trong section riêng và right panel chỉ có cơ cấu Thu KH/Thu BH.
3. Chuyển sang tab Phân loại theo đối tượng, xác nhận hai card nằm trong cùng right panel, xếp dọc và không lặp ở cột trái.
4. Mở drawer từ chế độ Phải trả và xác nhận tab Phân loại theo đối tượng không xuất hiện.

---

# Invoice Detail Drawer sang V2StandardDrawer

## Thay đổi

- `ErpInvoiceDetailDrawer` dùng `V2StandardDrawer`; luồng từ danh sách và standalone/cấn trừ tiếp tục đi qua cùng component.
- Thêm `V2TabItemData.rightPanel`; panel của tab active được dùng trước panel fallback của drawer. Desktop/Mobile dùng chung cách resolve này.
- Tách phần dựng title, sub-tab, panel và map tab thành presentation hook để giữ file drawer dưới 180 LoC.
- Cập nhật module skills `erp-invoice` và `v2-drawer`.

## Verification

- `bunx vitest run src/v2/shared/components/organisms/v2-standard-drawer src/modules/erp-invoices-core` — 69 files passed, 272 tests passed, 9 skipped.
- `bunx tsc --noEmit` — PASS.
- `git diff --check` — PASS.
- Audit file V2 đã sửa/thêm: không có `blue-*`; tất cả file nguồn/test/story đã sửa hoặc thêm đều dưới 180 LoC.
- `bash ./.agents/scripts/sync-agents.sh --sync` từ workspace root — Agent system validation PASS.

## UI smoke

1. Đăng nhập, mở `/erp-invoices?tab=in` hoặc `?tab=out`, mở chi tiết một hóa đơn.
2. Chuyển `Chi tiết`, `Chi tiết theo NCC/KH`, `Lịch sử`; xác nhận panel phải theo đúng tab và panel Công nợ xuất hiện ở sub-tab `Chứng từ liên kết`.
3. Kiểm tra view/edit, lưu/hủy, confirm khi đóng lúc edit, modal liên kết và đóng drawer con.
4. Lặp lại trên viewport desktop và mobile; mở hóa đơn standalone trong luồng cấn trừ.

UI smoke chưa chạy vì browser hiện không có phiên đăng nhập (route chuyển đến màn Đăng nhập). Test component/integration và typecheck ở trên đã pass.

## Invoice button active state & V2 drawer dark theme

- Button-group “Xem trước HĐ thuần” / “Tài liệu & PDF” chuẩn hóa active key rõ ràng theo mode (`template`/`pdf`) và dùng cùng state cho preview content; test giữ đúng selected state khi khởi tạo `template`, chuyển sang `pdf` và quay lại.
- Active/inactive button colors dùng token `primary`, `primary-fg`, `surface` và `border`. Dark drawer surface tăng độ đặc/độ tách nền; Sheet viền dùng `--drawer-border`, floating shadow theo `--panel-shadow`, header/footer có shadow tối khi cuộn.
- Scoped tests: 6 files, 26 tests PASS cho invoice/navigation và 11 files, 45 tests PASS cho V2StandardDrawer.
- `bunx tsc --noEmit` PASS; `git diff --check` PASS.
- UI smoke trên theme sáng/tối Desktop/Mobile chưa chạy do browser session chưa đăng nhập.

### Follow-up từ ảnh UI

- Nguyên nhân dark token chưa hiện ở invoice route: route đang dùng V1 theme stylesheet; `v2-theme.css` chỉ được import trong app `/v2`. Sheet content đã được gắn `data-v2-standard-drawer`, và selector Midnight đặt token tối trên chính Sheet để Radix portal cùng toàn bộ nội dung con kế thừa.
- Nút inactive trong button-group hiện có nền/viền trong suốt; chỉ active tab dùng nền fill. Test bổ sung khóa hai trạng thái và marker của Sheet.
- Recheck: 14 test files, 57 tests PASS.

## Git

- Branch: `erp-master`.
- Chưa commit hoặc push.
