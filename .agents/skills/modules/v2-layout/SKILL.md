---
name: v2-layout
description: Module tri thức Kiến trúc Layout V2 (Floating 2-Cards, Platform Split Desktop/Mobile, Topbar 36px, Right Panel, TabBar, Sidebar) trong erp-web (src/v2/app/layouts và src/v2/shared/components). Chứa toàn bộ cây thành phần Atomic Design 5 tầng, design tokens Tailwind, contracts props, router dispatcher, cơ chế co-located testing và các hướng dẫn mở rộng.
---

# 🎨 Module Tri Thức: Kiến Trúc Layout V2 - Frontend (`erp-web`)

## 1. Tổng Quan Kiến Trúc & Trách Nhiệm Hệ Thống

Kiến trúc Layout V2 (`src/v2/app/layouts/` và `src/v2/shared/components/`) là bộ khung sườn giao diện chuẩn mực thế hệ mới của **ERP Web**, kế thừa toàn bộ trải nghiệm ưu việt của V1 đồng thời tái cấu trúc mã nguồn theo **Atomic Design 5 tầng**, **Platform Split (Desktop vs Mobile)** và **No Blue Mandate**:

- **Kiến trúc Floating 2-Cards (Desktop)**: Toàn bộ viewport nằm trên nền canvas xám dịu mắt `#f4f4f4` (dark mode: `bg-background`), có khoảng đệm mép `p-2` và khe hở `gap-2` (8px). Gồm 2 khối Card nổi song song độc lập bo tròn `rounded-2xl`, border mỏng và shadow mềm mại:
  - **Cột Trái (Sidebar)**: Chiều rộng `210px` (thu gọn `58px`), hiển thị Logo thương hiệu, tên app, các phân hệ điều hướng in hoa, và avatar user ở chân trang.
  - **Cột Phải (Right Panel)**: Card co giãn linh hoạt (`flex-1 min-w-0`), ôm trọn **Topbar (36px)** ở đỉnh, **Vùng nội dung nghiệp vụ (App Content)** cuộn mượt mà ở giữa, và **Thanh TabBar đa nhiệm** ở đáy.
- **Cơ chế Dual-Run Song Song Tuyệt Đối**: Chạy độc lập tại tiền tố route `/v2/*` trên cùng một single bundle và dev server của Vite. Kế thừa trực tiếp `useAuthStore` của V1 mà không gây bất kỳ tác dụng phụ nào tới hệ thống V1 đang vận hành.
- **Platform Split Tự Động (`useViewport`)**: Tự động chuyển đổi giao diện dựa trên kích thước màn hình mà không bị giật lag layout:
  - Màn hình Desktop (>= 768px): Hiển thị kiến trúc Floating 2-Cards.
  - Màn hình Mobile (< 768px): Tối ưu thành thanh điều hướng dưới đáy (`V2BottomNav`) và Header gọn nhẹ.
- **Kỷ luật Code Cứng**: 100% file < 150 LoC (cách xa ngưỡng trần 180 LoC), 100% co-located unit test, cấm class màu xanh dương mặc định (`blue-*`).

---

## 2. Cây Thư Mục & Phân Tầng Atomic Design 5 Tầng

Toàn bộ Layout V2 được phân rã thành các tầng Atomic nghiêm ngặt theo quy tắc **Import một chiều (Top-Down)**:

