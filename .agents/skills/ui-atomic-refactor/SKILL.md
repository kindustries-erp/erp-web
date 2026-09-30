---
name: ui-atomic-refactor
description: Quy chuẩn và trợ lý bắt buộc về 5 Tầng Atomic Design (Atoms, Molecules, Organisms, Templates, Pages), Cross-Cutting Features, Co-located Testing trong Liouni ERP Web. Chia tách file lớn (> 200 LoC) thành cấu trúc Atomic chuẩn (Domains, Hooks, Utils, Components, Tests), bắt buộc 100% Đa ngôn ngữ (i18n VI/EN), tối ưu Web Responsive toàn diện và tuân thủ No Blue Mandate.
---

# ⚛️ UI Atomic Component & Architectural Standards (`/ui-atomic-refactor`)

> ⚡ **Mục tiêu cốt lõi**: Đảm bảo toàn bộ mã nguồn giao diện trong `erp-web` được tổ chức mạch lạc, phân lớp rõ ràng theo đúng chuẩn **5 Tầng Atomic Design (Brad Frost) kết hợp Domain-Driven Design (DDD)**. Tuyệt đối không để xảy ra tình trạng các file Component phình to thành hàng ngàn dòng code (God Components / Monolithic Files) hoặc thư mục `shared` biến thành bãi rác không kiểm soát.

---

## 🏛️ 1. Mô Hình Kiến Trúc Phân Lớp Toàn Diện (5-Stage Atomic Design)

```mermaid
graph TD
  subgraph Level 1: Atoms [1. ⚛️ Atoms / UI Primitives - @/shared/components/ui & @/shared/components/atoms]
    A1[Button, Dialog, Input, Badge, Checkbox, Calendar, Tooltip, Popover, Icons...]
    A1_Note[0% Logic nghiệp vụ, Pure UI, Stateless, Props-driven]
  end

  subgraph Level 2: Molecules [2. 🧬 Molecules - @/shared/components/molecules]
    M1[PillTabs, Combobox, BufferedTextarea, DatePicker, CopyButton, TabItem...]
    M1_Note[UI + Local UI State only: useState/useRef, 0% API/Store]
  end

  subgraph Level 3: Organisms [3. 🧫 Organisms - @/shared/components/organisms & @/core/components/organisms]
    O1[StandardTable, DataTable, StandardFormDrawer, ConfirmModal, FilterPanel, Sidebar, custom-fields...]
    O1_Note[Khối UI phức hợp hoàn chỉnh, có Store/RBAC/Form/API kết nối qua Hooks]
  end

  subgraph Level 4: Templates [4. 📄 Templates - @/shared/components/templates]
    T1[SpreadsheetPageTemplate, DashboardTemplate, PageLayout, PageWithTabsLayout...]
    T1_Note[Khung xương layout trang/bảng/drawer mẫu chưa gắn dữ liệu nghiệp vụ]
  end

  subgraph Shared Non-UI Foundations [📦 Shared Non-UI Foundations - @/shared/types, constants, hooks, utils]
    N1[types/customFields.ts, constants/customFields.tsx, hooks/useModuleConfigQuery.ts, utils/customFieldHelper.ts...]
  end

  subgraph Level 5: Pages / Modules [5. 📑 Pages & Domain Modules - @/modules & @/pages]
    P1[erp-invoices-core, inventory-core, garage, accounting, settings, warehouse...]
  end

  Level 5 -->|Import| Level 4
  Level 5 -->|Import| Level 3
  Level 5 -->|Import| Level 2
  Level 5 -->|Import| Level 1
  Level 5 -->|Import| Shared Non-UI Foundations
  Level 4 -->|Import| Level 3
  Level 4 -->|Import| Level 2
  Level 4 -->|Import| Level 1
  Level 3 -->|Import| Level 2
  Level 3 -->|Import| Level 1
  Level 3 -->|Import| Shared Non-UI Foundations
  Level 2 -->|Import| Level 1
  Level 2 -->|Import| Shared Non-UI Foundations

  subgraph Module Import Rule [🔍 Module vs Shared Same-Level Exception]
    M_Org[Module Organisms] -.->|Allowed Import| O1
    M_Mol[Module Molecules] -.->|Allowed Import| M1
    M_Atm[Module Atoms] -.->|Allowed Import| A1
  end
```

