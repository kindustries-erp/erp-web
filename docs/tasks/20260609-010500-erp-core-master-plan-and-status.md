# ERP Core — Master Plan, Execution History, and Current Status

> **Ngày tổng hợp:** 2026-06-09
> **Mục đích:** Bản chuẩn chỉnh để tiếp tục làm `erp-core` vào ngày mai mà không cần dựng lại context từ đầu.
> **Repos liên quan:**
> - FE: `/opt/repos/liouni-erp/liouni-erp-web`
> - BE: `/opt/repos/liouni-erp/liouni-erp-api`
> - Source schema scan / planning: `/opt/repos/liouni-erp/directus-staging`
> **Branches chính:** `erp-core`

---

## 1. Executive summary

`erp-core` là lane ERP mới tách khỏi runtime legacy/Directus, với định hướng:

- **Backend** chạy **thuần Postgres/Neon**
- **Auth** local-core (JWT) thay vì phụ thuộc Directus runtime auth
- **Frontend** giữ lại shell/layout/theme hiện có, nhưng **rewrite contract/data layer** sang API core mới
- Ưu tiên trước các flow vật tư/sản xuất cốt lõi:
  - item / inventory foundation
  - BOM
  - purchase order
  - goods receipt
  - production execute
  - sales order
  - goods issue

Hiện tại, lane `erp-core` **đã chạy được thật** trên môi trường core riêng:

- **Core API:** `liouni-erp-core-api` (port `10010`)
- **Core Web:** `liouni-erp-core-web` (port `8809`)
- **Core DB:** **Neon PostgreSQL**

Tuy nhiên, toàn chương trình **chưa thể coi là 100% complete** cho tất cả module. Một số phần đã usable và verify mạnh; một số phần mới ở mức scaffold/wiring một phần hoặc chưa có evidence QC đầy đủ.

---

## 2. Plan ban đầu — nhìn từ gốc

### 2.1 Phase 0 — Scan & planning

**Nguồn plan:**
- `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260607-erp-core-postgres-scan-and-plan.md`

### Mục tiêu ban đầu

- Scan schema Directus staging hiện có
- Scan ERP API/Web hiện có
- Xác định cái gì giữ, cái gì bỏ
- Định nghĩa target architecture cho `erp-core`
- Viết planning artifact và phased implementation plan

### Kết luận kiến trúc mong muốn từ đầu

- Source lane: Directus staging chỉ dùng để **scan/migration reference**, không phải runtime đích
- Target lane: `erp-core` phải là:
  - **Postgres-only**
  - **No Directus runtime dependency**
  - **Có lane FE/BE riêng**

---

## 3. Backend plan ban đầu

### 3.1 BE Phase / Wave 1 — API Neon bootstrap

**Nguồn plan:**
- `/opt/repos/liouni-erp/liouni-erp-api/docs/tasks/20260607-erp-core-api-neon-bootstrap.md`

### Goal ban đầu

Biến branch `erp-core` của API thành backend có thể:

- build được với Neon Postgres config
- dùng TypeORM + pg
- có datasource riêng
- có local auth skeleton
- cắt `AppModule` xuống bootstrap tối thiểu
- giảm phụ thuộc Directus runtime ở lớp bootstrap

### In-scope ban đầu

- tạo branch `erp-core`
- thêm TypeORM + `pg`
- tạo `src/db/data-source.ts`
- local auth skeleton (`core_users` baseline)
- app bootstrap tối thiểu để build được

### Out-of-scope ban đầu

- full auth production-ready
- full purchasing/sales/manufacturing flow
- web implementation

### Ý nghĩa

Giai đoạn này chỉ nhằm **dựng được nền backend core trên Neon/Postgres**. Chưa yêu cầu full business flow.

---

### 3.2 BE Phase / Wave 2 — Business modules phase 1

**Nguồn plan:**
- `/opt/repos/liouni-erp/liouni-erp-api/docs/tasks/20260607-165837-erp-core-neon-business-modules-phase1.md`

### Goal ban đầu

Dựng các business modules Postgres-native cho scope ERP core:

- employee
- business partner
- inventory
- BOM
- purchase request
- purchase order
- goods receipt
- goods issue
- sales order

### Planned tables ban đầu

