---
name: garage-goods-receipts-web
description: Module tri thức Frontend V2 cho Quản lý Nhập kho Garage (Garage Goods Receipts) trong erp-web. Module chỉ giữ phần riêng của garage và ghép core họ phiếu nhập (`src/v2/core/goods-receipts/`). Tuân thủ quy chuẩn V2, No Blue mandate, drawer responsive và đa ngôn ngữ vi/en.
---

# 🎨 Module Tri Thức: Nhập Kho Garage Frontend V2 (`garage-goods-receipts`)

## 1. Ranh giới Module và Core

- **Module** `src/v2/modules/garage-goods-receipts/` chỉ giữ phần riêng của garage: API client và DTO (endpoint `/api/v1/garage-goods-receipts`), cấu hình ghép core, page, locale tiêu đề và nút tạo.
- **Core** `src/v2/core/goods-receipts/` giữ mọi phần chung của họ phiếu nhập: domain (form value, rule validate/dirty, tính tiền), api (keys, interface `GoodsReceiptApi`, query và mutation), component (badge, form, bảng cột, row actions, lines editor), drawer, hook controller màn danh sách và locale `v2.goodsReceipts.*`.
- Chiều phụ thuộc: `modules → core → shared`. Core không import module và không chứa chữ "garage".

```
src/v2/modules/garage-goods-receipts/
├── api/
│   ├── dtos/garageGoodsReceipt.dto.ts      # hình dạng bản ghi và payload của backend
│   └── garageGoodsReceiptsApi.ts           # implements GoodsReceiptApi (endpoint garage)
├── domain/entities/garageGoodsReceipt.ts   # alias kiểu từ core (GarageGoodsReceipt, ...)
├── garageGoodsReceipts.config.ts           # GoodsReceiptModuleConfig: api, keys, tableId, quyền, trường bắt buộc
├── garageGoodsReceipts.locale.ts           # chỉ tiêu đề, mô tả, nút tạo
├── pages/
│   ├── GarageGoodsReceiptsPage.tsx         # V2ModulePage + GoodsReceiptDrawer (remount theo key)
│   └── GarageGoodsReceiptsPage.hook.ts     # gọi useGoodsReceiptListController(garageGoodsReceiptsConfig)
├── tests/integration/GarageGoodsReceiptsPage.test.tsx
└── index.ts

src/v2/core/goods-receipts/
├── api/
│   ├── goodsReceiptApi.type.ts             # interface GoodsReceiptApi
│   ├── goodsReceiptKeys.ts                 # createGoodsReceiptKeys(base)
│   ├── mutations/useGoodsReceiptMutations.ts   # save, post, cancel, remove
│   └── queries/useGoodsReceiptsQuery.ts    # danh sách server-side
├── components/
│   ├── molecules/goods-receipt-status-badge/
│   └── organisms/
│       ├── goods-receipt-form/             # FormSections, fields.config, fields.tsx
│       ├── goods-receipt-lines-editor/     # GoodsReceiptLinesTable (bảng dòng phụ tùng)
│       └── goods-receipt-table/            # columns, rowActions, views
├── domain/                                 # goodsReceipt.ts, goodsReceiptRules.ts, goodsReceiptLine.ts, goodsReceiptConstants.ts
├── drawers/                                # GoodsReceiptDrawer.tsx, .hook.ts, .data.hook.ts, .type.ts
├── hooks/useGoodsReceiptListController.ts  # drawer, xóa, chế độ xem, cột, quyền
├── goodsReceipts.config.type.ts            # GoodsReceiptModuleConfig
├── goodsReceipts.locale.ts                 # v2.goodsReceipts.*
└── index.ts
```

## 2. Cấu hình ghép core

`garageGoodsReceipts.config.ts` khai báo:
- `api`: `garageGoodsReceiptsV2Api`.
- `keys`: `createGoodsReceiptKeys(["v2-garage-goods-receipts"])` (giữ nguyên khóa cache cũ).
- `tableId`: `erp-garage-goods-receipts-table`.
- `permissionCollection`: `garage_goods_receipts`.
- `requiredFields`: `["receiptDate"]`.
- `viewVisibility`: `goodsReceiptViewVisibility` (core).

Module khác muốn dùng core chỉ cần tạo một cấu hình tương tự và một API client đúng `GoodsReceiptApi`.

## 3. Quy Chuẩn V2 Đã Đáp Ứng

