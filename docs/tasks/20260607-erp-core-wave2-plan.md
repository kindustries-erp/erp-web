# ERP Core — Wave 2: Wire data thật vào các trang core

> **Ngày lập:** 2026-06-07
> **Branch:** `erp-core`
> **Repos:** `liouni-erp-api` (BE) + `liouni-erp-web` (FE)
> **Trạng thái:** Pending — bắt đầu ngay khi anh gọi `Làm đi em`

---

## Bối cảnh

Wave 1 đã hoàn thành:
- 7 API clients (`inventoryCoreApi`, `bomCoreApi`, `purchaseOrdersCoreApi`, `goodsReceiptsCoreApi`, `productionCoreApi`, `salesOrdersCoreApi`, `goodsIssuesCoreApi`)
- 5 page stubs compile-safe (`ErpBomPage`, `ErpGoodsReceiptsPage`, `ErpProductionPage`, `ErpSalesOrdersPage`, `ErpGoodsIssuesPage`)
- Shell wire: `App.tsx`, `Sidebar.tsx`, `pageUrl.ts`, `vi.ts`, `en.ts`
- Build PASS, 94 tests PASS, commit `91bcd7c`

Wave 2 = wire data thật vào từng page. Pattern reuse: `PageLayout` + `DataTable` + `DrawerModal` như `MfgItems.tsx`.

---

## Thứ tự thực hiện

### 0. Trước tiên: Verify BE endpoints live
**File:** `wave2-api-backend-gaps`

Trước khi wire FE, dùng `curl` hoặc HTTP test để confirm từng endpoint tồn tại trên instance đang chạy (`:10001`):

| Endpoint | Method | Status cần |
|---|---|---|
| `/api/v1/inventory/items` | GET | phải trả `items[]` |
| `/api/v1/bom` | GET/POST/PATCH | phải live |
| `/api/v1/purchase-orders` | GET/POST/PATCH | phải live |
| `/api/v1/goods-receipts` | GET/POST + `/post` | phải live |
| `/api/v1/sales-orders` | GET/POST + `/reserve` `/unreserve` | phải live |
| `/api/v1/goods-issues` | GET/POST + `/post` | phải live |

Nếu endpoint nào missing → implement BE trước, sau đó mới làm FE tương ứng.

---

### 1. `ErpBomPage` — BOM CRUD
**Todo ID:** `wave2-bom-crud`
**Pattern:** clone structure từ `MfgItems.tsx` (list + DrawerModal + lines)

**FE cần làm:**
- List table: `bomCode`, `bomName`, `finishedGoodItemName`, `version`, `status`, `effectiveFrom`
- Drawer create/edit: các field + `lines[]` (componentItem, qtyRequired, uom, scrapRate)
- Action: Edit, Delete (soft nếu BE hỗ trợ)

**Lookup cần:** item search để chọn `finishedGoodItemId` và `componentItemId` trong lines → dùng `inventoryCoreApi.list({ search })`.

---

### 2. `ErpGoodsReceiptsPage` — Nhập kho từ PO
**Todo ID:** `wave2-gr-from-po`

**FE cần làm:**
- List table: `receiptNo`, `supplierName`, `receiptDate`, `status`
- Drawer create: chọn `purchaseOrderId` (lookup PO), điền `receiptDate`, lines auto-populate từ PO lines
- Action: "Post" button → gọi `goodsReceiptsCoreApi.post(id)` → update status → reload list

---

### 3. `ErpProductionPage` — Lệnh sản xuất
**Todo ID:** `wave2-production-form`

**FE cần làm:**
- Form đơn giản (không list): chọn `finishedGoodItemId`, nhập `qtyToProduce`, `warehouseCode` (optional)
- Submit → gọi `productionCoreApi.execute(payload)`
- Hiển thị kết quả: `referenceNo`, `status`, danh sách `materialsIssued` trong một result panel
- History list nếu BE có endpoint GET `/api/v1/production/orders`

---

### 4. `ErpSalesOrdersPage` — Đơn bán hàng
**Todo ID:** `wave2-so-reserve`

**FE cần làm:**
- List table: `soNo`, `customerName`, `orderDate`, `status`
- Drawer create/edit: chọn customer, order date, lines (item, qtyOrdered, unitPrice)
- Actions: "Reserve" → `salesOrdersCoreApi.reserve(id)`, "Unreserve" → `salesOrdersCoreApi.unreserve(id)`

---

### 5. `ErpGoodsIssuesPage` — Xuất kho
**Todo ID:** `wave2-gi-post`

**FE cần làm:**
- List table: `issueNo`, `issueDate`, `issueType`, `customerName`, `status`
- Drawer create: chọn `issueType` (SALES / OTHER), liên kết SO hoặc nhập tay
- Action: "Post" → `goodsIssuesCoreApi.post(id)` → update status

---

### 6. `inventory-core` items (ở trang MfgItems hoặc trang riêng)
**Todo ID:** `wave2-inventory-items`

- Nếu BE đã có `/api/v1/inventory/items` live → thêm tab hoặc sub-section vào MfgItems để thấy ERP items
- Hoặc tạo page `ErpInventoryItemsPage` độc lập

---

### 7. Build + smoke cuối
**Todo ID:** `wave2-build-verify`

```bash
cd /opt/repos/liouni-erp/liouni-erp-web && bun run build
cd /opt/repos/liouni-erp/liouni-erp-api && bun run start
# smoke: login → navigate từng page → không 404/500
```

---

## Quy tắc triển khai

- Không thêm 403/role-gate trong Wave 2.
- Reuse `DrawerModal`, `DataTable`, `Combobox`, `ActionDropdown` — không viết mới nếu có thể.
- Lookup item/partner: dùng `inventoryCoreApi.list` và `getBusinessPartnersPagedApi` đã có.
- Mỗi page xong: build pass + 1 smoke curl trên `:10001` trước khi commit.
- Commit theo format: `feat(wave2/<tên>): ...`

---

## Ghi chú handoff cho mai

**Anh chỉ cần nhắn:**
> `Làm wave 2 đi em, bắt đầu từ [step 0 | bom | gr | production | so | gi]`

Em sẽ tự load task list này, kiểm tra BE endpoints còn thiếu, rồi implement theo thứ tự.

**Nếu BE endpoint nào chưa có** (ví dụ `GET /api/v1/bom` chưa tồn tại), em sẽ implement BE trước theo pattern trong `src/` rồi mới wire FE. Anh không cần nhắc lại.
