---
name: inventory-movements-garage-web
description: Module tri thức Frontend V2 cho Chứng từ kho Garage (danh sách gộp nhập mua hàng, nhập khác, xuất, điều chỉnh; thay trang Nhập kho Garage cũ) và Tồn kho Garage (số dư theo mã hàng, thẻ kho). Module giữ phần riêng của garage, ghép core `inventory-movements` và core `goods-receipts`. Đọc trước khi sửa trang kho garage.
---

# Module Tri Thức: Chứng từ kho và Tồn kho Garage (`inventory-movements-garage`)

## 1. Ranh giới Module và Core

- **Module** `src/v2/modules/inventory-movements-garage/`: API client, cấu hình ghép core, locale tiêu đề, 2 page và phần nhập mua hàng (`purchase-receipts/`, chuyển từ module `garage-goods-receipts` đã gỡ).
- **Core** `src/v2/core/inventory-movements/` (không chứa chữ "garage"): domain (dòng chứng từ, số dư, thẻ kho, rule), api (interface `InventoryMovementsApi`, keys, 4 query), component (badge loại và trạng thái, cột bảng chứng từ, cột bảng tồn, drawer chi tiết chỉ đọc, drawer thẻ kho), hook controller (`useStockVoucherListController`, `useStockBalanceListController`), locale `v2.inventoryMovements.*`, `core.manifest.json`.
- Phiếu nhập mua hàng dùng core `goods-receipts` (`GoodsReceiptDrawer`, `useGoodsReceiptListController`); cấu hình `purchase-receipts/garageGoodsReceipts.config.ts`.
- Chiều phụ thuộc: `modules -> core -> shared`. Core không import module; hai core không import nhau (page của module ghép chúng).

```
src/v2/modules/inventory-movements-garage/
├── api/garageStockApi.ts                 # implements InventoryMovementsApi (vouchers, ledger)
├── purchase-receipts/                    # api, dtos, domain, config phiếu nhập mua hàng
├── inventoryMovementsGarage.config.ts    # loại phiếu, tableId, keys, viewVisibility
├── inventoryMovementsGarage.locale.ts    # v2.garageStockVouchers.*, v2.garageStockBalances.*
├── pages/
│   ├── GarageStockVouchersPage.tsx / .hook.ts
│   └── GarageStockBalancesPage.tsx
└── tests/integration/
```

## 2. Trang Chứng từ kho (`/garage-stock-vouchers`, PageKey `garage-stock-vouchers`)

- `tableId` = `inventory-movements-vouchers-garage-table`; phiếu nhập mua hàng dùng `inventory-movements-receipts-garage-table`. Họ `inventory-movements-` đi qua API v2 `/api/v2/table-preferences` (đăng ký ở `V2_TABLE_PREFERENCES_V2_PREFIXES`).
- Dải tab dùng `tabVariant={V2ModulePageTabVariant.SEGMENTED}` (ánh xạ `V2TabBarVariant.SUB`: track xám, tab chọn là thẻ trắng trượt) và `tabBarClassName="pb-0"`. Badge số đếm từng loại lấy từ `useStockVoucherTypeCountsQuery` (`extraData.typeCounts` của API, bỏ qua lọc loại); Tất cả = tổng.

- Danh sách gộp từ `GET /api/v2/inventory-movements-garage-vouchers` (4 loại: `PURCHASE_RECEIPT`, `OTHER_RECEIPT`, `ISSUE`, `ADJUSTMENT`). Tab pill: Tất cả + từng loại; mỗi tab gọi cùng API với `type`. Cột Loại và Trạng thái có bộ lọc; `column-options` qua `garageStockApi.voucherOptions`.
- API từ chối tham số lạ: `toGarageVoucherListParams` chỉ gửi `page, pageSize, search, sort, type, dateFrom, dateTo (từ dateRanges.voucherDate), column_filters, summary_keys`.
- Mở dòng: `PURCHASE_RECEIPT` mở `GoodsReceiptDrawer` đầy đủ (sửa nháp, nhập kho, hoàn nhập, xóa); loại khác mở `StockVoucherDetailDrawer` chỉ đọc (`GET .../inventory-movements-garage-{receipts|issues|adjustments}/:id`). Tạo, sửa, ghi sổ cho Xuất, Điều chỉnh, Nhập khác: Đợt 2 (chưa làm).
- Khóa cache: phiếu nhập mua hàng dùng chung tiền tố `["v2-garage-stock"]` với chứng từ và tồn kho, nên ghi sổ hoặc hoàn nhập làm mới cả danh sách gộp và số dư.
- Route cũ `/garage-goods-receipts`, `/v2/garage-goods-receipts` vẫn mở trang này (giữ `?fromOrder=` và `?receipt=`); `LEGACY_SLUGS` trong `shared/utils/pageUrl.ts` ánh xạ key cũ.
- Quyền: `garage_stock_vouchers:read` (menu và API). Thao tác trên phiếu mua hàng vẫn theo `garage_goods_receipts`.

