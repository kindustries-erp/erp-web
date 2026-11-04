---
name: garage-purchase-orders-web
description: Module tri thức Frontend V2 cho Đơn mua hàng Garage (Garage Purchase Orders) trong erp-web. Module chỉ giữ phần riêng của garage và ghép core họ đơn mua hàng (`src/v2/core/purchase-orders/`), gọi API v2 `/api/v2/garage-purchase-orders`. Tuân thủ quy chuẩn V2, No Blue mandate và đa ngôn ngữ vi/en.
---

# 🛒 Module Tri Thức: Đơn Mua Hàng Garage Frontend V2 (`garage-purchase-orders`)

## 1. Ranh giới Module và Core

- **Module** `src/v2/modules/garage-purchase-orders/` chỉ giữ phần riêng của garage: API client và DTO (endpoint `/api/v2/garage-purchase-orders`), cấu hình ghép core, page, locale tiêu đề và nút tạo.
- **Core** `src/v2/core/purchase-orders/` giữ mọi phần chung của họ đơn mua hàng: domain (enum trạng thái, form value, rule validate/dirty, tính tiền, quyền hành động theo trạng thái), api (keys, interface `PurchaseOrderApi`, query và mutation), component (badge, form, bảng cột, row actions, lines editor), drawer, hook controller màn danh sách và locale `v2.purchaseOrders.*`.
- Chiều phụ thuộc: `modules → core → shared`. Core không import module và không chứa chữ "garage" (đã kiểm: `grep -rni garage src/v2/core/purchase-orders` rỗng).

```
src/v2/modules/garage-purchase-orders/
├── api/
│   ├── dtos/garagePurchaseOrder.dto.ts     # envelope, payload (không status/branchId/supplierId), danh sách
│   └── garagePurchaseOrdersApi.ts          # implements PurchaseOrderApi (BASE /api/v2/garage-purchase-orders)
├── domain/entities/garagePurchaseOrder.ts  # alias GaragePurchaseOrder = PurchaseOrderRecord
├── garagePurchaseOrders.config.ts          # PurchaseOrderModuleConfig: api, keys, tableId, quyền, trường bắt buộc
├── garagePurchaseOrders.locale.ts          # chỉ title, description, create
├── pages/
│   ├── GaragePurchaseOrdersPage.tsx        # V2ModulePage + PurchaseOrderDrawer (remount theo key)
│   └── GaragePurchaseOrdersPage.hook.ts    # usePurchaseOrderListController(garagePurchaseOrdersConfig)
├── tests/integration/GaragePurchaseOrdersPage.test.tsx
└── index.ts

src/v2/core/purchase-orders/
├── api/
│   ├── purchaseOrderApi.type.ts            # interface PurchaseOrderApi (list, options, get, nextNo, create, update, approve, confirm, cancel, remove)
│   ├── purchaseOrderKeys.ts                # createPurchaseOrderKeys(base)
│   ├── mutations/usePurchaseOrderMutations.ts  # save, approve, confirm, cancel, remove
│   └── queries/usePurchaseOrdersQuery.ts   # danh sách server-side
├── components/
│   ├── molecules/purchase-order-status-badge/
│   └── organisms/
│       ├── purchase-order-form/            # FormSections, fields.config, fields.tsx
│       ├── purchase-order-lines-editor/    # PurchaseOrderLinesTable (dòng hàng, SL đã nhận chỉ đọc)
│       └── purchase-order-table/           # columns, rowActions, views
├── domain/                                 # purchaseOrder.ts, purchaseOrderLine.ts, purchaseOrderRules.ts, purchaseOrderConstants.ts
├── drawers/                                # PurchaseOrderDrawer(.hook/.data.hook/.type)
├── hooks/usePurchaseOrderListController.ts
├── purchaseOrders.config.type.ts
├── purchaseOrders.locale.ts
└── index.ts                                # barrel; dòng đầu import locale
```

## 2. Điểm đăng ký (khi thêm hoặc đổi module)

Route và menu của Đơn mua hàng Garage được đăng ký thủ công ở các nơi sau (không dùng generator `v2-module`, vì generator không sinh lõi họ, nhóm Garage và shell lai):

