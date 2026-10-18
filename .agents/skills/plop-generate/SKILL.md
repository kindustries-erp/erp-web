---
name: plop-generate
description: Fast boilerplate code generator for ERP Web and ERP API using PlopJS. Generates standardized Table Pages, Drawers, Modals, Table Sections, NestJS API Modules, and Migrations with 1 command.
---

# ⚡ Plop Boilerplate Generator Guide

Skill này giúp AI Agent và Developer tự động sinh boilerplate code chuẩn cho **`erp-web`** và **`erp-api`** với **0 tốn token** viết code lặp lại.

---

## 🌐 1. ERP Web Generators (`erp-web/`)

Chạy từ thư mục `erp/erp-web`:

### 📄 Generator 1: `table-page` (Toàn bộ module Table Page + API + Hook + Drawer + Locales)

Sinh ra 6 files chuẩn hệ thống:
1. `src/modules/[module]/api/[component]Api.ts` (CRUD + `getColumnOptions`)
2. `src/modules/[module]/hooks/use[Component]List.ts` (Server-side query + responsive pageSize)
3. `src/modules/[module]/components/[Component]Tab.tsx` (SpreadsheetPageTemplate + TableColumnHeaderFilter + rowActions)
4. `src/modules/[module]/components/[Component]DetailDrawer.tsx` (StandardFormDrawer)
5. `src/modules/[module]/locales/vi.ts`
6. `src/modules/[module]/locales/en.ts`

**Cách chạy không cần tương tác (Non-interactive):**
```bash
bun plop table-page <moduleName> <componentName> "<pageTitle>" <tableId> <drawerType> <drawerSize> <hasDateColumn> <hasAmountColumn> <hasStatusColumn>
```

**Ví dụ:**
```bash
bun plop table-page purchase-orders-core PurchaseOrder "Đơn mua hàng" po-table multi-tab xl true true true
```

---

### 📑 Generator 2: `drawer` (Standalone StandardFormDrawer)

Sinh ra: `src/modules/[module]/components/[Component]Drawer.tsx`

**Cách chạy:**
```bash
bun plop drawer <moduleName> <componentName> <drawerType> <drawerSize> <hasStatus>
```

**Ví dụ:**
```bash
bun plop drawer sales-orders-core CustomerSelect 2-columns lg true
```

---

### 🪟 Generator 3: `modal` (Dialog Modal chuẩn Radix/Shadcn & Glassmorphism)

Sinh ra: `src/modules/[module]/components/[Component]Modal.tsx`

**Cách chạy:**
```bash
bun plop modal <moduleName> <componentName> <modalType> <modalSize>
```

- `modalType`: `form` hoặc `confirm`
- `modalSize`: `sm` (360px), `md` (480px), `lg` (560px), `xl` (680px)

**Ví dụ:**
```bash
bun plop modal erp-invoices-core ConfirmCancel confirm sm
```

---

### 📊 Generator 4: `table-section` (Bảng dữ liệu nhúng cho Drawer / Section)

Sinh ra: `src/modules/[module]/components/[Component]Section.tsx`

**Cách chạy:**
```bash
bun plop table-section <moduleName> <componentName> <rowTypeName>
```

**Ví dụ:**
```bash
bun plop table-section goods-issues-core IssueLineItems IssueLineItem
```

---

### 🧩 Generator 5: `v2-module` (Module V2 chuẩn, `src/v2/`)

Sinh module V2 đúng chuẩn đã chốt ở `business-partners` (API + DTO + queries/mutations, domain rules, components atomic, drawer + hook, page + hook, locale, test tích hợp) và **tự nối** route, mục menu, i18n và page registry bằng marker. Dùng khi tạo module V2 mới hoặc khi migrate một module V1 sang V2. Sau khi sinh, luôn chỉnh chi tiết theo nghiệp vụ.

**Thứ tự tham số (non-interactive):**
```bash
bun plop v2-module <moduleName> <EntityName> <PluralName> "<titleVi>" "<titleEn>" <apiBase> <permissionCollection> <routeInput> <navSection> <tableInput> "<fieldSpec>" <hasNextCode> <wire>
```
- `moduleName`: kebab-case, vd `sample-items`.
- `EntityName` / `PluralName`: PascalCase số ít / số nhiều, vd `SampleItem` / `SampleItems`.
- `apiBase`: bắt đầu bằng `/api/`, vd `/api/v1/sample-items`.
- `permissionCollection`: collection quyền backend, vd `sample_items`.
- `routeInput`: đường dẫn `/v2/<routeInput>` (mặc định = moduleName).
- `navSection`: `overview | sales | purchasing | inventory | manufacturing | accounting | settings`.
- `tableInput`: id lưu cấu hình cột, mặc định `erp-<moduleName>-table`. Giữ đúng id V1 khi migrate để preference được nhận lại.
- `fieldSpec`: `name:type[:required],...`, type ∈ `string | text | number | date | status`. `createdAt` (date) luôn có. Phải có ít nhất một trường `required`.
- `hasNextCode`: `true` nếu backend có `GET .../next-code`. Khi `true`, trường đầu tiên phải là chuỗi và dùng làm mã.
- `wire`: `true` để tự nối route/menu/i18n; `false` để chỉ sinh file.