## 3. Trang Tồn kho (`/garage-stock-balances`, PageKey `garage-stock-balances`)

- Tab theo thứ tự: Tất cả (mặc định), Còn hàng, Hết hàng, Tồn âm. Có chế độ xem Tổng quan và Tất cả cột (`stockBalanceViewVisibility`, core).
- Cột: Mã hàng, Tên hàng, ĐVT, Nhập, Xuất, Điều chỉnh (có dấu), Tồn kho, Giá vốn BQ, Giá trị tồn. Nhập/Xuất/Điều chỉnh là cộng dồn toàn thời gian từ `garage_stock_transactions` (API `qtyReceived/qtyIssued/qtyAdjusted`, tổng `totalReceived/totalIssued/totalAdjusted`).
- Dải tab: `tabVariant={SEGMENTED}` (`V2TabBarVariant.SUB`: track xám đậm, tab chọn là thẻ trắng/slate-700 trượt, chữ và badge teal khi chọn trên dark), `tabBarClassName="pb-0"`. Icon chỉ hiện ở tab đang chọn (`TabBarPillItem`): Tồn kho `LayoutGrid`/`PackageCheck`/`PackageX`/`AlertTriangle`; Chứng từ `LayoutGrid` + icon theo loại khai báo ở `garageVoucherTypes` (`icon`). Badge số mã từng tab lấy từ `useStockTabCountsQuery` (API `extraData.tabCounts`, bỏ qua lọc tab), không hiện khi bằng 0. Danh sách tab tồn kho nằm ở `pages/GarageStockBalancesPage.tabs.ts` (`GARAGE_STOCK_BALANCE_TABS`), page chỉ dựng `V2ModuleTab`.
- `tableId` = `inventory-movements-balances-garage-table`.

- `GET .../inventory-movements-garage-ledger/balances` (tab `stockTab` ALL/IN_STOCK/OUT_OF_STOCK/NEGATIVE, mặc định Còn hàng) và `/transactions?itemCode=` cho thẻ kho (drawer, phân trang 20).
- API trả đúng hợp đồng list v2: `{ items, pagination, summaries, extraData: { tabCounts } }`. `summaries` cùng shape với chứng từ (`qtyOnHand`, `inventoryValue`, `qtyReceived`, `qtyIssued`, `qtyAdjusted`, mỗi key `{ total, pageSubtotal, cumulative }`; cumulative = total). `useStockBalancesQuery` trả thẳng `summaries` và `tabCounts` lấy từ `extraData`. Không còn `totals`/`itemCount`.
- Quyền: `garage_stock_ledger:read`.

## 4. Phiếu nhập mua hàng: quy chuẩn V2 đã đáp ứng