| Nơi | Nội dung |
| :--- | :--- |
| `src/modules/system/types/rbac.ts` | `ErpResource.GARAGE_PURCHASE_ORDERS = "garage_purchase_orders"`, thêm vào nhóm `garage`, thêm vào `RBAC_COLLECTIONS` (nhãn "Đơn mua hàng Garage") |
| `src/shared/types/index.ts`, `src/shared/utils/pageUrl.ts` | `PageKey` và slug `garage-purchase-orders` |
| `src/App.tsx` | lazy import `GaragePurchaseOrdersPage` và map page key (shell lai V1) |
| `src/v2/app/router/v2RouteConfig.ts` | hai route `/garage-purchase-orders` và `/v2/garage-purchase-orders`, quyền `garage_purchase_orders:read` |
| `src/v2/app/router/v2PageRegistry.tsx` | import và entry trang |
| `src/v2/app/layouts/v2-app-layout/navigation/v2Navigation.config.ts` | mục menu, `sectionId: "inventory"` (cùng Nhập kho Garage, xem mục 5) |
| `src/v2/shared/locales/vi.ts`, `en.ts` | `v2.nav.items.garagePurchaseOrders` |
| `src/core/components/layout/adapters/useV2AdaptedNavSections.ts` | cờ `canReadGaragePurchaseOrders` (thêm vào `showGarage` và deps useMemo), mục trong `sec-garage` |
| `src/core/components/layout/adapters/useV2AdaptedTabs.ts` | icon và nhãn tab |
| `src/core/components/layout/V2ShellLayout.tsx` | breadcrumb `Garage > Đơn mua hàng Garage` |
| `src/core/components/layout/sidebar/components/garage-nav-section/` | `NavItem` mới (hook, tsx, test); nhãn V1 dùng fallback `nav.items.garagePurchaseOrders` |

## 3. Quy tắc hành động theo trạng thái

Khớp `PURCHASE_ORDER_TRANSITIONS` của API. UI chỉ ẩn/hiện; API vẫn là chốt chặn.

| Hành động | Hiện khi | Ghi chú |
| :--- | :--- | :--- |
| Sửa | `DRAFT`, `APPROVED`, `CONFIRMED`, `PARTIAL_RECEIVED` | khóa khi `RECEIVED`, `CANCELLED` |
| Lưu nháp (drawer) | đơn mới hoặc `DRAFT` | `saveDraft`: tạo/sửa, giữ `DRAFT` |
| Lưu (drawer, `DRAFT`) | `DRAFT` và có quyền `update` | `saveAndApprove`: tạo/sửa rồi `approve` |
| Lưu (drawer, đã duyệt trở đi) | `APPROVED`, `CONFIRMED`, `PARTIAL_RECEIVED` | `saveDraft`: chỉ sửa nội dung |
| Duyệt đơn (drawer xem) | `DRAFT` | → `APPROVED` |
| Xác nhận | `DRAFT`, `APPROVED` | → `CONFIRMED` |
| Hủy đơn | `APPROVED`, `CONFIRMED`, `PARTIAL_RECEIVED` | `PurchaseOrderCancelModal` (dùng chung drawer và trang) trước khi gọi API |
| Xóa | `DRAFT` | `V2ConfirmModal`, xóa mềm (`isDeleted`) |

Menu dòng (`PurchaseOrderTable.rowActions.tsx`) chia hai nhóm như bảng Hóa đơn: **Tra cứu** (Xem chi tiết) và **Thao tác** (Chỉnh sửa, Lưu, Xác nhận đơn, Hủy đơn, Xóa). Nhóm rỗng bị bỏ. Mục đầu của Thao tác là Chỉnh sửa vì `getQuickActions` lấy mục đầu hai nhóm làm nút nhanh khi hover. Menu "Lưu" trên đơn nháp là `approve` (đơn đã lưu rồi).

Drawer: footer dựng bởi `drawers/PurchaseOrderDrawer.actions.ts`. Đơn nháp có `[Hủy, Lưu nháp, Lưu]`; khi thiếu quyền `update` chỉ còn `[Hủy, Lưu nháp]` (Lưu nháp là primary). Đơn đã duyệt trở đi có `[Hủy, Lưu]`.

`saveAndApprove` (`api/mutations/usePurchaseOrderMutations.ts`) là hai lời gọi API (tạo/sửa rồi `approve`), không có endpoint gộp. Nếu lưu được nhưng duyệt lỗi, lỗi được ném dưới dạng `PurchaseOrderPartialApproveError`: báo "Đã lưu nháp nhưng chưa duyệt được", làm mới danh sách và đóng drawer để không tạo trùng khi bấm lại.