```
src/v2/
├── app/
│   └── layouts/
│       └── v2-app-layout/              # [Level 4 - Layout/Template]
│           ├── V2AppLayout.tsx         # Switcher Router (< 20 LoC) dựa trên useViewport()
│           ├── V2AppLayout.desktop.tsx # Bố cục Floating 2-Cards song song (p-2 gap-2)
│           ├── V2AppLayout.mobile.tsx  # Bố cục Mobile chuyên dụng kèm BottomNav
│           ├── v2Navigation.ts         # Hàm sinh danh mục điều hướng đa ngôn ngữ getV2NavigationSections(t)
│           ├── v2Navigation.config.ts  # Cấu hình danh mục thô (NAV_DEFS & SECTION_DEFS)
│           ├── v2Navigation.test.ts    # Unit test danh mục điều hướng
│           ├── V2AppLayout.type.ts     # Interface V2AppLayoutProps toàn diện
│           ├── V2AppLayout.test.tsx    # Unit test kiểm tra chuyển đổi Desktop/Mobile & i18n
│           └── index.ts                # Public export
│
└── shared/
    ├── types/                          # [Base TypeScript Contracts]
    │   ├── v2-base-props.ts            # V2BaseProps, V2ButtonBaseProps kế thừa React HTML Types
    │   └── index.ts                    # Public export
    │
    ├── locales/                        # [i18n Dictionary]
    │   ├── vi.ts                       # Từ điển V2 tiếng Việt (v2Vi, type V2Dictionary)
    │   ├── en.ts                       # Từ điển V2 tiếng Anh (v2En)
    │   └── index.ts                    # Public export
    │
    ├── hooks/
    │   ├── useV2Translation.ts         # Hook đa ngôn ngữ đồng bộ useAppStore & fallback useT() V1
    │   └── useViewport.ts              # Hook xác định kích thước màn hình Desktop/Mobile
    │
    ├── ui/                             # [Level 1 - Primitives] Shadcn UI (Folder-per-component)
    │   ├── button/                     # button.tsx, button.test.tsx, index.ts (CVA + Radix Slot)
    │   ├── text/                       # text.tsx, text.test.tsx, index.ts (CVA + Radix Slot)
    │   ├── badge/                      # badge.tsx, badge.test.tsx, index.ts
    │   └── index.ts                    # Master Barrel Export
    │
    └── components/                     # [Atomic Components] (Import 1 chiều từ shared/ui)
        ├── atoms/                      # [Level 1 - Core Atoms]
        │   ├── v2-button/              # Nút chuẩn hoá (loading, icons, fullWidth, variants V1+V2)
        │   ├── v2-text/                # Chữ chuẩn hoá (auto HTML mapping, truncate, copyable, required)
        │   ├── v2-sidebar-toggle-btn/  # Nút thu gọn / mở rộng Sidebar 26x26px
        │   ├── v2-sidebar-icon/        # Container bọc icon điều hướng Sidebar
        │   ├── v2-sidebar-logo/        # Khối hiển thị Logo ERP 24x24px
        │   ├── v2-nav-icon/            # Icon điều hướng di động / desktop
        │   └── index.ts                # Master Barrel Export
        │
        ├── molecules/                  # [Level 2 - Molecules]
        │   ├── v2-breadcrumb/          # Dãy đường dẫn điều hướng (Home > Bán hàng > Đơn hàng)
        │   ├── v2-quick-search/        # Nút kích hoạt tìm kiếm nhanh Ctrl+K / ⌘K (i18n placeholder)
        │   ├── v2-language-switcher/   # Nút chuyển đổi ngôn ngữ pill compact 24px (VI 🇻🇳 / EN 🇬🇧)
        │   ├── v2-branch-badge/        # Huy hiệu chi nhánh làm việc hiện tại & Profile công ty
        │   ├── v2-tab-item/            # Thẻ tab đa nhiệm (icon + label + nút đóng x i18n)
        │   ├── v2-topbar/              # Thanh Topbar 36px nằm bên trong Right Panel
        │   ├── v2-sidebar-header/      # Header Sidebar h-12 (Logo + App name + Toggle Button)
        │   ├── v2-sidebar-nav-item/    # Hàng menu điều hướng (12px, icon 16px, active pill)
        │   ├── v2-sidebar-section/     # Tiêu đề phân hệ in hoa text-[11px] collapsible
        │   └── v2-sidebar-bottom/      # Chân Sidebar (Avatar 22px + Tên user + Chuông thông báo)
        │
        └── organisms/                  # [Level 3 - Organisms]
            ├── v2-sidebar/             # Card 1: Sidebar hoàn chỉnh (210px / 58px) bo góc 16px
            ├── v2-right-panel/         # Card 2: Right Panel hoàn chỉnh bo góc 16px
            ├── v2-tab-bar/             # Thanh TabBar cuộn ngang ở đáy Right Panel
            └── v2-bottom-nav/          # Thanh BottomNav cho màn hình di động
```

---

## 3. Hệ Thống Design Tokens & Semantic Styling (`tailwind.config.js`)

Để đảm bảo tương thích 100% giữa các component cũ V1 và các UI Primitives mới của V2 (Shadcn / Radix / CVA), file `tailwind.config.js` được cấu hình với các alias ngữ nghĩa:

```javascript
colors: {
  /* V1 Core Tokens (Giữ nguyên 100%) */
  background: "var(--background)",
  surface: "var(--surface)",
  "surface-hover": "var(--surface-hover)",
  border: "var(--border)",
  foreground: "var(--foreground)",
  muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-fg)" },
  "muted-fg": "var(--muted-fg)",
  faint: "var(--faint)",
  "sidebar-label": "var(--sidebar-label, var(--muted-fg))",
  primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-fg)" },
  "primary-fg": "var(--primary-fg)",
  "primary-foreground": "var(--primary-fg)", // 🎯 Khắc phục lỗi chữ đen trên nền đen
  "on-primary": "var(--primary-fg)",

  /* Semantic indicators V2 */
  success: {
    DEFAULT: "var(--approve-fg, #10b981)",
    foreground: "#ffffff",
    bg: "var(--approve-bg, rgba(16, 185, 129, 0.1))",
  },
  warning: {
    DEFAULT: "var(--warn-fg, #f59e0b)",
    foreground: "#ffffff",
    bg: "var(--warn-bg, rgba(245, 158, 11, 0.1))",
  },

  /* V2 & Shadcn UI Primitives Compatibility Tokens */
  card: { DEFAULT: "var(--surface)", foreground: "var(--foreground)" },
  popover: { DEFAULT: "var(--surface)", foreground: "var(--foreground)" },
  secondary: { DEFAULT: "var(--muted)", foreground: "var(--foreground)" },
  accent: { DEFAULT: "var(--surface-hover)", foreground: "var(--foreground)" },
  destructive: { DEFAULT: "var(--down-fg, #ef4444)", foreground: "#ffffff" },
  input: "var(--border)",
  ring: "var(--primary)",
}
```

### 🚫 Quy tắc No Blue Mandate
Tuyệt đối không sử dụng các class Tailwind có tiền tố `blue-*` (như `bg-blue-500`, `text-blue-600`) trong toàn bộ thư mục `src/v2/`. Bắt buộc dùng semantic tokens:
- Màu chính thương hiệu: `bg-primary`, `text-primary`, `text-primary-fg`.
- Màu nhấn/hover: `bg-accent`, `hover:bg-surface-hover`.
- Màu phụ/thẻ: `bg-muted`, `text-muted-fg`.

---

## 4. Đặc Tả Contracts & Interfaces Cốt Lõi

### 4.1. `V2AppLayoutProps` ([`V2AppLayout.type.ts`](file:///home/dev/repos-dev/erp/erp-web/src/v2/app/layouts/v2-app-layout/V2AppLayout.type.ts))
```typescript
export interface V2AppLayoutProps {
  children?: ReactNode;
  activeNavId?: string;
  breadcrumbs?: V2BreadcrumbItem[];
  userName?: string;
  userRole?: string;
  tenantName?: string;
  branchName?: string;
  sections?: V2SidebarSectionData[];
  navItems?: V2SidebarNavItem[];
  tabs?: V2TabEntry[];
  activeTabId?: string;
  onNavigate?: (item: V2SidebarNavItem) => void;
  onTabSelect?: (id: string) => void;
  onTabClose?: (id: string) => void;
  onSearchClick?: () => void;
  onBranchClick?: () => void;
}
```

### 4.2. `V2RightPanelProps` ([`V2RightPanel.type.ts`](file:///home/dev/repos-dev/erp/erp-web/src/v2/shared/components/organisms/v2-right-panel/V2RightPanel.type.ts))
```typescript
export interface V2RightPanelProps {
  breadcrumbs?: V2BreadcrumbItem[];
  branchName?: string;
  companyName?: string;
  onSearchClick?: () => void;
  onBranchClick?: () => void;
  topbarActions?: ReactNode;
  tabs?: V2TabEntry[];
  activeTabId?: string;
  onTabSelect?: (id: string) => void;
  onTabClose?: (id: string) => void;
  children?: ReactNode;
  className?: string;
}
```

### 4.3. `V2SidebarProps` ([`V2Sidebar.type.ts`](file:///home/dev/repos-dev/erp/erp-web/src/v2/shared/components/organisms/v2-sidebar/V2Sidebar.type.ts))
```typescript
export interface V2SidebarProps {
  sections?: V2SidebarSectionData[];
  items?: V2SidebarItem[];
  activeId?: string;
  onNavigate?: (item: V2SidebarItem) => void;
  user?: V2SidebarUserData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}
```

---

## 5. Kiến Trúc Đa Ngôn Ngữ (i18n VI/EN) Trong V2 Layout

Hệ thống Layout V2 hỗ trợ 100% đa ngôn ngữ (Tiếng Việt 🇻🇳 và English 🇬🇧) với kiến trúc 2 tầng mượt mà, đồng bộ thời gian thực với Zustand Core Store:

### 5.1. Hook `useV2Translation` ([`useV2Translation.ts`](file:///home/dev/repos-dev/erp/erp-web/src/v2/shared/hooks/useV2Translation.ts))
- **Đồng bộ Zustand Store**: Lấy và cập nhật `locale` trực tiếp từ `useAppStore` (`state.locale`, `state.setLocale`).
- **Ưu tiên Từ điển V2**: Các key có tiền tố `v2.` (như `v2.sidebar.appName`, `v2.welcome.heroTitle`) được tra cứu tại `src/v2/shared/locales/{vi,en}.ts`. Hỗ trợ template interpolation `{{name}}`.
- **Fallback Sang Core V1**: Tự động ủy thác sang `useT()` của V1 khi tra cứu các key dùng chung (`nav.items.*`, `nav.sections.*`), bảo đảm tái sử dụng triệt để từ điển hệ thống.

### 5.2. Phân Tử `V2LanguageSwitcher` ([`V2LanguageSwitcher.tsx`](file:///home/dev/repos-dev/erp/erp-web/src/v2/shared/components/molecules/v2-language-switcher/V2LanguageSwitcher.tsx))
- Thiết kế dạng Pill Badge compact siêu gọn cao **24px**, tích hợp trên thanh `V2Topbar` (Desktop) và `V2Header` (Mobile).
- Hiển thị cờ và mã ngôn ngữ: `🇻🇳 VI` | `🇬🇧 EN`. Click để chuyển đổi ngôn ngữ tức thời và kích hoạt re-render toàn bộ layout.

### 5.3. Động Hóa Danh Mục Điều Hướng ([`v2Navigation.ts`](file:///home/dev/repos-dev/erp/erp-web/src/v2/app/layouts/v2-app-layout/v2Navigation.ts))
- Menu Sidebar và Mobile BottomNav được động hóa hoàn toàn thông qua `getV2NavigationSections(t)` và `getV2NavItems(t)`.
- Tách bạch cấu hình thô sang [`v2Navigation.config.ts`](file:///home/dev/repos-dev/erp/erp-web/src/v2/app/layouts/v2-app-layout/v2Navigation.config.ts), bảo đảm tuân thủ nghiêm ngặt ngưỡng kích thước file < 180 LoC.

---

## 6. Hướng Dẫn Tích Hợp Trang Nghiệp Vụ Vào Layout V2

Khi phát triển trang mới trong V2 (hoặc migrate cuốn chiếu module từ V1 sang V2), chỉ cần bọc trang bằng `V2AppLayout`:

```tsx
import * as React from "react";
import { V2AppLayout } from "@/v2/app/layouts/v2-app-layout";

export const MyV2OrderPage: React.FC = () => {
  return (
    <V2AppLayout
      activeNavId="sales-orders"
      breadcrumbs={[
        { label: "Bán hàng", href: "/v2/sales" },
        { label: "Đơn bán hàng" },
      ]}
      branchName="Chi nhánh Sài Gòn"
      tenantName="Enterprise Industries"
      onSearchClick={() => console.log("Mở quick search Ctrl+K")}
    >
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Danh sách Đơn Bán Hàng V2</h1>
        {/* DataTable & Logic nghiệp vụ đặt tại đây */}
      </div>
    </V2AppLayout>
  );
};
```

---

## 7. Quy Chuẩn Kiểm Thử & Quality Gate

Mỗi khi chỉnh sửa hoặc thêm component vào Layout V2, bắt buộc chạy chuỗi kiểm tra Zero-Miss:

```bash
# 1. Quét vi phạm No Blue Mandate (Phải trả về 0 kết quả)
grep -rn "blue-" src/v2/

# 2. Quét vi phạm giới hạn kích thước file > 180 LoC (Phải không có file nào)
find src/v2 -type f \( -name "*.tsx" -o -name "*.ts" \) -exec wc -l {} + | awk '$1 > 180 {print}'

# 3. Kiểm tra tính toàn vẹn kiểu dữ liệu TypeScript (Phải Exit Code 0)
cd /home/dev/repos-dev/erp/erp-web && bun run type:check

# 4. Chạy toàn bộ Unit Tests Co-located (Phải 100% PASS)
cd /home/dev/repos-dev/erp/erp-web && bun test src/v2/

# 5. Kiểm tra đóng gói Production Build
cd /home/dev/repos-dev/erp/erp-web && bun run build
```