- **Không dùng Blue**: màu semantic từ token (`bg-amber-50`, `bg-emerald-50`, `text-primary`, `text-muted-fg`).
- **Ngưỡng dòng**: cảnh báo ở 180 dòng, chặn ở 250 dòng cho `.tsx` và `.hook.ts`. File dữ liệu và cấu hình (`*.locale.ts`, `*.config.ts`, `*.type.ts`, `*.data.ts`) không tính vào ngưỡng.
- **Quy ước tên hook**: `[Component].hook.ts` cho hook gắn component (`GoodsReceiptDrawer.hook.ts`, `GarageStockVouchersPage.hook.ts`); `use<Tên>.ts` cho hook độc lập (`useGoodsReceiptsQuery.ts`, `useGoodsReceiptMutations.ts`, `useGoodsReceiptListController.ts`).
- **Đa ngôn ngữ 100%**: nhãn bảng, form, toast, action dùng `v2.goodsReceipts.*` (core). Tiêu đề và nút tạo dùng `v2.garageStockVouchers.*`.
- **Lưới trường dùng chung**: form phiếu nhập render qua `V2DrawerFieldGrid` (shared molecule), cùng lưới với đầu đề PR/PO procurement. Bảng dòng phụ tùng giữ riêng vì khác nghiệp vụ với bảng dòng procurement.
- **Drawer 2 cột**: `GoodsReceiptDrawer` dùng `V2DrawerLayout.TWO_COLUMNS` và `V2DrawerSize.XL`; cột trái là bảng dòng phụ tùng, cột phải là form thông tin phiếu.
- **Sinh mã phiếu**: `nextCode` qua `useQuery` (khóa `keys.nextCode()`), bật khi tạo mới. Nút sinh lại dùng `queryClient.fetchQuery`. Không gọi API bằng `useEffect`.
- **Validate**: báo đúng trường thiếu qua `requiredFields` và nhãn `v2.goodsReceipts.columns.<trường>`.
- **Đơn vị mặc định**: `GOODS_RECEIPT_DEFAULT_UNIT` (core), không hardcode `"Cái"` trong module.
- **Drawer remount**: `GarageStockVouchersPage` đặt `key` theo `id` và `mode` để reset state mỗi lần mở, thay cho effect đồng bộ mode.
- **Lưu và hủy sửa**: lưu phiếu cũ thì về chế độ xem (`setMode("view")`), phiếu mới thì đóng drawer. Hủy khi đã đổi hỏi xác nhận bằng `V2ConfirmModal` (z-[700]), đồng ý thì `resetForm` và về view. Menu dòng: TRA CỨU [Xem chi tiết] → THAO TÁC [Chỉnh sửa, Xóa]. Chỉnh sửa luôn hiện khi có quyền, nhưng chỉ bật cho phiếu nháp (không phải nháp thì mờ kèm lý do `disabledReason`); Xóa chỉ cho phiếu nháp. **Nút sửa chỉ bật sau khi đã tải xong** (`loaded` từ data hook): form khởi tạo có status DRAFT mặc định nên không được dùng để quyết định quyền trước khi tải.

## 5. Cập nhật 2026-11-06: chi nhánh tùy chọn

- Ô `branchName` trên phiếu nhập Garage đổi từ ô text sang `ProcurementBranchPicker` (import từ `@/v2/core/procurement` barrel), `clearable`. Form lưu cả `branchId` và `branchName`.
- Tối đa 1 chi nhánh; để trống = nhóm tồn kho không chi nhánh.
- Vị trí: row chi nhánh nằm **sau NCC, trước tổng tiền** (thứ tự hiện tại: Số phiếu, Ngày nhập, Đơn mua, NCC, Chi nhánh, Tổng tiền, Tổng tiền đơn mua, Ghi chú) (`GoodsReceiptFormSections.fields.config.ts`, `GoodsReceiptFormSections.tsx`).
- Payload (`toGarageGoodsReceiptPayload`): gửi `branchId` và `branchName` là `null` khi rỗng để xóa chi nhánh cũ khi sửa.
- Picker dùng react-query: test render form phải bọc `QueryClientProvider` (`GoodsReceiptFormSections.test.tsx`).
- Test: `api/garageGoodsReceiptsPayload.test.ts`.

- **Xem sơ đồ quy trình**: nút hành động của trang là `V2SplitButton` + `V2Dropdown`; mục "Xem sơ đồ quy trình" (hook `useProcurementWorkflowMenu` từ `@/v2/core/procurement`) luôn bật dù không có quyền tạo, mở sơ đồ Kỹ thuật (luồng A post, B hủy). Trang Mua hàng Garage dùng cùng hook, mở sơ đồ Người dùng cuối.

## 6. Nhập kho từ đơn mua Garage (`?fromOrder=`)

- Menu dòng và drawer của đơn mua Garage (`garageProcurementOrders.config.tsx`: `receiveHref`, `canReceive`) có hành động "Nhập kho" khi đơn đã phát hành (`ISSUED`) và chưa nhận đủ (`fulfillmentStatus !== "FULL"`). Hành động điều hướng `/garage-stock-vouchers?fromOrder=<id>` (`useProcurementList.receive`).
- `useGoodsReceiptListController` đọc `fromOrder` một lần, xóa khỏi URL, gọi `config.sourceOrder.load(id)` rồi mở drawer tạo mới với `prefill`.
- `api/garageGoodsReceiptSourceOrder.ts` (`loadGarageReceiptPrefill`): lấy PO qua `/api/v2/procurement-orders-garage`, ném lỗi `notIssued` / `fullyReceived` / `noLines` (toast i18n `v2.goodsReceipts.fromOrder.*`), chỉ giữ dòng GOODS còn thiếu (`qtyOrdered - qtyFulfilled > 0`), `unitCost` = giá PO, `sourceLineId` = id dòng PO.
- Form có `sourceOrderId` (gửi `garageProcurementOrderId`) và dòng có `sourceLineId` (gửi `procurementOrderLineId`). API đối chiếu chi nhánh và NCC với PO; dòng SERVICE không nhận được.
- DTO phản hồi map ngược: `garageProcurementOrderId` → `sourceOrderId`, `procurementOrderLineId` → `sourceLineId` (`toGarageGoodsReceipt`).
- Test: `api/garageGoodsReceiptSourceOrder.test.ts`. E2E: `e2e/garage-procurement.e2e.mjs` mục E (đã PASS trên staging).

