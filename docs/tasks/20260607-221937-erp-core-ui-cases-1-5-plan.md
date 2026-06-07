# ERP Core UI Cases 1-5 Implementation Plan

> **For Hermes:** Thực thi theo hướng reuse UI cũ tối đa, giữ nguyên shell/layout/theme/modal, bỏ 403 gating trong scope ERP core Phase 1.

**Goal:** Làm UI `erp-core` chạy ổn use case 1 → 5 bằng cách tận dụng presentation/layout/component cũ tối đa, chỉ rewrite page/data layer khi contract legacy lệch ERP core.

**Architecture:** Giữ nguyên app shell hiện tại (`App.tsx`, `Sidebar`, `Topbar`, `TabBar`, theme CSS, modal/drawer/panel/shared components). Thay đổi tập trung vào route/page mapping, domain API clients/hook mới cho ERP core, và tận dụng lại các page/component cũ ở mức presentation. Không xử lý 403/phân quyền UI trong phase này.

**Tech Stack:** React, TypeScript, Zustand, Axios, shared Drawer/DataTable/PageLayout components, Bun build toolchain.

---

## 1. Scope and constraints

### In scope

- UI cho use case 1 → 5:
  1. Item / inventory foundation
  2. BOM nhiều cấp
  3. Purchase Order
  4. Goods Receipt + post
  5. Production execute + Sales/Goods Issue outbound
- Chỉnh route/menu/page wiring để lane `erp-core` dùng đúng contract API mới.
- Reuse component cũ tối đa.
- Có thể viết page/hook/api mới nếu màn cũ lệch contract.

### Out of scope

- 403 / role-based permissions UI
- redesign layout/theme/modal
- refactor lớn ngoài scope case 1 → 5
- cleanup manufacturing legacy không liên quan trực tiếp

### Hard constraints

- Không đổi shell/layout/theme/modal pattern.
- Không làm hỏng `Sidebar`, `Topbar`, `TabBar`, `SlidePanel`, `Toast`, CSS theme hiện có.
- Không tuyên bố xong nếu chưa build + smoke được route thực.

---

## 2. Current audited state

## 2.1 Shell and routing state

### Observed files

- `src/App.tsx`
- `src/core/components/layout/Sidebar.tsx`
- `src/core/config/appStore.ts`
- `src/shared/types/index.ts`
- `src/shared/utils/pageUrl.ts`

### Findings

- Shell hiện tại mỏng, dễ giữ nguyên:
  - `App.tsx` mount `Sidebar`, `Topbar`, `TabBar`, `SlidePanel`, `Toast`, `ReloadPrompt`, `ContextMenu`.
- Current page keys đang tối thiểu:
  - `dashboard`
  - `sales`
  - `purchasing`
  - `inventory`
  - `mfg-items`
  - `mfg-purchase-orders`
  - `mfg-vehicles`
- `App.tsx` hiện còn branch:
  - `forbidden ? <ErrorPage code="403" /> : ...`
- `Sidebar.tsx` đang chia section:
  - Sales
  - Purchasing
  - Manufacturing
- Route/page/tab store đang dựa trên `PageKey`, `SECTION_ROOTS`, `BREADCRUMBS`, `ALL_PAGE_KEYS`.

### Impact

- Giữ shell là dễ.
- Cần đổi rất ít ở plumbing route/store nếu tiếp tục dùng page keys cũ như aliases cho lane mới.
- Có thể loại bỏ nhánh `forbidden` trong `App.tsx` mà không ảnh hưởng layout.

---

## 2.2 Legacy screen audit

### `src/pages/MfgItems.tsx`

- Màn giàu UI nhất trong nhóm manufacturing.
- Đã có sẵn:
  - `PageLayout`
  - `DataTable`
  - `ActionDropdown`
  - `DrawerModal`
  - `Combobox`
  - detail modal/panel patterns
- Nhưng data layer đang bám chặt `manufacturingApi` legacy `/api/v1/erp-manufacturing/*`.
- Form hiện nghiêng về `component` hơn là item/bom tổng quát.

