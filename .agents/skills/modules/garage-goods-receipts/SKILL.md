---
name: garage-goods-receipts-web
description: Module tri thức Frontend V2 cho Quản lý Nhập kho Garage (Garage Goods Receipts) trong erp-web. Tuân thủ 100% quy chuẩn V2, Atomic Design, No Blue mandate, drawer responsive, danh sách dòng phụ tùng (Lines Editor) và đa ngôn ngữ vi/en.
---

# 🎨 Module Tri Thức: Nhập Kho Garage Frontend V2 (`garage-goods-receipts`)

## 1. Kiến trúc Cấu trúc Thư mục Module V2

Module được đặt tại: `src/v2/modules/garage-goods-receipts/`

```
src/v2/modules/garage-goods-receipts/
├── api/
│   ├── dtos/
│   │   └── garageGoodsReceipt.dto.ts
│   ├── mutations/
│   │   └── useGarageGoodsReceiptMutations.ts  # save, remove, post, cancel
│   ├── queries/
│   │   ├── garageGoodsReceiptsKeys.ts
│   │   └── useGarageGoodsReceiptsQuery.ts
│   └── garageGoodsReceiptsApi.ts
├── components/
│   ├── molecules/
│   │   └── garage-goods-receipt-status-badge/  # DRAFT, POSTED, CANCELLED
│   └── organisms/
│       ├── garage-goods-receipt-form/
│       │   ├── GarageGoodsReceiptFormSections.tsx
│       │   ├── GarageGoodsReceiptLinesTable.tsx
│       │   └── GarageGoodsReceiptLineRow.tsx
│       └── garage-goods-receipt-table/
│           ├── GarageGoodsReceiptTable.columns.tsx
│           └── GarageGoodsReceiptTable.views.ts
├── domain/
│   ├── entities/
│   │   └── garageGoodsReceipt.ts
│   └── rules/
│       └── garageGoodsReceiptRules.ts
├── drawers/
│   ├── GarageGoodsReceiptDrawer.tsx
│   └── GarageGoodsReceiptDrawer.hook.ts
├── pages/
│   ├── GarageGoodsReceiptsPage.tsx
│   └── useGarageGoodsReceiptsPage.ts
├── tests/
└── garageGoodsReceipts.locale.ts
```

---

## 2. Quy Chuẩn V2 Đã Đáp Ứng

- **Không dùng Blue**: Màu sắc semantic hoàn toàn từ Token System (`bg-amber-50`, `bg-emerald-50`, `text-primary`, `text-muted-fg`).
- **Giới hạn dòng (< 180 LoC)**: Mọi file thành phần đều < 180 dòng. Bảng dòng phụ tùng được chia nhỏ thành `GarageGoodsReceiptLinesTable` và `GarageGoodsReceiptLineRow`.
- **Đa ngôn ngữ 100%**: Tất cả tiêu đề cột, form field, thông báo toast, actions được dịch qua `garageGoodsReceipts.locale.ts` (`vi` / `en`).
- **Tích hợp Menu Sidebar**: Đã thêm NavItem "Nhập kho Garage" vào `sec-garage` trong `useV2AdaptedNavSections.ts` và `GarageNavSection.tsx` (nhóm GARAGE) với quyền `canReadGarageGoodsReceipts` (có fallback `canReadGarageCases`).
- **Tích hợp Multi-tab Shell & Breadcrumb**: `useV2AdaptedTabs.ts` ánh xạ icon `Package` và label chuẩn `v2.nav.items.garageGoodsReceipts`; `V2ShellLayout.tsx` hiển thị breadcrumb `Garage > Nhập kho Garage`.
- **URL Route & Navigation**: Truy cập trực tiếp qua URL `/garage-goods-receipts` (hỗ trợ cả alias `/v2/garage-goods-receipts`), render trực tiếp `GarageGoodsReceiptsPage`.
- **Drawer 2 Cột Chuẩn**: `GarageGoodsReceiptDrawer` sử dụng `layout={V2DrawerLayout.TWO_COLUMNS}` và `size={V2DrawerSize.XL}`, cột phải hiển thị Form thông tin phiếu nhập, cột trái hiển thị bảng chi tiết phụ tùng nhập kho (`GarageGoodsReceiptLinesTable`). Đồng bộ outline focus `DRAWER_FOCUS_RING_CLASS`.