## 7. Cập nhật 2026-11-11: phiếu gắn đơn mua, NCC/tổng theo PO, Badge cạnh mã phiếu

- **Bắt buộc đơn mua**: field "Đơn mua" (`sourceOrderId`) là combobox `GoodsReceiptOrderPicker` (molecule trong core, có tìm kiếm trên server). Core không import core procurement: danh sách đơn đi qua `config.sourceOrder.search(term)` (Garage cấp `searchGarageReceiptOrders`: PO `ISSUED` chưa `FULL`).
- Chọn đơn: `useGoodsReceiptDrawerData.pickOrder` gọi `config.sourceOrder.load(id)` rồi `applyGoodsReceiptPrefill` (điền NCC, chi nhánh, dòng còn lại, `maxQty`, số đơn, tổng đơn). Bỏ chọn: `clearGoodsReceiptSourceOrder`. Lỗi đơn (`notIssued`/`fullyReceived`/`noLines`) qua `describeSourceOrderError` (dùng chung với `?fromOrder=`).
- **NCC, chi nhánh chỉ đọc** khi module cấu hình `sourceOrder` (không còn nhập tay); "Tổng tiền" = tổng dòng nhận (chỉ đọc) và thêm "Tổng tiền đơn mua" chỉ đọc (`sourceOrderTotal`, từ response `orderTotalAmount`). `sourceOrderNo`/`sourceOrderTotal` chỉ để hiển thị, không gửi API.
- Phiếu đã lưu có đơn thì khóa không đổi đơn (`orderLocked`). Phiếu cũ không có đơn vẫn mở được; khi sửa phải gắn đơn vì `sourceOrderId` bắt buộc.
- **Title drawer**: `title` = mã phiếu (hoặc "Thêm mới" khi chưa có mã), `titleExtra` = `GoodsReceiptStatusBadge` ngay cạnh (hiện cả khi tạo mới), `subtitle` = chế độ (Chi tiết/Chỉnh sửa). Đã bỏ dòng "Trạng thái" trong thông tin phiếu.
- Test: `GoodsReceiptOrderPicker.test.tsx`, `goodsReceipt.test.ts`, `GoodsReceiptFormSections.test.tsx`, `garageGoodsReceiptSourceOrder.test.ts`; E2E mục I trong `e2e/garage-procurement.e2e.mjs`.

## 8. Cập nhật 2026-11-12: Nhập kho / Hoàn nhập trên drawer

- Drawer tạo/sửa: Hủy | Lưu nháp | Nhập kho (primary). Nhập kho gọi `api.saveAndPost` (một request, `POST`/`PATCH .../save-and-post`).
- Phiếu đã nhập kho (POSTED): chỉ còn "Hoàn nhập", mở `V2ConfirmModal`. Nút mờ kèm lý do khi `reversible === false`. Không còn "Hủy phiếu" cho phiếu đã nhập.
- Code: `core/goods-receipts/drawers/GoodsReceiptDrawer.actions.ts` (dựng nút, có test), `GoodsReceiptDrawer.hook.ts`, `api/mutations/useGoodsReceiptMutations.ts` (`saveAndPost`, `cancel` đổi thông báo thành Hoàn nhập).
- Type `GoodsReceiptRecord` có `reversible` và `reverseBlockedReason`.

## Hợp đồng phân trang chuẩn v2 (pagination)

- API trả `{ items, pagination, summaries? }` (list) và `{ items, pagination }` (column-options). `pagination` có `total`, `totalPages`, `next`, `previous`.
- Kiểu dùng chung: `src/v2/shared/types/v2-pagination.ts` (`V2PaginationMeta`, `V2PaginatedResponse`, `V2PaginatedResponseWithSummaries`).
- Bảng V2 vẫn nhận `V2FetchOptionsResult` (`items`, `total`, `next`). API client dùng `toFetchOptionsResult` (`src/v2/shared/utils/v2FetchOptionsAdapter.ts`) để đổi; `V2StandardTable` không đổi.
- Lớp API client V1 đổi wire sang kiểu phẳng cũ bằng `fromPaginatedWire` / `fromColumnOptionsWire` (`src/shared/types/pagination.ts`), nên màn hình V1 không đổi.