---

## 🔄 2. Quy Tắc Thứ Tự Phân Cấp Import & Ràng Buộc Phụ Thuộc (Strict Import Hierarchy Mandate)

> [!IMPORTANT]
> **THỨ TỰ PHỤ THUỘC BẮT BUỘC: `TEMPLATES > ORGANISMS > MOLECULES > ATOMS`**.
> Chiều phụ thuộc là **MỘT CHIỀU DUY NHẤT (Unidirectional Top-Down Flow)**. Tầng cao hơn được phép import tầng thấp hơn, tầng thấp hơn **TUYỆT ĐỐI KHÔNG ĐƯỢC** import tầng cao hơn.

### A. Chiều Phân Cấp Import Chi Tiết:
1. **Templates (Level 4)**: Được phép import `Organisms` (Level 3), `Molecules` (Level 2), `Atoms` (Level 1).
2. **Organisms (Level 3)**: Được phép import `Molecules` (Level 2), `Atoms` (Level 1), và `Shared Non-UI Foundations`. **CẤM** import ngược lên `Templates` hoặc `Pages`.
3. **Molecules (Level 2)**: Chỉ được phép import `Atoms` (Level 1) và `Shared Non-UI Foundations`. **CẤM** import ngược lên `Organisms`, `Templates`, hoặc `Pages`.
4. **Atoms (Level 1)**: Pure UI Primitives, độc lập hoàn toàn. **CẤM** import bất kỳ tầng nào phía trên (`Molecules`, `Organisms`, `Templates`, `Pages`).
5. **Pages / Domain Modules (Level 5)**: Đỉnh của cây phụ thuộc, được phép import bất kỳ tầng nào bên dưới (`Templates`, `Organisms`, `Molecules`, `Atoms`).

### B. Quy Tắc Cấm Import Ngang Cấp (No Lateral / Sibling Imports):
* **CẤM IMPORT NGANG CẤP TRONG CÙNG SCOPE**: Các component cùng một level (giữa các `Atoms` với nhau, giữa các `Molecules` với nhau, giữa các `Organisms` với nhau) **KHÔNG ĐƯỢC** import trực tiếp lẫn nhau để tránh circular dependency, coupling chặt và khó bảo trì.
* *Cách xử lý chuẩn khi cần phối hợp*:
  * Nếu cần kết hợp 2 `Atoms` $\rightarrow$ Tạo 1 `Molecule` để compose.
  * Nếu cần kết hợp 2 `Molecules` $\rightarrow$ Tạo 1 `Organism` để compose.
  * Nếu cần dùng chung logic/state $\rightarrow$ Trích xuất ra `hooks/` hoặc `utils/` dùng chung.

### C. Quy Tắc Ngoại Lệ: Cùng Level trong Modules ĐƯỢC PHÉP Import Cùng Level trong Shared (`modules/level_X -> shared/level_X`):
* **NGOẠI LỆ HỢP LỆ VÀ ĐƯỢC KHUYẾN KHÍCH**: Một component tại Level $X$ bên trong một Domain Module (`src/modules/<module-name>/components/...`) **ĐƯỢC PHÉP** import component tại cùng Level $X$ từ Shared Core (`@/shared/components/...`):
  * **Module Organism** $\rightarrow$ Được phép import **Shared Organism** (Ví dụ: `InvoicePaymentDrawer` import `@/shared/components/organisms/StandardFormDrawer` hoặc `StandardTable`).
  * **Module Molecule** $\rightarrow$ Được phép import **Shared Molecule** (Ví dụ: `InventoryStatusFilter` import `@/shared/components/molecules/PillTabs` hoặc `Combobox`).
  * **Module Atom** $\rightarrow$ Được phép import **Shared Atom** (Ví dụ: `ModuleStatusDot` import `@/shared/components/atoms/RequiredIndicator` hoặc `@/shared/components/ui/Badge`).