**Decision:** Reuse mạnh presentation + table/drawer pattern; rewrite/replace data contract cho ERP core.

### `src/pages/MfgPurchaseOrders.tsx`

- Màn mỏng, chủ yếu table đơn giản + import excel.
- Contract gắn vào manufacturing PO legacy.
- Ít giá trị reuse về business behavior.

**Decision:** Có thể giữ visual/table shell, nhưng page này phù hợp viết lại theo ERP core PO/GR hơn là vá tiếp.

### `src/pages/MfgVehicles.tsx`

- Màn mỏng, là danh sách VIN/vehicle legacy.
- Không khớp trực tiếp use case Phase 1 mới, trừ phần metadata output production.

**Decision:** Không dùng làm màn chính. Có thể tái dùng vài cách hiển thị summary nếu cần, nhưng không phải base page cho Phase 1.

---

## 2.3 Existing reusable operational framework

### Observed files

- `src/pages/Sales.tsx`
- `src/pages/Purchasing.tsx`
- `src/pages/Inventory.tsx`
- `src/modules/operational/components/OperationalListPage.tsx`
- `src/modules/operational/components/OperationalFormDrawer.tsx`

### Findings

- Repo đã có sẵn khung operational khá mạnh:
  - list page
  - drawer form
  - filters
  - status badge
  - posting actions
  - branch/partner loading
- Đây là candidate tốt để reuse visual/pattern cho:
  - purchase orders
  - goods receipts
  - sales orders
  - goods issues
- Nhưng contract hiện tại thuộc lane operational cũ, không phải ERP core phase 1.

**Decision:** Reuse presentation/pattern ở mức component và UX structure; không ép giữ nguyên data schema hiện tại nếu contract lệch backend mới.

---

## 2.4 Legacy manufacturing API audit

### Observed file

- `src/modules/manufacturing/api/manufacturingApi.ts`

### Findings

- Base endpoint cũ: `/api/v1/erp-manufacturing`
- Kiểu dữ liệu đang mô hình hóa:
  - item/components
  - purchase orders legacy
  - vehicle/VIN
  - stock summary / txns
- Contract này là legacy riêng, không phải source of truth cho `erp-core` phase 1 hiện tại.

**Decision:** Không kéo dài API client này cho Phase 1. Tạo API client ERP core riêng cho case 1 → 5.

---

## 3. Delivery contract for UI phase

## 3.1 Gate assumptions from backend

- DB gate: đã có nền item, bom, po, goods receipt, sales order, goods issue, production order/materials.
- API gate: đã có JWT/local auth và core business endpoints.
- UI gate: đang thiếu mapping route/page/client đúng contract core.

## 3.2 UI non-negotiables

- UI chỉ consume contract API thật.
- Không đoán field/status từ memory.
- Không hardcode 403 gating trong phase này.
- Không đổi CSS token/theme shell.

---

## 4. Route and page strategy

## 4.1 Navigation strategy

Ưu tiên **giữ page keys cũ nếu giúp giảm churn**, nhưng remap meaning theo lane `erp-core`.

### Suggested mapping

- `mfg-items` → page quản lý **Item + inventory foundation**
- `mfg-purchase-orders` → page entry cho **PO / Goods Receipt** hoặc PO core
- `mfg-vehicles` → thay bằng **Production / outbound** hoặc đổi sang page key mới nếu code rõ ràng hơn

### Better long-term page keys (optional)

Nếu churn chấp nhận được, tạo page keys mới:

- `erp-items`
- `erp-bom`
- `erp-purchase-orders`
- `erp-goods-receipts`
- `erp-production`
- `erp-sales-orders`
- `erp-goods-issues`

### Recommended execution choice

Để nhanh pass Phase 1, dùng hybrid:

- Giữ top-level roots cũ để giảm sửa store/tab/url lớn.
- Bên trong mỗi page root, render tab/section core mới.
- Chỉ mở rộng `PageKey` mới nếu thực sự cần tách route rõ.

---

## 4.2 403 removal strategy

### Required change

Trong `src/App.tsx`:

- bỏ branch `forbidden ? <ErrorPage code="403" /> : ...`
- luôn render page content khi logged in

### Notes

- Không cần xoá toàn bộ state `forbidden` ở round đầu nếu chưa ảnh hưởng gì.
- Chỉ cần ngắt nó khỏi UI rendering path để không chặn use case.

---

## 5. Reuse matrix

## 5.1 Reuse as-is

Các thành phần phải giữ nguyên và tái dùng trực tiếp:

- `Sidebar`
- `Topbar`
- `TabBar`
- `SlidePanel`
- `Toast`
- `PageLayout`
- `DrawerModal`
- `DrawerSection`
- `DrawerField`
- `DataTable`
- `ActionDropdown`
- `Combobox`
- `FilterPanel`
- badge/status shared components
- theme styles under `src/styles/*`

## 5.2 Reuse with new data layer

Các khối nên giữ presentation nhưng thay hook/api:

- `MfgItems`
- `OperationalListPage`
- `OperationalFormDrawer`
- một số table/status/filter patterns trong các page list hiện có

## 5.3 Rewrite inside old shell

Các page nên viết lại trong shell cũ thay vì vá sâu:

- BOM editor page/form
- Production execute page
- Goods Receipt post flow page nếu pattern operational cũ không khớp payload/action
- Goods Issue post flow page nếu action state cũ không khớp

---

## 6. Use-case implementation plan

## Case 1: Item / inventory foundation

### Objective

Tạo/sửa/list item từ UI theo contract ERP core, giữ nguyên visual style cũ.

### Recommended base

- Reuse `MfgItems` presentation shell.
- Replace `manufacturingApi` calls bằng `inventory-core` API client mới.

### UI pieces

- item list
- create/edit drawer
- status active/inactive
- search/filter cơ bản
- optional stock summary nếu backend đã có endpoint tương ứng

### Files likely to modify/create

- Modify: `src/pages/MfgItems.tsx`
- Create: `src/modules/inventory-core/api/*.ts`
- Create: `src/modules/inventory-core/hooks/*.ts`
- Create or modify: `src/modules/inventory-core/types/*.ts`

### Acceptance

- tạo item mới thành công
- sửa item thành công
- reload vẫn đúng
- lỗi field hiển thị rõ

---

## Case 2: BOM nhiều cấp

### Objective

Cho phép tạo/sửa BOM nhiều cấp để production execute dùng được.

### Recommended base

- Không ép dùng page legacy hiện tại.
- Dùng shell shared cũ (`PageLayout`, `DrawerModal`, `DataTable`) để làm page mới gọn và sạch.

### UI pieces

- BOM list
- BOM header form
- BOM lines table/editor
- chọn item finished good
- thêm/xoá/sửa component lines

### Files likely to create

- `src/pages/ErpBom.tsx` hoặc mount trong root manufacturing hiện có
- `src/modules/bom-core/api/*.ts`
- `src/modules/bom-core/hooks/*.ts`
- `src/modules/bom-core/components/*`
- `src/modules/bom-core/types/*.ts`

### Acceptance

- tạo BOM con + BOM cha
- mở lại detail thấy line đúng
- update/save được
- không phá shell/theme/modal

---

## Case 3: Purchase Order

### Objective

Tạo/sửa/list PO đúng contract ERP core.

### Recommended base

- Reuse pattern từ `OperationalListPage` + `OperationalFormDrawer` nếu payload gần.
- Nếu khác nhiều, tách page PO core mới nhưng giữ DataTable/Drawer visual cũ.

### UI pieces

- PO list
- create/edit PO form
- line items
- status badge
- supplier/item lookup

### Files likely to modify/create

- Create: `src/modules/purchase-orders-core/api/*.ts`
- Create: `src/modules/purchase-orders-core/hooks/*.ts`
- Reuse/modify: `src/modules/operational/components/*` hoặc fork nhẹ sang core module
- Create page root nếu cần

### Acceptance

- tạo PO nhiều dòng
- đọc lại detail đúng
- status hiển thị đúng