- `core_users`
- `erp_employees`
- `erp_business_partners`
- `erp_inventory_items`
- `erp_inventory_transactions`
- `erp_inventory_balances`
- `erp_boms`
- `erp_bom_lines`
- `erp_purchase_requests`
- `erp_purchase_request_lines`
- `erp_purchase_orders`
- `erp_purchase_order_lines`
- `erp_goods_receipts`
- `erp_goods_receipt_lines`
- `erp_goods_issues`
- `erp_goods_issue_lines`
- `erp_sales_orders`
- `erp_sales_order_lines`

### Phase 2 extension ngay trong plan BE

Sau scaffold, đi vào executable lane đầu tiên:

- inventory core
- purchase order
- goods receipt
- receipt posting -> inventory transactions / balances
- receipt posting -> update PO line `qty_received`

### Ý nghĩa

BE plan gốc có 2 tầng:
1. dựng nền Postgres/Neon
2. dựng module nghiệp vụ + executable business flows

---

## 4. Frontend plan ban đầu

### 4.1 FE Phase / Wave 0 — Web scope cut

**Nguồn plan:**
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260607-erp-core-web-scope-cut.md`

### Goal ban đầu

Chuẩn bị lane web `erp-core` với scope route/menu tối giản:

- login
- profile
- purchasing
- inventory receipts
- BOM
- production orders
- sales/shipping

### Ý nghĩa

Đây là bước **cắt scope và chuẩn bị shell**, chưa phải rewrite full UI.

---

### 4.2 FE Master plan — UI cases 1 → 5

**Nguồn plan:**
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260607-221937-erp-core-ui-cases-1-5-plan.md`

### Goal ban đầu

Làm UI `erp-core` chạy ổn **use case 1 → 5** bằng cách:

- **reuse visual/layout cũ tối đa**
- **rewrite contract/data layer** khi lệch API core
- bỏ 403 gating trong scope core phase này
- không redesign shell/theme/modal

### Các use case ban đầu

#### Case 1 — Item / inventory foundation
- item list
- create/edit item
- search/filter
- optional stock summary

#### Case 2 — BOM nhiều cấp
- BOM list
- BOM header form
- BOM lines editor
- finished good selector
- thêm/xóa/sửa component lines

#### Case 3 — Purchase Order
- PO list
- create/edit PO
- line items
- supplier/item lookup
- status badge

#### Case 4 — Goods Receipt + post
- GR list
- create/edit GR
- chọn line nhận hàng
- nút `Post`
- lock form sau post
- posted/unposted status

#### Case 5A — Production execute
- finished good selector
- quantity input
- warehouse/branch selector nếu cần
- result summary
- error banner cho negative paths

#### Case 5B — Sales Order + Goods Issue outbound
- SO list/form
- reserve/unreserve
- GI list/form
- post GI
- status badges
- reserved/delivered display

---

## 5. Wave numbering ban đầu của FE

Theo đúng master UI plan, FE ban đầu được chia như sau:

### Wave 1 — Plumbing and route stabilization
1. Audit exact API endpoints từ backend
2. Chốt page map
3. Bỏ render 403 trong `App.tsx`
4. Cập nhật page keys / roots / breadcrumbs
5. Chuẩn hóa menu/sidebar labels
6. Tạo core API clients cho:
   - inventory
   - bom
   - po
   - gr
   - production
   - so
   - gi

### Wave 2 — Case 1 + 2
7. Wire item list/form
8. Build BOM page/editor
9. Build + smoke item/BOM routes

### Wave 3 — Case 3 + 4
10. Wire PO list/form
11. Wire GR list/form
12. Add post receipt action + locked state
13. Build + smoke PO/GR routes

### Wave 4 — Case 5
14. Build production execute page
15. Wire sales order reserve/unreserve
16. Wire goods issue create/post
17. Build + smoke production/outbound routes

### Wave 5 — QC
18. `bun run build`
19. typecheck
20. targeted tests
21. browser smoke từng route
22. đối chiếu API response với expected business state

---

## 6. Vì sao về sau lại có file `20260607-erp-core-wave2-plan.md`?