Hàm quyền nằm trong `domain/purchaseOrderRules.ts` (`canEditPurchaseOrder`, `canApprovePurchaseOrder`, `canConfirmPurchaseOrder`, `canCancelPurchaseOrder`, `canDeletePurchaseOrder`), có test phủ từng trạng thái.

## 4. Hợp đồng dữ liệu (đã đối chiếu với erp-api)

- Danh sách: `GET /api/v2/garage-purchase-orders` với `page, pageSize (≤200), search, sort, column_filters, column_search, column_operators, date_ranges`. `sort` dạng `a,-b` (dấu `-` là giảm dần), đã xác nhận trong `erp-api/src/common/utils/table-query/table-query.query.ts`.
- Gợi ý cột: `GET /column-options` với `column, option_search, page, pageSize, column_filters`. Cascade lọc đi qua `column_filters`, không phải `filters`.
- Số đơn kế tiếp: `GET /next-no?date=` trả `{nextNo}`.
- Bản ghi và hành động trả `{message, data}`; `unwrap` ở `garagePurchaseOrdersApi.ts`.
- Payload tạo/sửa: `orderDate` bắt buộc; `poNo` chỉ gửi khi tạo; dòng gửi `qtyOrdered` và `unitPrice` dạng chuỗi số. Không gửi `status`, `createdBy`, `amount`, `branchId`, `supplierId` (API từ chối khi `forbidNonWhitelisted`).
- Chuỗi rỗng ở ô tùy chọn gửi `null` để xóa giá trị cũ khi sửa.

## 5. Quyết định và giả định

- **Không dùng plop `v2-module`**: generator không sinh lõi họ, không chọn được nhóm Garage và không sửa shell lai. Dựng tay theo đúng mẫu `garage-goods-receipts`.
- **Không gửi `branchId` và `supplierId`**: UI nhập tay tên NCC và chi nhánh (`branchName`, `supplierName`). Hệ quả: bộ lọc chi nhánh chỉ theo cột tên, không lọc theo `branch_id`.
- **Menu chỉ dùng quyền của chính nó** (`garage_purchase_orders:read`), không fallback sang quyền garage khác.
- **Mục menu V2 nằm trong section `garage`** (nhãn GARAGE vi/en) cùng với Nhập kho Garage. Trước đây đặt ở `inventory` do copy từ Nhập kho; đã sửa vì mục Garage phải thuộc nhóm Garage. Shell lai (`sec-garage`) vẫn là nơi có đủ nhóm Garage.
- **Lưu = lưu rồi duyệt** (chốt với người dùng): nút "Lưu" trên đơn nháp đưa đơn sang ĐÃ DUYỆT; "Lưu nháp" giữ NHÁP. Nút "Duyệt đơn" trong drawer xem được giữ nguyên.
- **Dòng hàng nhập tay** (mã, tên, mô tả, SL đặt, đơn giá). `itemId` không bắt buộc, chưa nối danh mục vật tư.

## 6. Kiểm thử

- Unit: `domain/purchaseOrderRules.test.ts`, `api/queries`, `api/mutations`, `hooks`, `drawers`, `components/*` (cùng thư mục), `garagePurchaseOrdersApi.test.ts`.
- Integration: `tests/integration/GaragePurchaseOrdersPage.test.tsx` (tải danh sách qua API module, bấm Tạo mở drawer và sinh số).
- Chạy: `bunx vitest run src/v2/core/purchase-orders src/v2/modules/garage-purchase-orders`.

## 7. Giới hạn đã biết

- Khi đang sửa, `detail` có thể refetch (focus cửa sổ) và đổ lại form từ server. Cùng hành vi với `goods-receipts`, cần xem lại khi có yêu cầu.
- Smoke UI đã chạy một phần trên staging (`erp_greenway_staging`): danh sách, tạo, sửa, duyệt, xác nhận, hủy, xóa qua API và khung chi tiết qua màn hình. Chưa bấm hết nút trên UI (nút Lưu nháp/Lưu, menu mới).
- Chưa có test tích hợp cho menu nhóm và hủy đơn từ menu trên trang; chỉ có unit test của `rowActions`, controller và mutation.

## 8. Tái dùng cho PO thường (sau này)

Core `v2/core/purchase-orders/` đã tách sẵn: một module mới chỉ cần API client theo `PurchaseOrderApi`, cấu hình ghép core và page. Chưa làm UI cho `purchase-orders` (bảng dùng chung `erp_purchase_orders`); cần plan riêng.