---

## Case 4: Goods Receipt + post

### Objective

Cho phép tạo phiếu nhập từ PO và post để reflect tồn kho.

### Recommended base

- Reuse action bar/button/badge/table patterns từ operational flow.
- Có thể cần page/hook riêng vì behavior `post` và locking state là trọng tâm.

### UI pieces

- GR list
- create/edit form
- chọn line nhận hàng
- nút `Post`
- lock form sau post
- status posted/unposted

### Files likely to create

- `src/modules/goods-receipts-core/api/*.ts`
- `src/modules/goods-receipts-core/hooks/*.ts`
- `src/modules/goods-receipts-core/components/*`
- page root hoặc panel mới

### Acceptance

- tạo GR từ UI
- post được
- reload thấy status đúng
- fields/actions bị disable đúng sau post

---

## Case 5A: Production execute

### Objective

Thực thi sản xuất từ BOM nhiều cấp qua UI, hiển thị summary và lỗi business rõ ràng.

### Recommended base

- Viết page mới là sạch nhất.
- Dùng shared `PageLayout`, `DrawerModal`/`Panel`, `ErrorBanner`, `Card`, `Button` cũ.

### UI pieces

- finished good selector
- quantity input
- warehouse/branch selector nếu cần
- optional frame/engine metadata
- result summary materials issue + FG receipt
- error banner cho negative paths

### Files likely to create

- `src/modules/production-core/api/*.ts`
- `src/modules/production-core/hooks/*.ts`
- `src/modules/production-core/components/*`
- `src/pages/ErpProduction.tsx` hoặc page mount tương đương

### Acceptance

- execute thành công từ UI
- summary kết quả hiển thị đúng
- lỗi thiếu tồn / cycle BOM / thiếu BOM active hiển thị rõ

---

## Case 5B: Sales order + Goods Issue outbound

### Objective

Tạo SO, reserve/unreserve, tạo/post goods issue.

### Recommended base

- Reuse mạnh pattern từ `OperationalListPage` và drawer cũ.
- Tách action data layer mới cho reserve/unreserve/post.

### UI pieces

- SO list/form
- reserve/unreserve actions
- GI list/form
- post GI action
- status badges
- delivered/reserved display

### Files likely to create

- `src/modules/sales-orders-core/api/*.ts`
- `src/modules/sales-orders-core/hooks/*.ts`
- `src/modules/goods-issues-core/api/*.ts`
- `src/modules/goods-issues-core/hooks/*.ts`
- shared components cho outbound status/actions nếu cần

### Acceptance

- tạo SO được
- reserve/unreserve được
- tạo GI và post GI được
- reload phản ánh state đúng

---

## 7. Suggested implementation order

### Wave 1: Plumbing and route stabilization

1. Audit lại exact API endpoints từ backend repo cho case 1 → 5.
2. Chốt final page map (giữ key cũ hay thêm key mới).
3. Loại bỏ nhánh render 403 trong `App.tsx`.
4. Cập nhật `PageKey`, `SECTION_ROOTS`, `BREADCRUMBS`, `ALL_PAGE_KEYS` nếu cần.
5. Chuẩn hoá menu/sidebar labels nhưng không đổi layout.
6. Tạo core API clients cho inventory/bom/po/gr/production/so/gi.

### Wave 2: Case 1 + 2

7. Wire item list/form.
8. Build BOM page/editor.
9. Build + smoke item/BOM routes.

### Wave 3: Case 3 + 4

10. Wire PO list/form.
11. Wire GR list/form.
12. Add post receipt action + locked state.
13. Build + smoke PO/GR routes.

### Wave 4: Case 5

14. Build production execute page.
15. Wire sales order actions reserve/unreserve.
16. Wire goods issue create/post.
17. Build + smoke production/outbound routes.

### Wave 5: QC

18. `bun run build`
19. typecheck script nếu repo có
20. targeted tests nếu repo có setup phù hợp
21. browser smoke từng route
22. đối chiếu API responses với expected business state

---

## 8. File-level action plan

## 8.1 Files expected to change