**Nguồn file:**
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260607-erp-core-wave2-plan.md`

File này là **execution plan thực tế ở thời điểm sau**, không phải nguồn gốc wave numbering kiến trúc ban đầu.

Nó dùng từ “Wave 2” theo nghĩa:

- sau khi đã có shell + page stubs + API clients
- bây giờ bắt đầu **wire data thật** vào các page core

### Scope của file `erp-core-wave2-plan.md`
- Verify BE endpoints trước
- Wire data thật cho:
  - BOM
  - Goods Receipts
  - Production
  - Sales Orders
  - Goods Issues
  - Inventory items
- Build + smoke cuối

### Kết luận

Có **2 lớp cách gọi wave**:

1. **Master FE wave numbering ban đầu**
   - Wave 1: plumbing
   - Wave 2: item + BOM
   - Wave 3: PO + GR
   - Wave 4: production + SO + GI
   - Wave 5: QC

2. **Execution plan thực tế sau đó (`erp-core-wave2-plan.md`)**
   - gọi “wave 2” theo nghĩa “giai đoạn wire data thật” sau khi stubs/API clients đã có

Do đó, khi nói chuyện nội bộ cần phân biệt:
- “wave theo plan gốc”
- “wave theo execution docs về sau”

---

## 7. Thực tế đã làm được gì đến hiện tại?

## 7.1 Backend — đã làm được

### 7.1.1 Dựng nền core trên Postgres/Neon

**Commit đáng chú ý:**
- `2a4b2e7` — `erp-core: local auth scaffold on Postgres/Neon (bcrypt + JWT, no Directus)`
- `d8606fa` — `feat(auth): add local user registration and employee profile linking`

### Kết quả
- có local auth core
- có JWT
- có bootstrap lane riêng cho core backend
- giảm phụ thuộc Directus runtime ở lớp bootstrap/auth

---

### 7.1.2 Dựng business modules core lớn

**Commit đáng chú ý:**
- `310add9` — `feat(wave2-api): implement ERP core business modules and endpoints`
- `58556c9` — `add branches-core, sales-service-orders-core, inventory-stock-core; partnerType filter for business-partners`
- `3f88108` — `add ErpMfgCoreModule - erp-manufacturing/items/components, purchase-orders, vehicles core bridge`
- `98000a0` — `complete manufacturing core detail routes and remove directus legacy`
- `39a5f83` — `add lot/serial schema+entities, map stock-summary with real lot/serial data`

### Kết quả
Đã có nền code cho các module core như:
- purchase orders
- goods receipts
- goods issues
- sales orders
- inventory
- bom
- manufacturing/production
- inventory stock
- business partners
- auth/user

---

### 7.1.3 Purchase order core contract và flow verification

**Commit đáng chú ý:**
- `2cc0736` — `fix(purchase-orders): accept purchase UI payload aliases on erp-core`
- `cb918ee` — `refactor(purchase-orders): enforce strict core contract`

### Kết quả
- đã có giai đoạn compatibility tạm cho FE
- sau đó quay về **strict core contract**
- purchase order flow đã được verify lại trên core lane thật

---

### 7.1.4 Deploy core API lane riêng

**Commit đáng chú ý:**
- `f09d359` — `chore(deploy): add erp-core elite api workflow`

### Runtime đã xác định rõ
- container: `liouni-erp-core-api`
- port: `10010`
- DB: Neon PostgreSQL
- public domain: `https://api.erp-core.liouni.com`

---

## 7.2 Backend — chưa chốt hoàn toàn

Dù đã có nhiều module và nhiều commit mạnh, **chưa nên kết luận là toàn bộ BE wave đã QC xong 100%**.

### Các điểm chưa chốt hẳn
- full reserve/unreserve flow của sales orders với evidence đầy đủ
- goods issue create/post full QC end-to-end
- production execute full QC end-to-end trên lane core hiện tại
- inventory items full contract verification bằng evidence đồng nhất
- BOM full CRUD runtime verification đồng nhất trên core lane hiện tại
- báo cáo verify tổng hợp cho toàn bộ endpoint wave 2/3/4 theo cùng một checklist

### Nói chính xác hơn
- **Code nền và endpoint phần lớn đã có**
- **Một số flow đã verify thật**
- **Nhưng chưa có evidence đồng nhất để nói toàn bộ BE hoàn tất QC 100%**

---

## 7.3 Frontend — đã làm được

### 7.3.1 Scope cut + shell/core lane