* *Lý do kiến trúc*: Thư mục `@/shared` đóng vai trò là **Generic Base Library / Foundation** dùng chung toàn hệ thống, trong khi `modules` là **Domain Implementations**. Việc Module component tái sử dụng Shared component cùng cấp là hoàn toàn tự nhiên và đúng chuẩn OOP/Component Inheritance.

### D. Ma Trận Quyền Import (Component Import Permission Matrix):

| Caller (Thành phần gọi) | Gọi Atom (`L1`) | Gọi Molecule (`L2`) | Gọi Organism (`L3`) | Gọi Template (`L4`) | Gọi Shared Non-UI | Gọi Ngang Cấp Cùng Scope | Gọi Ngang Cấp Sang Shared |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Page / Module Page** (`L5`) | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ⚠️ Tránh | ✅ Cho phép |
| **Template** (`L4`) | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ❌ CẤM | ✅ Cho phép | ❌ CẤM | ✅ Cho phép |
| **Organism (Shared)** (`L3`) | ✅ Cho phép | ✅ Cho phép | ❌ CẤM | ❌ CẤM | ✅ Cho phép | ❌ CẤM | — |
| **Organism (Module)** (`L3`) | ✅ Cho phép | ✅ Cho phép | ❌ CẤM (Module) | ❌ CẤM | ✅ Cho phép | ❌ CẤM (Module) | ✅ Cho phép (Shared Organism) |
| **Molecule (Shared)** (`L2`) | ✅ Cho phép | ❌ CẤM | ❌ CẤM | ❌ CẤM | ✅ Cho phép | ❌ CẤM | — |
| **Molecule (Module)** (`L2`) | ✅ Cho phép | ❌ CẤM (Module) | ❌ CẤM | ❌ CẤM | ✅ Cho phép | ❌ CẤM (Module) | ✅ Cho phép (Shared Molecule) |
| **Atom (Shared)** (`L1`) | ❌ CẤM | ❌ CẤM | ❌ CẤM | ❌ CẤM | ✅ Types/Utils | ❌ CẤM | — |
| **Atom (Module)** (`L1`) | ❌ CẤM | ❌ CẤM | ❌ CẤM | ❌ CẤM | ✅ Types/Utils | ❌ CẤM (Module) | ✅ Cho phép (Shared Atom) |

---

## 📐 3. Quy Chuẩn Đặt Tên & Cấu Trúc Thư Mục (Folder-per-Component Standard)

> [!IMPORTANT]
> **QUY TẮC BẮT BUỘC: MỖI COMPONENT PHẢI NẰM TRONG 1 THƯ MỤC RIÊNG BIỆT (`kebab-case`)**.

| Thành Phần | Định Dạng (Case) | Quy Ước Đặt Tên | Ví Dụ Chuẩn ✅ | Sai ❌ |
| :--- | :--- | :--- | :--- | :--- |
| **Thư mục Component** | `kebab-case` | Mỗi component nằm trong 1 folder riêng | `env-stamp/`, `tab-item/`, `sidebar/`, `top-bar/` | `EnvStamp/`, `tabItem/` |
| **File Component TSX** | `PascalCase.tsx` | Tên file component chính | `EnvStamp.tsx`, `TabItem.tsx`, `TopBar.tsx` | `envStamp.tsx`, `tab-item.tsx` |
| **File Component Icons** | `PascalCase.tsx` | Nhóm hoặc file icon SVG | `NavigationIcons.tsx`, `UiIcons.tsx` | `navigation-icons.tsx` |
| **File Hook** | `camelCase.ts` | Bắt đầu bằng tiền tố `use` | `useTabDrag.ts`, `useSidebarPermissions.ts` | `UseTabDrag.ts` |
| **File Helpers / Utils** | `camelCase.ts` | Tên mô tả chức năng | `excelUtils.ts`, `customFieldHelper.ts` | `ExcelUtils.ts` |
| **File Constants / Types** | `camelCase.ts` | Tên file mô tả | `constants.ts`, `types.ts`, `options.ts` | `Constants.ts` |

