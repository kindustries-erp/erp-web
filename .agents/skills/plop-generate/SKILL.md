---
name: plop-generate
description: Fast boilerplate code generator for ERP Web (erp-web) using PlopJS. Generates V2 core families, thin V2 modules wired into routes, standalone V2 modules, and legacy V1 table pages, drawers, modals and table sections.
---

# ⚡ Plop Boilerplate Generator Guide (ERP Web)

Skill này giúp AI Agent và Developer sinh boilerplate chuẩn cho **`erp-web`** với **0 tốn token** viết code lặp lại. Generator API (`erp-api`) nằm ở skill `plop-generate` của repo `erp-api`.

Chạy từ thư mục `erp/erp-web`. Thứ tự chọn generator cho module V2: họ mới → `v2-core`; họ đã có lõi → `v2-thin-module`; module đứng riêng → `v2-module`. Generator V1 chỉ dùng khi sửa module V1 cũ.

---

## 1. Generator V2 (`src/v2/`)

### 🏗️ Generator: `v2-core` (Lõi họ V2: khung UI dùng chung)

Sinh `src/v2/core/<họ>/`: api type, keys, domain, config type, locale, barrel `index.ts` và `core.manifest.json` (`exports` = `null`). Chỉ sinh khung, không có logic.

**Prompts (tương tác):** `familyInput` (kebab-case, ví dụ `customer-claims`), `entityInput` (PascalCase, ví dụ `CustomerClaim`).

- Từ chối nếu `src/v2/core/<họ>` đã tồn tại.
- Hook controller, query và drawer của họ viết tay trong `src/v2/core/<họ>/`, sau đó khai báo tên export trong `exports` của `core.manifest.json`. Chưa khai báo thì `v2-thin-module` từ chối ghép.

### 🧩 Generator: `v2-thin-module` (Module V2 mỏng ghép vào lõi)

Sinh 8 file trong `src/v2/modules/<module>/`: config ghép lõi, API client, locale, page + hook, `index.ts`, test cấu hình và test tích hợp (`tests/integration/<Pascal>Page.test.tsx`: mock API, kiểm tra danh sách gọi API).

**Prompts (tương tác):**
- `coreInput`: họ đã khai báo `exports` đủ.
- `moduleInput` (kebab-case), `titleViInput`, `titleEnInput`, `permissionInput` (để trống = theo module).
- `routeInput`: đường dẫn route (để trống = theo tên module).
- `navSection`: nhóm menu (`overview | sales | purchasing | inventory | manufacturing | accounting | settings`).
- `wireInput`: `true` để tự nối route, menu, i18n vi/en và page registry (cùng cơ chế với `v2-module`).

- Từ chối lõi chưa khai báo `exports`, hoặc thiếu export bắt buộc: `configType`, `apiType`, `keysFactory`, `recordType`, `formValueType`, `listController`, `query`, `drawer`.
- Nối bằng marker `// v2-module:<id>`, chạy lại không nhân đôi.
- Sau khi sinh: `bunx prettier --write src/v2/modules/<module>`, `bunx tsc --noEmit`, `bunx vitest run src/v2/modules/<module>`.

**Ví dụ (đã kiểm chứng trên lõi `goods-receipts`):** chọn `goods-receipts`, module `garage-goods-receipts`, nhóm `inventory`, `wire = true`.

### 📦 Generator: `v2-module` (Module V2 đứng riêng, standalone)

Sinh module V2 đầy đủ (API + DTO + queries/mutations, domain rules, components atomic, drawer + hook, page + hook, locale, test tích hợp) và **tự nối** route, mục menu, i18n và page registry bằng marker. Họ đã có lõi thì dùng `v2-thin-module` để không nhân bản code. Sau khi sinh, luôn chỉnh chi tiết theo nghiệp vụ.

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
- `fieldSpec`: `name:type[:required],...`, type ∈ `string | text | number | decimal | date | status`. `createdAt` (date) luôn có. Phải có ít nhất một trường `required`.
  - `number` (summary variant `qty`) và `decimal` (summary variant `amount`): cột có ô tổng trong summary row, căn phải, lọc kiểu số. Khớp với kiểu `decimal` của `api-module-v2`.
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
| `src/v2/app/layouts/v2-app-layout/navigation/v2Navigation.config.ts` | `// plop:v2-nav-items` | mục menu |
| `src/v2/shared/locales/vi.ts`, `en.ts` | `// plop:v2-nav-items` | nhãn `v2.nav.items.<route>` |
| `src/v2/app/router/v2PageRegistry.tsx` | `// plop:v2-page-imports`, `// plop:v2-pages` | import và entry trang |