**Commit đáng chú ý:**
- `0ccbbb8` — `erp-core: scope cut FE to core-only pages/menu/auth (no Directus)`
- `91bcd7c` — `feat(wave1): wire erp-core page stubs + sidebar + i18n + API clients [erp-bom|erp-goods-receipts|erp-production|erp-sales-orders|erp-goods-issues]`

### Kết quả
- lane FE core riêng đã được dựng
- shell/menu/auth core đã được cắt scope
- page stubs core đã có
- API clients core đã có

---

### 7.3.2 Wire UI và API integration cho ERP core modules

**Commit đáng chú ý:**
- `c676ffe` — `feat(wave2-web): wire UI and API integration for ERP core modules`

### Kết quả
- bắt đầu chuyển từ stubs sang page có data thật ở nhiều module

---

### 7.3.3 BOM page

**Task evidence:**
- `docs/tasks/20260608-103200-wave2-bom-crud.md`

### Trạng thái
Theo task doc:
- Gate 0 DB Precheck: done
- Backend/API gate: done
- UI gate: done
- Validation: done
  - `bunx tsc --noEmit` PASS
  - `bun run build` PASS

### Kết luận
**BOM page đã được triển khai ở mức usable FE**.

---

### 7.3.4 Goods Receipts page

**Task evidence:**
- `docs/tasks/20260608-110000-wave2-gr-from-po.md`

**Commit đáng chú ý:**
- `52ab666` — `feat(wave2/gr): show supplier column in goods receipts list`
- `1592970` — `fix(purchase-ui): improve form layout and goods receipt po logic`

### Trạng thái
Theo task doc và runtime verify thực tế:
- list GR có data thật
- create GR từ PO đã có UI path
- logic load/filter PO đã được fix
- dropdown chọn PO trong form tạo mới đã verify runtime thật

### Root cause quan trọng đã confirm
List endpoint `/api/v1/purchase-orders` **không trả `lines`**.
Old FE filter dùng `(po.lines || []).some(...)` nên dropdown PO bị rỗng hoàn toàn.

Đã fix theo hướng:
- chỉ exclude khi status explicit là non-actionable
- nếu list không embed `lines`, trust status để show PO
- runtime UI đã confirm hiện 3 PO confirmed trong dropdown

---

### 7.3.5 Purchase / Inventory operational pages được tối ưu lại cho core contract

**Commit đáng chú ý:**
- `3828044` — `refactor(purchase): send core payload from operational UI`
- `6c6bd67` — `refactor(purchase-ui): hide non-core purchase fields`
- `f0bd13c` — `feat(erp-core): optimize purchase and inventory core views`

### Purchase page
Đã optimize columns theo core fields:
- SỐ PO
- NHÀ CUNG CẤP
- NGÀY ĐẶT
- NGÀY NHẬN DK
- TRẠNG THÁI
- TỔNG TIỀN
- TÌNH TRẠNG NHẬP

### Inventory stock page
Đã tách cột số lượng thành:
- NHẬP
- XUẤT
- TỒN

### Goods Receipt create form
Đã fix issue “không thấy PO để chọn”.

### Runtime verification đã có
Trên core web lane:
- page **Mua hàng** render columns mới thật
- page **Kho** render 3 cột `NHẬP / XUẤT / TỒN` thật
- page **Nhập kho** hiện được 3 PO confirmed trong dropdown thật

---

### 7.3.6 Build / test / push FE

**Commit cuối hiện tại:**
- `f0bd13c` — `feat(erp-core): optimize purchase and inventory core views`

### Validation đã có
- `bun run build` PASS
- pre-commit hooks PASS
- prettier PASS
- eslint PASS
- vitest: **18 files / 94 tests PASS**
- branch `erp-core` đã push lên remote

---

## 7.4 Frontend — chưa chốt hoàn toàn

### Sales Orders page
**Task evidence:**
- `docs/tasks/20260608-111500-wave2-so-reserve.md`

### Trạng thái theo task doc
- Gate 0 DB precheck: done
- Backend/API gate: **chưa tick**
- UI gate: **chưa tick**
- Validation: **chưa tick**

### Kết luận
**Sales Orders core FE chưa được chốt xong** theo task execution hiện tại.

---

### Goods Issues page
Theo plan gốc có scope:
- list
- create
- post