- **Không dùng Blue**: màu semantic từ token (`bg-amber-50`, `bg-emerald-50`, `text-primary`, `text-muted-fg`).
- **Ngưỡng dòng**: cảnh báo ở 180 dòng, chặn ở 250 dòng cho `.tsx` và `.hook.ts`. File dữ liệu và cấu hình (`*.locale.ts`, `*.config.ts`, `*.type.ts`, `*.data.ts`) không tính vào ngưỡng.
- **Quy ước tên hook**: `[Component].hook.ts` cho hook gắn component (`GoodsReceiptDrawer.hook.ts`, `GarageGoodsReceiptsPage.hook.ts`); `use<Tên>.ts` cho hook độc lập (`useGoodsReceiptsQuery.ts`, `useGoodsReceiptMutations.ts`, `useGoodsReceiptListController.ts`).
- **Đa ngôn ngữ 100%**: nhãn bảng, form, toast, action dùng `v2.goodsReceipts.*` (core). Tiêu đề và nút tạo dùng `v2.garageGoodsReceipts.*`.
- **Tích hợp Menu Sidebar**: NavItem "Nhập kho Garage" trong `sec-garage` (`useV2AdaptedNavSections.ts`, `GarageNavSection.tsx`), quyền `canReadGarageGoodsReceipts` (có fallback `canReadGarageCases`).
- **Multi-tab Shell & Breadcrumb**: `useV2AdaptedTabs.ts` ánh xạ icon `Package` và label `v2.nav.items.garageGoodsReceipts`; `V2ShellLayout.tsx` hiển thị breadcrumb `Garage > Nhập kho Garage`.
- **URL Route**: `/garage-goods-receipts` (alias `/v2/garage-goods-receipts`), render `GarageGoodsReceiptsPage`.
- **Lưới trường dùng chung**: form phiếu nhập render qua `V2DrawerFieldGrid` (shared molecule), cùng lưới với đầu đề PR/PO procurement. Bảng dòng phụ tùng giữ riêng vì khác nghiệp vụ với bảng dòng procurement.
- **Drawer 2 cột**: `GoodsReceiptDrawer` dùng `V2DrawerLayout.TWO_COLUMNS` và `V2DrawerSize.XL`; cột trái là bảng dòng phụ tùng, cột phải là form thông tin phiếu.
- **Sinh mã phiếu**: `nextCode` qua `useQuery` (khóa `keys.nextCode()`), bật khi tạo mới. Nút sinh lại dùng `queryClient.fetchQuery`. Không gọi API bằng `useEffect`.
- **Validate**: báo đúng trường thiếu qua `requiredFields` và nhãn `v2.goodsReceipts.columns.<trường>`.
- **Đơn vị mặc định**: `GOODS_RECEIPT_DEFAULT_UNIT` (core), không hardcode `"Cái"` trong module.
- **Drawer remount**: `GarageGoodsReceiptsPage` đặt `key` theo `id` và `mode` để reset state mỗi lần mở, thay cho effect đồng bộ mode.
- **Lưu và hủy sửa**: lưu phiếu cũ thì về chế độ xem (`setMode("view")`), phiếu mới thì đóng drawer. Hủy khi đã đổi hỏi xác nhận bằng `V2ConfirmModal` (z-[700]), đồng ý thì `resetForm` và về view. Menu dòng: TRA CỨU [Xem chi tiết] → THAO TÁC [Chỉnh sửa, Xóa]. Chỉnh sửa luôn hiện khi có quyền, nhưng chỉ bật cho phiếu nháp (không phải nháp thì mờ kèm lý do `disabledReason`); Xóa chỉ cho phiếu nháp. **Nút sửa chỉ bật sau khi đã tải xong** (`loaded` từ data hook): form khởi tạo có status DRAFT mặc định nên không được dùng để quyết định quyền trước khi tải.

## 4. Cập nhật 2026-11-06: chi nhánh tùy chọn

- Ô `branchName` trên phiếu nhập Garage đổi từ ô text sang `ProcurementBranchPicker` (import từ `@/v2/core/procurement` barrel), `clearable`. Form lưu cả `branchId` và `branchName`.
- Tối đa 1 chi nhánh; để trống = nhóm tồn kho không chi nhánh.
- Vị trí: row chi nhánh nằm **sau `status`, trước `remarks`** (`GoodsReceiptFormSections.fields.config.ts`, `GoodsReceiptFormSections.tsx`).
- Payload (`toGarageGoodsReceiptPayload`): gửi `branchId` và `branchName` là `null` khi rỗng để xóa chi nhánh cũ khi sửa.
- Picker dùng react-query: test render form phải bọc `QueryClientProvider` (`GoodsReceiptFormSections.test.tsx`).
- Test: `api/garageGoodsReceiptsPayload.test.ts`.