- `src/App.tsx`
- `src/core/components/layout/Sidebar.tsx`
- `src/core/config/appStore.ts`
- `src/shared/types/index.ts`
- `src/shared/utils/pageUrl.ts`
- `src/pages/MfgItems.tsx`
- có thể thêm pages core mới dưới `src/pages/`

## 8.2 New modules expected

- `src/modules/inventory-core/`
- `src/modules/bom-core/`
- `src/modules/purchase-orders-core/`
- `src/modules/goods-receipts-core/`
- `src/modules/production-core/`
- `src/modules/sales-orders-core/`
- `src/modules/goods-issues-core/`

## 8.3 Reuse targets to preserve

- `src/shared/components/PageLayout.tsx`
- `src/shared/components/DrawerModal.tsx`
- `src/shared/components/DataTable.tsx`
- `src/shared/components/ActionDropdown.tsx`
- `src/shared/components/FilterPanel.tsx`
- `src/shared/components/Toast.tsx`
- `src/shared/components/SlidePanel.tsx`
- `src/styles/*`

---

## 9. Verification plan

## 9.1 Technical verification

Run in repo web:

```bash
bun install
bun run build
```

If available:

```bash
bun run type:check
bunx vitest run
```

## 9.2 UI verification checklist

- login vào app được
- shell không bể
- theme không đổi
- modal/drawer mở đúng như cũ
- không còn chặn bằng màn 403 trong scope này
- route từng case mở được
- submit action không crash page
- reload vẫn đọc được data từ API

## 9.3 Business route smoke minimum

- Case 1: create/edit item
- Case 2: create/edit BOM parent-child
- Case 3: create PO
- Case 4: create + post GR
- Case 5A: execute production positive + negative path
- Case 5B: create SO + reserve/unreserve + create/post GI

---

## 10. Risks and mitigations

### Risk 1

Legacy manufacturing screens nhìn giống nhu cầu mới nhưng contract rất lệch.

**Mitigation:** Reuse presentation only; replace hooks/api first.

### Risk 2

Operational pages reuse quá mức có thể kéo theo field/status cũ.

**Mitigation:** Tách types/core DTOs mới, không dùng raw operational interfaces nếu lệch API.

### Risk 3

Route/page key đổi quá mạnh làm bể tab store.

**Mitigation:** Ưu tiên giữ roots hiện có hoặc migrate từng bước với aliases.

### Risk 4

Production/GI post actions cần lock-state rõ, nếu reuse form cũ không đủ sẽ tạo mismatch UI.

**Mitigation:** Tạo action guards/read-only states riêng trong core hooks.

---

## 11. Recommended first execution slice

Để ra kết quả nhanh nhất mà ít phá vỡ nhất, execution nên bắt đầu như sau:

1. Xác nhận exact ERP core endpoints từ API repo.
2. Bỏ render 403 ở `App.tsx`.
3. Giữ shell/page roots hiện tại.
4. Rewire `MfgItems` thành Item foundation page mới.
5. Tạo BOM page mới trong manufacturing root.
6. Reuse operational shell cho PO/GR/SO/GI.
7. Tạo page riêng cho production execute.
8. Build và smoke từng wave.

---

## 12. Final acceptance definition

UI Phase 1 được coi là hoàn tất khi đồng thời đúng cả 3 lớp sau:

### UX/shell

- layout cũ giữ nguyên
- theme cũ giữ nguyên
- modal/drawer/panel pattern cũ giữ nguyên

### Functional

- use case 1 → 5 chạy được từ UI
- không bị 403 gating chặn
- state/status/action visibility hợp lý theo business flow

### Evidence

- web build pass
- route smoke pass
- action smoke pass
- negative paths production hiển thị được

---

## 13. Execution note

Nếu thực thi ngay sau plan này, ưu tiên chiến lược:

- **reuse visual, rewrite contract**
- không cố “sửa cho hợp” các màn legacy đã lệch kiến trúc
- chỉ cần user flow chạy chắc, không tối ưu hóa thẩm mỹ hay refactor rộng