Nhưng hiện chưa có evidence mạnh tương đương BOM/GR để kết luận “done hoàn chỉnh”.

### Kết luận
- có dấu hiệu đã có page/hook/wiring một phần
- **chưa nên nói done hoàn toàn**

---

### Production page
Theo plan gốc cần:
- execute form
- result summary
- negative-path handling
- có thể có history

Hiện chưa có evidence QC/runtime đủ mạnh để kết luận đã done hoàn chỉnh trên FE.

### Kết luận
- có nền page/hook/api client
- **chưa có chứng cứ strong enough để close**

---

### Inventory items page riêng
Có thể đã có một phần wiring trong đợt wave2, nhưng chưa có evidence tổng hợp rõ bằng browser/runtime tương đương purchase/inventory stock/GR.

### Kết luận
- **chưa close chính thức**

---

## 7.5 Neon / Core DB — đã làm được gì

### Runtime core DB đã chạy thật
Core lane hiện đang bám Neon PostgreSQL thật, không còn dùng Directus DB để kết luận các flow core.

### Các flow/data đã có evidence thật trên core lane
- auth login
- purchase orders list/detail
- goods receipts list
- inventory stock data cho page Kho
- purchase order detail có `lines[]`

### Insight nghiệp vụ/contract đã confirm bằng data thật
- PO list endpoint không trả `lines`
- PO detail endpoint có `lines`
- filter logic FE phải bám contract thực tế này

---

## 7.6 Neon / Core DB — chưa chốt hoàn toàn

Chưa có một báo cáo schema/data audit tổng thể cho toàn bộ `erp-core` ở dạng:

- module nào đủ schema
- module nào đủ seed/data nghiệp vụ
- module nào đã có end-to-end evidence
- module nào mới chỉ có schema/code nhưng chưa smoke được

### Kết luận
- core DB đã usable cho nhiều flow thật
- nhưng **chưa có coverage audit 100% cho toàn bộ chương trình**

---

## 8. Timeline thực tế (high level)

## 2026-06-07

### API
- `2a4b2e7` — local auth scaffold on Postgres/Neon

### Web
- `0ccbbb8` — FE scope cut to core-only pages/menu/auth
- `91bcd7c` — wave1 page stubs + sidebar + i18n + API clients
- `cf777e3` — handoff plan cho wave2 data wiring

### Ý nghĩa
Ngày này là ngày dựng nền `erp-core` lane cho cả FE và BE.

---

## 2026-06-08

### API
- `310add9` — implement core business modules and endpoints
- `d8606fa` — local user registration / employee profile linking
- `58556c9`, `3f88108`, `98000a0`, `39a5f83` — mở rộng module, inventory-stock, manufacturing core, lot/serial, remove directus legacy ở nhiều chỗ
- `2cc0736`, `cb918ee` — purchase-order contract compatibility -> strict core contract

### Web
- `c676ffe` — wire UI/API integration
- `52ab666` — goods receipts supplier column
- `3828044` — send core payload from operational purchase UI
- `1592970` — improve purchase form layout + GR PO logic
- `6c6bd67` — hide non-core purchase fields

### Ý nghĩa
Ngày này là ngày bùng nổ implementation và chỉnh contract core.

---

## 2026-06-09

### Web
- `f0bd13c` — optimize purchase and inventory core views

### Runtime QC quan trọng
- verify lại đúng core lane (không dùng nhầm Directus/legacy lane)
- verify backend core endpoints trên `liouni-erp-core-api:10010`
- verify browser runtime cho:
  - Mua hàng
  - Kho
  - Nhập kho

---

## 9. Chênh lệch giữa plan ban đầu và thực tế execution

## Plan FE gốc
- Wave 1: plumbing
- Wave 2: item + BOM
- Wave 3: PO + GR
- Wave 4: production + SO + GI
- Wave 5: QC

## Thực tế execution
Thực tế delivery không đi tuần tự 100% theo numbering đó.

### Thực tế đã ưu tiên
- dựng lane trước
- có API clients + stubs trước
- sau đó đi mạnh vào:
  - BOM
  - Goods Receipts
  - Purchase/UI-core compatibility
  - Inventory stock
- rồi mới quay lại:
  - verify core lane đúng môi trường
  - fix contract mismatch
  - fix runtime UX issues
  - tối ưu table/views