---

## 🧪 4. Nguyên Tắc Co-located Testing Bắt Buộc (2-Tier Colocation Testing Mandate)

> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG DỒN TEST VÀO THƯ MỤC ROOT `__tests__` TẬP TRUNG**.
> Mọi Unit Test và Integration Test bắt buộc phải nằm **Co-located (đi kèm)** với component/feature tương ứng.

### Quy tắc phân định 2 cấp độ Co-located Test:

```
1. Component Folder Đơn Lẻ (Atoms, Molecules, Single Organisms):
   └── tab-item/
       ├── TabItem.tsx              # Component TSX
       ├── TabItem.test.tsx         # Test đặt TRỰC TIẾP CÙNG CẤP
       └── index.ts                 # Public Export

2. Multi-Component Organisms / Complex Organism Test Suites:
   └── src/shared/components/organisms/__tests__/  (hoặc src/core/components/organisms/sidebar/__tests__/)
       ├── ModuleCustomFieldConfigDrawer.test.tsx
       └── ModuleEntityCustomFieldsSection.test.tsx
```

| Cấp Độ | Vị Trí File Test | Lý Do Kiến Trúc |
| :--- | :--- | :--- |
| **Component Đơn Lẻ**<br>*(Atoms, Molecules, Single Organisms)* | **Trực tiếp cùng cấp (`ComponentName.test.tsx`)** | Tinh gọn, không tạo thư mục con `__tests__` lồng nhau vô nghĩa khi chỉ có 1-2 files. Mang folder đi đâu test đi theo đó (Plug-and-Play). |
| **Organism Test Suites**<br>*(Có $\ge 3$ sub-components / mock phức hợp)* | **Thư mục `__tests__/` nội bộ của tầng Organisms** | Phân tách rõ ràng giữa mã nguồn runtime và bộ test tích hợp (mock data, fixtures, integration specs). |
| **Pure Non-UI Helpers / Utils** | **Trực tiếp cùng cấp (`helperName.test.ts`)** | Co-located với utility functions trong `src/shared/utils/`. |
| **Root Setup & Global Flow Tests** | `src/test/` | Chỉ dùng cho `setup.ts`, `test-utils.tsx`, `server.ts` (MSW) và Test luồng toàn cục (`App.routing.test.tsx`). |

---

## 📏 5. Giới Hạn File (< 180 LoC) & Cấu Trúc Phân Lớp Thư Mục Chuẩn

### A. Quy tắc Bóc Tách Non-UI vs UI Components
- **Chỉ chứa UI Components**: Các thư mục `src/shared/components/` (bao gồm `atoms/`, `molecules/`, `organisms/`, `templates/`) **CHỈ CHỨA 100% UI PRESENTATION CODE** và cục bộ UI tests/hooks.
- **Bóc tách Non-UI Files**:
  - `src/shared/types/`: Toàn bộ TypeScript interfaces & types dùng chung (`customFields.ts`, `table.ts`, ...).
  - `src/shared/constants/`: Toàn bộ Constants & Registry tĩnh (`customFields.tsx`, `routes.ts`, ...).
  - `src/shared/hooks/`: Toàn bộ React Hooks dùng chung (`useModuleConfigQuery.ts`, `useCustomFieldMutations.ts`, ...).
  - `src/shared/utils/`: Toàn bộ Pure Helpers, Parsers, Validations (`customFieldHelper.ts`, `validateModuleRequiredFields.ts`, ...).
- **Core Framework Rules**:
  - Hooks cục bộ của một Organism: Đặt tại `src/core/components/organisms/<name>/hooks/` hoặc cùng cấp file organism.
  - Hooks dùng chung toàn hệ thống Core: Đặt tại `src/core/hooks/`.
  - **Tuyệt đối cấm**: Không tạo thư mục `src/core/components/hooks/`.

### B. Cấu trúc Phân Tầng Ngang Hàng (Parallel Atomic Layers)