**Checklist sau khi sinh** (generator chỉ có khung, không biết nghiệp vụ):
1. Đặt nhãn tiếng Việt/Anh trong `<namespace>.locale.ts` (hiện là tên trường).
2. Khớp DTO và endpoint với backend (`api/dtos/`, `api/<plural>Api.ts`).
3. Điều chỉnh `views.ts` (cột hiển thị theo view) và cột bảng (`columns.tsx`).
4. Viết quy tắc nghiệp vụ trong `domain/rules/` (validate, khóa trường, trạng thái).
5. Chạy `bunx prettier --write src/v2/modules/<moduleName>` (generator không format).
6. Kiểm tra: `bunx tsc --noEmit`, `bunx eslint src/v2/modules/<moduleName> --max-warnings=0`, `bunx vitest run src/v2/modules/<moduleName>`.

**Kiểm thử generator:** `bunx vitest run plop-helpers` (parse `fieldSpec`, chèn marker idempotent, sinh module đầy đủ, không còn `{{`, không import V1, mọi file ≤ 180 LoC).

---

## 2. Generator V1 (legacy, `src/modules/`) [LEGACY-V1]

Chỉ dùng khi sửa module V1 cũ. Module V2 mới không dùng các generator này.

### 📄 `table-page` [LEGACY-V1] (Table Page + API + Hook + Drawer + Locales)

Sinh 6 file: `api/[component]Api.ts`, `hooks/use[Component]List.ts`, `components/[Component]Tab.tsx`, `components/[Component]DetailDrawer.tsx`, `locales/vi.ts`, `locales/en.ts`.

```bash
bun plop table-page <moduleName> <componentName> "<pageTitle>" <tableId> <drawerType> <drawerSize> <hasDateColumn> <hasAmountColumn> <hasStatusColumn>
bun plop table-page purchase-orders-core PurchaseOrder "Đơn mua hàng" po-table multi-tab xl true true true
```

### 📑 `drawer` [LEGACY-V1] (Standalone StandardFormDrawer)

Sinh `src/modules/[module]/components/[Component]Drawer.tsx`.

```bash
bun plop drawer <moduleName> <componentName> <drawerType> <drawerSize> <hasStatus>
bun plop drawer sales-orders-core CustomerSelect 2-columns lg true
```

### 🪟 `modal` [LEGACY-V1] (Dialog Modal chuẩn Radix/Shadcn & Glassmorphism)

Sinh `src/modules/[module]/components/[Component]Modal.tsx`. `modalType`: `form` hoặc `confirm`; `modalSize`: `sm` (360px), `md` (480px), `lg` (560px), `xl` (680px).

```bash
bun plop modal <moduleName> <componentName> <modalType> <modalSize>
bun plop modal erp-invoices-core ConfirmCancel confirm sm
```

### 📊 `table-section` [LEGACY-V1] (Bảng dữ liệu nhúng cho Drawer / Section)

Sinh `src/modules/[module]/components/[Component]Section.tsx`.

```bash
bun plop table-section <moduleName> <componentName> <rowTypeName>
bun plop table-section goods-issues-core IssueLineItems IssueLineItem
```

---

## 3. Quy trình Đề xuất cho Agent

Khi nhận yêu cầu tạo màn hình hoặc module V2 mới:
1. **Kiểm tra họ**: họ đã có `src/v2/core/<họ>` chưa. Chưa có thì chạy `v2-core`, viết hook UI của lõi và khai báo `exports`. Đã có thì dùng `v2-thin-module`.
2. **Chạy Plop generator tương ứng** để tạo boilerplate chuẩn.
3. **Review và customize** các trường và nghiệp vụ riêng. Nếu không bật `wire`, tự đăng ký route và menu.
4. **Kiểm tra**: `bunx tsc --noEmit` và `bunx vitest run` trên module vừa sinh.
