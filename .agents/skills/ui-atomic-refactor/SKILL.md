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
  subgraph Level 1: Atoms [1. ⚛️ Atoms / UI Primitives - @/shared/ui]
    A1[Button, Dialog, Input, Badge, Checkbox, Calendar, Tooltip...]
    A1_Note[0% Logic nghiệp vụ, shadcn/Radix thuần túy]
  end

  subgraph Level 2: Molecules [2. 🧬 Molecules - @/shared/components/molecules]
    M1[PillTabs, Combobox, BufferedTextarea, DatePicker, CopyButton...]
  end

  subgraph Level 3: Organisms [3. 🧫 Organisms - @/shared/components/organisms]
    O1[StandardTable, DataTable, StandardFormDrawer, ConfirmModal, FilterPanel...]
  end

  subgraph Level 4: Templates [4. 📄 Templates - @/shared/components/templates]
    T1[SpreadsheetPageTemplate, DashboardTemplate, PageLayout, PageWithTabsLayout...]
    T1_Note[Khung xương layout trang/bảng/drawer chưa gắn dữ liệu nghiệp vụ]
  end

  subgraph Cross-Cutting Features [🔌 Cross-Cutting Domain Features - @/shared/features]
    F1[custom-fields: Config Drawer + Entity Form Section]
    F2[document-traceability: Multi-hop Drawer Graph]
    F3[file-manager: Cloudflare R2 Upload & Lightbox]
  end

  subgraph Level 5: Pages / Modules [5. 📑 Pages & Domain Modules - @/modules]
    P1[erp-invoices-core, inventory-core, garage, accounting...]
  end

  Level 5 --> Cross-Cutting Features
  Level 5 --> Level 4
  Cross-Cutting Features --> Level 4
  Cross-Cutting Features --> Level 3
  Cross-Cutting Features --> Level 2
  Cross-Cutting Features --> Level 1
  Level 4 --> Level 3
  Level 3 --> Level 2
  Level 2 --> Level 1
