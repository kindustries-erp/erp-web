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