**Ví dụ:**
```bash
bun plop v2-module sample-items SampleItem SampleItems "Mẫu" "Sample" /api/v1/sample-items sample_items sample-items settings erp-sample-items-table "code:string:required,name:string:required,phone:string,address:text,status:status,createdAt:date" false true
```

**File sinh ra** (trong `src/v2/modules/<moduleName>/`):
- `api/dtos/`, `api/<plural>Api.ts`, `api/queries/` (keys + query), `api/mutations/`
- `domain/entities/`, `domain/rules/` (+ test)
- `components/molecules/<entity>-status-badge/` (chỉ khi có trường `status`, + test)
- `components/organisms/<entity>-table/` (cột, view, + test) và `<entity>-form/` (section form, + test)
- `drawers/<Entity>Drawer.tsx` + `.hook.ts`, `pages/<Plural>Page.tsx` + `use<Plural>Page.tsx`
- `tests/integration/<Plural>Page.test.tsx`, `<namespace>.locale.ts`, `index.ts`

**Nối vào file chung khi `wire = true`** (idempotent, chạy lại không nhân đôi):
| File | Marker | Thêm |
|---|---|---|
| `src/v2/app/router/v2RouteConfig.ts` | `// plop:v2-routes` | route |
| `src/v2/app/layouts/v2-app-layout/v2Navigation.config.ts` | `// plop:v2-nav-items` | mục menu |
| `src/v2/shared/locales/vi.ts`, `en.ts` | `// plop:v2-nav-items` | nhãn `v2.nav.items.<route>` |
| `src/v2/app/router/v2PageRegistry.tsx` | `// plop:v2-page-imports`, `// plop:v2-pages` | import và entry trang |

**Checklist sau khi sinh** (generator chỉ có khung, không biết nghiệp vụ):
1. Đặt nhãn tiếng Việt/Anh trong `<namespace>.locale.ts` (hiện là tên trường).
2. Khớp DTO và endpoint với backend (`api/dtos/`, `api/<plural>Api.ts`).
3. Điều chỉnh `views.ts` (cột hiển thị theo view) và cột bảng (`columns.tsx`).
4. Viết quy tắc nghiệp vụ trong `domain/rules/` (validate, khóa trường, trạng thái).
5. Chạy `bunx prettier --write src/v2/modules/<moduleName>` (generator không format).
6. Kiểm tra: `bunx tsc --noEmit`, `bunx eslint src/v2/modules/<moduleName> --max-warnings=0`, `bun run test src/v2/modules/<moduleName>`.

**Kiểm thử generator:** `bun run test plop-helpers` (parse `fieldSpec`, chèn marker idempotent, sinh module đầy đủ, không còn `{{`, không import V1, mọi file ≤ 180 LoC).

---

## ⚙️ 2. ERP API Generators (`erp-api/`)

Chạy từ thư mục `erp/erp-api`:

### 🚀 Generator 1: `api-module` (Full NestJS Module chuẩn)

Sinh ra:
1. `src/[module]/entities/[entity].entity.ts` (TypeORM entity có UUID, timestamps, soft delete)
2. `src/[module]/dto/create-[entity].dto.ts` (Class validator + Swagger)
3. `src/[module]/dto/update-[entity].dto.ts`
4. `src/[module]/[module].service.ts` (Pagination, Filter, Search, Sort & `getColumnOptions`)
5. `src/[module]/[module].controller.ts` (Auth & RBAC Guards + Swagger)
6. `src/[module]/[module].module.ts`

**Cách chạy:**
```bash
bun plop api-module <moduleName> <entityName> <tableName> <routePath> <permissionResource> <prefix> <hasAmount>
```

**Ví dụ:**
```bash
bun plop api-module customer-claims-core CustomerClaim erp_customer_claims customer-claims customer_claims CLM true
```

---

### 🗄️ Generator 2: `api-migration` (TypeORM Database Migration)

Sinh ra: `src/migrations/<timestamp>-<migrationName>.ts`

**Cách chạy:**
```bash
bun plop api-migration <migrationName> <tableName>
```

**Ví dụ:**
```bash
bun plop api-migration CreateCustomerClaims erp_customer_claims
```

---

## 🎯 3. Quy trình Đề xuất cho Agent

Khi nhận yêu cầu tạo màn hình hoặc module mới:
1. **Chạy Plop generator tương ứng** bằng `run_command` để tạo toàn bộ boilerplate chuẩn trong < 1 giây.
2. **Review và customize các fields đặc thù** nếu có nghiệp vụ riêng.
3. **Đăng ký PageKey và Navigation** (cho web) hoặc **import vào `app.module.ts`** (cho api).
4. **Kiểm tra TypeScript compile**: `bun run type:check`.
