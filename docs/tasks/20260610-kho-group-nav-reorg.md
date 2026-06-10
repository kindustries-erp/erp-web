# Task: Gom nhóm Kho — sidebar navigation / tab grouping / reduce confusion

**Date:** 2026-06-10  
**Scope:** FE-only — sidebar nav, appStore grouping, breadcrumb labels. Không đổi API, DB, không xóa pages.

## Gate 0 DB Precheck

`DB_READY` — N/A (không đổi schema)

## Problem statement (từ audit)

Hiện tại có 3 lớp trang liên quan đến kho nhưng bị trộn lẫn nhau trên sidebar:

### Lớp 1: Legacy operational — Directus/finance lane (không còn active trong core)

- `inventory` → `Inventory.tsx` → `OperationalListPage variant="inventory"` → tổng hợp tồn kho cũ, read-only aggregate
- Đang nằm trong section **Purchasing** cùng với `purchasing` — confusing

### Lớp 2: Legacy mfg lane — `manufacturingApi` (legacy Directus-backed)

- `mfg-items` → `MfgItems.tsx` → `manufacturingApi.listComponents` → danh mục linh kiện cũ
- `mfg-vehicles` → `MfgVehicles.tsx` → `manufacturingApi.listVehicles` → VIN xe cũ
- Cả hai đang nằm trong section **Manufacturing** cùng với erp-core pages

### Lớp 3: ERP core — Neon/Postgres-native (chính, active)

- `erp-inventory-items` → `ErpInventoryItemsPage` → `inventoryCoreApi` → **danh mục hàng hóa / items**
- `erp-goods-receipts` → `ErpGoodsReceiptsPage` → `goodsReceiptsCoreApi` → **phiếu nhập kho**
- `erp-goods-issues` → `ErpGoodsIssuesPage` → `goodsIssuesCoreApi` → **phiếu xuất kho**
- Cả ba đang bị nhét trong section **Manufacturing** chung với BOM + Production + Sales

### Duplicate data responsibility

- `erp-inventory-items` (core, live API) vs `mfg-items` (legacy, Directus) → cả hai là "danh mục linh kiện/hàng hóa"
- `inventory` (aggregate view) vs `erp-inventory-items` (master list) → confusing có 2 page kho ở 2 section khác nhau

## Plan

**Approach: tách section riêng cho Kho, không xóa route cũ ngay.**

### Thay đổi sidebar (`Sidebar.tsx`):

1. Tách `erp-inventory-items`, `erp-goods-receipts`, `erp-goods-issues` ra khỏi section Manufacturing → thành section **Kho** riêng
2. Đưa `inventory` (aggregate) vào section Kho thay vì Purchasing — hoặc xóa hẳn khỏi nav nếu `erp-inventory-items` đã cover
3. `mfg-items` giữ trong Manufacturing nhưng thêm note/label rõ hơn hoặc ẩn khỏi nav nếu `erp-inventory-items` đã cover
4. Section Manufacturing chỉ giữ: BOM, Production, mfg-vehicles (xe thành phẩm), Sales Orders

### Thay đổi appStore (`appStore.ts`):

- Đổi `group` của các erp-kho pages sang `"inventory"` thay vì `"manufacturing"`
- Breadcrumb: thay `manufacturing` → `Kho`

### Thay đổi pageUrl.ts / shared types:

- Không cần thêm PageKey mới (route slugs giữ nguyên)

## Acceptance criteria

- Sidebar có section "**Kho**" rõ ràng chứa: Hàng hóa (erp-inventory-items), Nhập kho (erp-goods-receipts), Xuất kho (erp-goods-issues)
- Tab group của ba page trên là `inventory`, không còn là `manufacturing`
- Section Manufacturing gọn lại: BOM, Sản xuất, Bán hàng, Xe thành phẩm
- Page `inventory` (legacy aggregate) hoặc ẩn khỏi nav (vì erp-inventory-items cover), hoặc đặt trong Kho dưới label "Tồn kho tổng hợp (cũ)"
- `mfg-items` ẩn khỏi nav hoặc đặt trong Kho dưới label nhỏ nếu vẫn cần
- `bun run build` PASS
- Vitest/build hook PASS