### Lý do hợp lý của việc lệch plan
- endpoint/backend live cái nào trước thì FE wire cái đó trước
- chỗ nào contract mismatch thì phải fix trước khi tiếp tục wave sau
- goods receipt / purchase / inventory là các flow có giá trị smoke cao để chứng minh lane core chạy thật

---

## 10. Trạng thái hiện tại — theo module

## 10.1 FE status matrix

### Done / gần done mạnh
- Core shell / menu / auth lane
- Core API clients + page stubs
- BOM page
- Goods Receipts page
- Purchase page core-compatible columns
- Inventory stock page split columns
- Goods Receipt PO dropdown fix
- Build/test/push FE branch `erp-core`

### Partial / chưa close chính thức
- Sales Orders page
- Goods Issues page
- Production page
- Inventory items page riêng

---

## 10.2 BE status matrix

### Done / mạnh
- local auth core trên Postgres/Neon
- core lane deploy riêng
- nhiều business modules core đã có code
- purchase-order core contract đã đi qua vòng compatibility -> strict core contract
- core runtime auth + purchase/gr flow đã verify được

### Partial / chưa close chính thức
- full QC đồng nhất cho SO reserve/unreserve
- full QC đồng nhất cho GI create/post
- full QC đồng nhất cho production execute
- full QC đồng nhất cho inventory items / bom runtime hiện tại

---

## 10.3 Neon DB status matrix

### Done / mạnh
- core lane bind vào Neon thật
- purchase orders / goods receipts / inventory stock có data thật
- đủ để FE runtime một số flow chính

### Partial / chưa close chính thức
- schema/data audit tổng thể toàn bộ chương trình
- module coverage report đầy đủ
- end-to-end business verification cho mọi module

---

## 11. Điểm quan trọng phải nhớ khi làm tiếp ngày mai

### 11.1 Không verify nhầm legacy lane
Bài học rất quan trọng:
- `liouni-erp-api:10000` là legacy/Directus lane
- **ERP core phải verify trên `liouni-erp-core-api:10010`**
- pass trên legacy lane **không được tính** là xong task core

### 11.2 FE phải bám contract API thật, không suy đoán
Ví dụ thực tế:
- PO list endpoint **không có `lines`**
- PO detail endpoint **mới có `lines`**

Mọi logic filter/derive ở FE phải dựa trên shape response thật.

### 11.3 Với ERP core, ưu tiên verify theo chuỗi thật
Thứ tự an toàn:
1. verify backend core endpoint đúng lane
2. verify response shape thật
3. wire FE theo đúng shape đó
4. build
5. browser smoke/runtime verify

---

## 12. Recommended next steps cho ngày mai

## 12.1 Nếu tiếp tục theo priority thực dụng

### Ưu tiên 1 — đóng nốt outbound / production
1. Audit runtime thật của `ErpSalesOrdersPage`
2. Audit runtime thật của `ErpGoodsIssuesPage`
3. Audit runtime thật của `ErpProductionPage`
4. Đối chiếu với plan gốc:
   - SO reserve/unreserve
   - GI create/post
   - production execute + negative paths

### Ưu tiên 2 — viết bảng evidence đồng nhất theo module
Cho mỗi module, chốt 1 dòng:
- FE status
- BE status
- core endpoint verified?
- runtime browser verified?
- blocker?
- next action?

### Ưu tiên 3 — schema/data audit tối thiểu trên Neon
Làm 1 file nhỏ xác nhận:
- module nào có data thật
- module nào mới chỉ có schema/code
- module nào cần seed/demo data để smoke tiếp

---

## 12.2 Nếu muốn đóng một “wave” rõ ràng hơn

### Cách hiểu 1 — theo master plan FE gốc
- Wave 1: done
- Wave 2: partial/done-ish (BOM done, item/inventory foundation chưa đóng đủ nghĩa ban đầu)
- Wave 3: partial (PO/GR tiến xa, nhưng chưa có summary close chính thức cho toàn bộ)
- Wave 4: chưa close
- Wave 5: chưa close

### Cách hiểu 2 — theo execution thực tế hiện tại
- Core lane foundation: done mạnh
- Purchase + GR + inventory runtime slice: done mạnh
- Outbound + production slice: chưa close
- Full QC slice: chưa close