```

---

### 📋 Bảng Định Nghĩa & Ranh Giới 5 Tầng

| Tầng Atomic | Thư mục quy ước | Bản chất & Vai trò | Phụ thuộc (Dependencies) | Ví dụ cụ thể |
| :--- | :--- | :--- | :--- | :--- |
| **1. Atoms (UI Primitives)** | `src/shared/ui/` | Phần tử cơ bản nhất, không thể phân rã, không chứa nghiệp vụ | Chỉ phụ thuộc React, Tailwind, Radix | `button.tsx`, `input.tsx`, `badge.tsx`, `dialog.tsx` |
| **2. Molecules** | `src/shared/components/molecules/` | Cụm chức năng nhỏ kết hợp từ 2+ atoms | Chỉ dùng Atoms | `PillTabs.tsx`, `Combobox.tsx`, `DatePicker.tsx` |
| **3. Organisms** | `src/shared/components/organisms/` | Khối UI phức hợp hoàn chỉnh, **câm nghiệp vụ (0% API)** | Dùng Molecules & Atoms | `StandardTable.tsx`, `StandardFormDrawer.tsx`, `FilterPanel.tsx` |
| **4. Templates** | `src/shared/components/templates/` | **Khung xương layout trang/drawer mẫu**, định vị Header, Toolbar, Grid, Slots | Dùng Organisms & Molecules | `SpreadsheetPageTemplate/`, `DashboardTemplate/`, `PageLayout.tsx` |
| **🔌 Cross-Cutting Features** | `src/shared/features/<feature>/` | Tính năng nghiệp vụ dùng chung đa module (tự gọi API, tự quản lý state) | Dùng Templates, Organisms, Atoms | `custom-fields/`, `document-traceability/`, `file-manager/` |
| **5. Pages / Modules** | `src/modules/<module>/pages/` | Màn hình nghiệp vụ hoàn chỉnh của từng phân hệ (gắn API thật vào Template) | Dùng toàn bộ các tầng trên | `InvoicesListPage.tsx`, `InventoryStockPage.tsx` |

---

## 2. 🧪 Nguyên Tắc Co-located Testing Bắt Buộc (Colocation Testing Mandate)

> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG DỒN TẤT CẢ TEST VÀO 1 THƯ MỤC ROOT `__tests__` TẬP TRUNG**.
> Mọi Unit Test và Component Integration Test bắt buộc phải nằm **Co-located (đi kèm)** với mã nguồn.

### Quy tắc đặt file Test:
1. **Atoms & Molecules**: Đặt file test ngay bên cạnh: `button.tsx` $\rightarrow$ `button.test.tsx` (hoặc `PillTabs.test.tsx`).
2. **Cross-Cutting Features**: Tạo thư mục `__tests__/` nội bộ bên trong feature:
   `src/shared/features/<feature-name>/__tests__/<FeatureName>.test.tsx`
3. **Modules Nghiệp vụ**: Tạo thư mục `__tests__/` nội bộ bên trong module:
   `src/modules/<module-name>/__tests__/<PageName>.test.tsx`
4. **Root `src/test/` & `src/__tests__/`**: Chỉ dùng cho Global Setup (`setup.ts`), Test Utilities (`test-utils.tsx`), Mocks toàn cục (`server.ts`) và Test luồng App toàn cục (`App.routing.test.tsx`, `App.forbidden.test.tsx`).

---

## 3. 📏 Giới Hạn Atomic File (< 200 LoC) & Cấu Trúc Mini 4 Tầng Cho Feature/Module

Mọi Feature hoặc Component phức hợp bắt buộc phải được chia tách thành **4 tầng vi mô (Mini 4-Tier Pattern)**:

```
src/shared/features/<feature-name>/ (hoặc src/modules/<module>/components/<feature-name>/)
├── index.ts                                        # Public Entry Point re-export facade
├── domains/                                        # Domain Models, Types, Schemas & Constants
│   ├── types.ts                                    # Interfaces & Component Props (< 100 LoC)
│   ├── constants.ts                                # Registries, Enums, Options constants (< 100 LoC)
│   ├── schemas.ts                                  # Zod validation schemas (< 80 LoC)
│   └── index.ts
├── hooks/                                          # Custom Hooks & State Resolution
│   ├── use<FeatureName>Logic.ts                    # Form state, modal toggle, dirty check (< 140 LoC)
│   ├── use<FeatureName>Mutations.ts                # TanStack mutations (< 120 LoC)
│   └── index.ts
├── utils/                                          # Pure Helpers & Validations
│   ├── <featureName>Helper.ts                      # Formatters, pure converters (< 100 LoC)
│   └── index.ts
├── components/                                     # Presentation Layer (Atomic)
│   ├── atoms/                                      # Atoms: Nhỏ nhất (< 80 LoC)
│   │   ├── <AtomName>.tsx
│   │   └── index.ts
│   ├── molecules/                                  # Molecules: Nhóm atoms (< 150 LoC)
│   │   ├── <MoleculeName>.tsx
│   │   └── index.ts
│   └── organisms/                                  # Organisms: Khối Drawer/Section hoàn chỉnh (< 180 LoC)
│       ├── <OrganismName>.tsx
│       └── index.ts
└── __tests__/                                      # Co-located Test Suite
    ├── <FeatureName>.test.tsx
    └── <featureName>Helper.test.ts