> [!IMPORTANT]
> **ATOMS, MOLECULES, VÀ ORGANISMS PHẢI NẰM CÙNG CẤP DƯỚI `src/shared/components/`**:
> Tuyệt đối KHÔNG lồng thư mục `atoms/` hoặc `molecules/` vào bên trong một thư mục con của `organisms/`.

```
src/shared/components/
├── atoms/                                          # Level 1: Atoms (Pure UI, stateless, 0% logic)
│   ├── attribute-field-label/
│   ├── attribute-type-badge/
│   ├── attribute-tree-branch/
│   ├── attribute-view-box/
│   ├── buffered-text-input/
│   ├── neutral-count-badge/
│   ├── required-indicator/
│   ├── icons/
│   └── index.ts
├── molecules/                                      # Level 2: Molecules (UI + Local UI state)
│   ├── attribute-field-renderer/
│   ├── attribute-field-row/
│   ├── attribute-form-fields/
│   ├── attribute-option-builder/
│   ├── attribute-tree-list/
│   ├── category-attributes-section/
│   ├── global-attributes-section/
│   ├── module-live-preview-panel/
│   └── index.ts
├── organisms/                                      # Level 3: Organisms (Khối UI phức hợp)
│   ├── module-custom-field-config-content/
│   ├── module-custom-field-config-drawer/
│   ├── module-entity-custom-fields-section/
│   ├── custom-fields/ (Facade re-export)
│   ├── __tests__/ (Integration tests)
│   └── index.ts
└── templates/                                      # Level 4: Templates
```

---

## 🌐 6. Bắt Buộc 100% Đa Ngôn Ngữ (i18n Translation Mandate)

> [!IMPORTANT]
> **TUYỆT ĐỐI KHÔNG HARDCODE CHUỖI VĂN BẢN (Text Strings)** trực tiếp trong mã nguồn TSX/JSX.

1. **Luôn sử dụng `useTranslation`**:
   ```tsx
   import { useTranslation } from "react-i18next";
   
   export function MyComponent() {
     const { t } = useTranslation("erpInvoices");
     return <span>{t("tabDetails", "1. Chi tiết")}</span>;
   }
   ```
2. **Đồng bộ song ngữ 1-1**: Cập nhật đồng thời cả `locales/vi.ts` và `locales/en.ts`.
3. **Fallback mặc định**: Luôn cung cấp fallback tiếng Việt rõ ràng: `t("key", "Fallback tiếng Việt")`.

---

## 🎨 7. Quy Tắc Bảng Màu & Tuyệt Đối Cấm Màu Xanh Dương (No Blue Mandate)

- **TUYỆT ĐỐI KHÔNG SỬ DỤNG MÀU XANH DƯƠNG (`blue-*`, `bg-blue-*`, `text-blue-*`, `border-blue-*`)** trong toàn bộ giao diện Component, Cards, Badges, Tabs, Icons.
- **Thay thế bằng:**
  - **Neutral**: `slate-*`, `zinc-*`, `muted`, `border` (Thông tin chung, metadata, mã hiệu).
  - **Brand Primary**: `primary`, `text-primary`, `bg-primary` (Nút bấm chính, tab active).
  - **Success / Positive**: `emerald-*` (Hoàn thành, số tiền dương, trạng thái hợp lệ).
  - **Warning / Negative / Progress**: `amber-*` (Chờ xử lý, số tiền âm, chênh lệch giảm).
  - **Destructive**: `red-*` / `destructive` (Lỗi, hủy bỏ, xóa).

---

## 📱 8. Tối Ưu Web Responsive Toàn Diện

- **Thanh Tabs & Toolbars**: Luôn bọc trong container cuộn ngang cảm ứng:
  `overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0`
- **Lưới Thẻ Chỉ Số**: Áp dụng breakpoints `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5`.
- **Tránh Tràn Chiều Rộng**: Sử dụng `w-full min-w-0 max-w-full`, không dùng `w-[px]` cố định lớn.

---

## 🎯 9. Cây Quyết Định (Decision Tree): Lưu Trữ Component Ở Đâu?