---

## 13. Gợi ý câu hỏi mở đầu cho ngày mai

Nếu tiếp tục execution, có thể bắt đầu bằng 1 trong các câu sau:

### Option A — tiếp tục theo module
> Làm tiếp `ErpSalesOrdersPage` và verify reserve/unreserve trên core lane đi em.

### Option B — tiếp tục outbound
> Verify `ErpGoodsIssuesPage` end-to-end trên core lane rồi fix phần còn thiếu.

### Option C — tiếp tục production
> Làm tiếp `ErpProductionPage`, verify positive/negative flows trên core backend trước rồi wire FE/runtime.

### Option D — làm bản audit closing
> Lập bảng audit từng module của `erp-core`: FE/BE/Neon status, evidence, blocker, next step.

---

## 14. Final assessment hiện tại

### Đã đạt
- `erp-core` **không còn chỉ là plan**, mà đã là **một lane chạy thật**
- Core API + Core Web + Neon DB đã nối được với nhau
- Một số flow chính đã usable và có evidence runtime thật
- Purchase / Goods Receipt / Inventory slice hiện là phần mạnh nhất và đáng tin nhất của lane core

### Chưa đạt hoàn toàn
- Chưa có closing report 100% cho tất cả module theo cùng chuẩn evidence
- Chưa chốt đủ mạnh cho production / sales order / goods issue
- Chưa có schema/data audit tổng thể cho toàn bộ chương trình

### Kết luận thực tế
`erp-core` hiện đang ở trạng thái:

> **Foundation + several core flows are real and usable, but the whole program is not fully closed yet.**

Nói bằng ngôn ngữ delivery nội bộ:

> **Lane core đã sống; slice purchase/receipt/inventory đã usable; outbound/production/full-QC còn cần làm tiếp.**

---

## 15. Quick reference — commits quan trọng

### API
- `2a4b2e7` — local auth scaffold on Postgres/Neon
- `310add9` — implement ERP core business modules and endpoints
- `58556c9` — inventory-stock-core / branches-core / partnerType filter
- `3f88108` — ErpMfgCoreModule / core bridge
- `98000a0` — remove directus legacy in manufacturing core detail routes
- `39a5f83` — lot/serial + stock summary mapping
- `2cc0736` — accept purchase UI payload aliases
- `cb918ee` — enforce strict core contract

### Web
- `0ccbbb8` — scope cut FE to core-only pages/menu/auth
- `91bcd7c` — wave1 stubs + sidebar + i18n + core API clients
- `c676ffe` — wire UI/API integration for ERP core modules
- `52ab666` — goods receipts supplier column
- `3828044` — send core payload from operational purchase UI
- `1592970` — improve form layout and goods receipt PO logic
- `6c6bd67` — hide non-core purchase fields
- `f0bd13c` — optimize purchase and inventory core views

---

## 16. Reference docs index

### Planning / architecture
- `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260607-erp-core-postgres-scan-and-plan.md`
- `/opt/repos/liouni-erp/liouni-erp-api/docs/tasks/20260607-erp-core-api-neon-bootstrap.md`
- `/opt/repos/liouni-erp/liouni-erp-api/docs/tasks/20260607-165837-erp-core-neon-business-modules-phase1.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260607-erp-core-web-scope-cut.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260607-221937-erp-core-ui-cases-1-5-plan.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260607-erp-core-wave2-plan.md`

### Execution notes / partial closeouts
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260608-103200-wave2-bom-crud.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260608-110000-wave2-gr-from-po.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260608-111500-wave2-so-reserve.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260608-233600-purchase-order-ui-core-compatibility-fix.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260608-235700-wave2-core-flow-verification.md`
- `/opt/repos/liouni-erp/liouni-erp-web/docs/tasks/20260609-000800-purchase-form-and-goods-receipt-ux-fixes.md`

---

## 17. Suggested follow-up file (optional)

Sau khi làm tiếp ngày mai, nên tạo thêm 1 file dạng:

`erp-core-module-audit.md`

với format:
- Module
- FE status
- BE status
- Neon DB status
- Endpoint verified
- Runtime verified
- Blocker
- Next action

File đó sẽ là checkpoint tốt để close dần từng module.