```

---

## 4. 🌐 Bắt Buộc 100% Đa Ngôn Ngữ (i18n Translation Mandate)

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

## 5. 🎨 Quy Tắc Bảng Màu & Tuyệt Đối Cấm Màu Xanh Dương (No Blue Mandate)

- **TUYỆT ĐỐI KHÔNG SỬ DỤNG MÀU XANH DƯƠNG (`blue-*`, `bg-blue-*`, `text-blue-*`, `border-blue-*`)** trong toàn bộ giao diện Component, Cards, Badges, Tabs, Icons.
- **Thay thế bằng:**
  - **Neutral**: `slate-*`, `zinc-*`, `muted`, `border` (Thông tin chung, metadata, mã hiệu).
  - **Brand Primary**: `primary`, `text-primary`, `bg-primary` (Nút bấm chính, tab active).
  - **Success / Positive**: `emerald-*` (Hoàn thành, số tiền dương, trạng thái hợp lệ).
  - **Warning / Negative / Progress**: `amber-*` (Chờ xử lý, số tiền âm, chênh lệch giảm).
  - **Destructive**: `red-*` / `destructive` (Lỗi, hủy bỏ, xóa).

---

## 6. 📱 Tối Ưu Web Responsive Toàn Diện

- **Thanh Tabs & Toolbars**: Luôn bọc trong container cuộn ngang cảm ứng:
  `overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0`
- **Lưới Thẻ Chỉ Số**: Áp dụng breakpoints `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5`.
- **Tránh Tràn Chiều Rộng**: Sử dụng `w-full min-w-0 max-w-full`, không dùng `w-[px]` cố định lớn.

---

## 7. 🎯 Cây Quyết Định (Decision Tree): Lưu Trữ Component Ở Đâu?

```
Khi tạo mới một Component:
├── Có dính dáng tới API hoặc dữ liệu nghiệp vụ cụ thể không?
│   ├── KHÔNG (Thuần túy UI/Presentation):
│   │   ├── Là phần tử nguyên tử cơ bản (Button, Input, Badge, Dialog)?
│   │   │   └── 👉 Đặt vào `src/shared/ui/` (Level 1: Atoms)
│   │   ├── Là cụm nhập liệu/chức năng nhỏ (Combobox, PillTabs, DatePicker)?
│   │   │   └── 👉 Đặt vào `src/shared/components/molecules/` (Level 2: Molecules)
│   │   ├── Là khối UI phức hợp hoàn chỉnh (StandardTable, StandardFormDrawer, FilterPanel)?
│   │   │   └── 👉 Đặt vào `src/shared/components/organisms/` (Level 3: Organisms)
│   │   └── Là khung xương bố cục trang/bảng/drawer mẫu (SpreadsheetPageTemplate, PageLayout)?
│   │       └── 👉 Đặt vào `src/shared/components/templates/` (Level 4: Templates)
│   │
│   └── CÓ (Có gọi API, có State nghiệp vụ, có Domain Models):
│       ├── Tính năng dùng chung cho từ 2 module trở lên (Custom fields, Traceability, Attachments)?
│       │   └── 👉 Đặt vào `src/shared/features/<feature-name>/` (Cross-Cutting Features)
│       └── Tính năng chỉ phục vụ riêng 1 phân hệ (Hóa đơn, Kho, Garage, Kế toán)?
│           └── 👉 Đặt vào `src/modules/<module-name>/` (Level 5: Pages/Module Components)
```

---

## 📋 Checklist Kiểm Tra Hoàn Thành (Atomic DoD)

- [ ] **Phân lớp đúng đắn**: Component được đặt đúng thư mục theo 5 tầng Atomic & Features?
- [ ] **Kích thước file**: Tất cả các file đều $< 200\text{ LoC}$?
- [ ] **Tách biệt Logic & UI**: Toàn bộ TanStack Query, mutations, và form state nằm trong `hooks/`?
- [ ] **Co-located Tests**: Test nằm ngay cạnh component hoặc trong `__tests__/` nội bộ?
- [ ] **Đa ngôn ngữ 100%**: Sử dụng `useTranslation` có fallback tiếng Việt và đồng bộ VI/EN?
- [ ] **No Blue Mandate**: Tuyệt đối không còn class `blue-*` nào trong giao diện?
- [ ] **Web Responsive**: Hỗ trợ đầy đủ mobile, tablet, laptop và màn hình lớn?
- [ ] **Type Check & Tests**: `bun run type:check` 0 lỗi và unit tests pass 100%?