```
Khi tạo mới một Component:
├── Có dính dáng tới API hoặc dữ liệu nghiệp vụ cụ thể không?
│   ├── KHÔNG (Thuần túy UI/Presentation):
│   │   ├── Là phần tử nguyên tử cơ bản (Button, Input, Badge, Dialog, Popover, Tooltip, Icons)?
│   │   │   └── 👉 Đặt vào `src/shared/components/ui/` hoặc `src/shared/components/atoms/` (Level 1: Atoms)
│   │   ├── Là cụm nhập liệu/chức năng nhỏ (Combobox, PillTabs, DatePicker, TabItem)?
│   │   │   └── 👉 Đặt vào `src/shared/components/molecules/` (Level 2: Molecules)
│   │   ├── Là khối UI phức hợp hoàn chỉnh (StandardTable, StandardFormDrawer, FilterPanel)?
│   │   │   └── 👉 Đặt vào `src/shared/components/organisms/` (Level 3: Organisms)
│   │   └── Là khung xương bố cục trang/bảng/drawer mẫu (SpreadsheetPageTemplate, PageLayout)?
│   │       └── 👉 Đặt vào `src/shared/components/templates/` (Level 4: Templates)
│   │
│   └── CÓ (Có gọi API, có State nghiệp vụ, có Domain Models):
│       ├── Là thành phần khung vỏ cốt lõi của ứng dụng (Sidebar, TopBar, TabBar, Settings, Changelog)?
│       │   └── 👉 Đặt vào `src/core/components/organisms/<component-folder>/`
│       │       ├── Hook cục bộ: `src/core/components/organisms/<component-folder>/hooks/`
│       │       └── Hook dùng chung Core: `src/core/hooks/`
│       ├── UI Widget dùng chung đa module (Custom fields, Traceability, Attachments)?
│       │   ├── UI Components: 👉 `src/shared/components/organisms/<widget-name>/`
│       │   ├── TypeScript Types: 👉 `src/shared/types/`
│       │   ├── Static Constants: 👉 `src/shared/constants/`
│       │   ├── Data Hooks: 👉 `src/shared/hooks/`
│       │   └── Pure Utils: 👉 `src/shared/utils/`
│       └── Tính năng chỉ phục vụ riêng 1 phân hệ (Hóa đơn, Kho, Garage, Kế toán)?
│           └── 👉 Đặt vào `src/modules/<module-name>/` (Level 5: Pages/Module Components)
```

---

## 📋 10. Checklist Kiểm Tra Hoàn Thành (Atomic DoD)

- [ ] **Thứ tự Import Chuẩn**: Tuân thủ nghiêm ngặt `Templates > Organisms > Molecules > Atoms` (không import ngược dòng)?
- [ ] **Không Import Ngang Cấp**: Không import lẫn nhau giữa các component cùng cấp trong cùng scope (ngoại trừ Module import Shared cùng cấp)?
- [ ] **Mỗi Component 1 Folder**: Tất cả các component đều nằm trong thư mục `kebab-case` riêng có `index.ts`?
- [ ] **Đặt tên chuẩn**: Tên component và icons chuẩn `PascalCase.tsx`, hooks `camelCase.ts`?
- [ ] **Kích thước file**: Tất cả các file đều $< 180	ext{ LoC}$?
- [ ] **Tách biệt Logic & UI**: Toàn bộ TanStack Query, mutations, và form state nằm trong `hooks/`?
- [ ] **Co-located Tests**: Test nằm trực tiếp cùng cấp trong component folder đơn lẻ hoặc trong `__tests__/` của multi-component feature/organism?
- [ ] **Đa ngôn ngữ 100%**: Sử dụng `useTranslation` có fallback tiếng Việt và đồng bộ VI/EN?
- [ ] **No Blue Mandate**: Tuyệt đối không còn class `blue-*` nào trong giao diện?
- [ ] **Web Responsive**: Hỗ trợ đầy đủ mobile, tablet, laptop và màn hình lớn?
- [ ] **Type Check & Tests**: `bun run type:check` 0 lỗi và unit tests pass 100%?
