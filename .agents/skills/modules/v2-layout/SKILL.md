---
name: v2-layout
description: Module tri thức Kiến trúc Layout V2 (Floating 2-Cards, Platform Split Desktop/Mobile, Topbar 36px, Right Panel, TabBar, Sidebar) trong erp-web (src/v2/app/layouts và src/v2/shared/components). Chứa toàn bộ cây thành phần Atomic Design 5 tầng, design tokens Tailwind, contracts props, router dispatcher, cơ chế co-located testing và các hướng dẫn mở rộng.
---

# 🎨 Module Tri Thức: Kiến Trúc Layout V2 - Frontend (`erp-web`)

## 1. Tổng Quan Kiến Trúc & Trách Nhiệm Hệ Thống

Kiến trúc Layout V2 (`src/v2/app/layouts/` và `src/v2/shared/components/`) là bộ khung sườn giao diện chuẩn mực thế hệ mới của **Liouni ERP Web**, kế thừa toàn bộ trải nghiệm ưu việt của V1 đồng thời tái cấu trúc mã nguồn theo **Atomic Design 5 tầng**, **Platform Split (Desktop vs Mobile)** và **No Blue Mandate**:

- **Kiến trúc Floating 2-Cards (Desktop)**: Toàn bộ viewport nằm trên nền canvas xám dịu mắt `#f4f4f4` (dark mode: `bg-background`), có khoảng đệm mép `p-2` và khe hở `gap-2` (8px). Gồm 2 khối Card nổi song song độc lập bo tròn `rounded-2xl`, border mỏng và shadow mềm mại:
  - **Cột Trái (Sidebar)**: Chiều rộng `210px` (thu gọn `58px`), hiển thị Logo Liouni, tên app, các phân hệ điều hướng in hoa, và avatar user ở chân trang.
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
│           ├── V2AppLayout.type.ts     # Interface V2AppLayoutProps toàn diện
│           ├── V2AppLayout.test.tsx    # Unit test kiểm tra chuyển đổi Desktop/Mobile
│           └── index.ts                # Public export
│
└── shared/
    ├── ui/
    │   └── button.tsx                  # [Level 1 - Atom/Primitive] Button chuẩn token text-primary-fg
    │
    └── components/
        ├── molecules/                  # [Level 2 - Molecules]
        │   ├── v2-breadcrumb/          # Dãy đường dẫn điều hướng (Home > Bán hàng > Đơn hàng)
        │   ├── v2-quick-search/        # Nút kích hoạt tìm kiếm nhanh Ctrl+K / ⌘K
        │   ├── v2-branch-badge/        # Huy hiệu chi nhánh làm việc hiện tại & Profile công ty
        │   ├── v2-tab-item/            # Thẻ tab đa nhiệm (icon + label + nút đóng x)
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
  primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-fg)" },
  "primary-fg": "var(--primary-fg)",
  "primary-foreground": "var(--primary-fg)", // 🎯 Khắc phục lỗi chữ đen trên nền đen

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

## 5. Hướng Dẫn Tích Hợp Trang Nghiệp Vụ Vào Layout V2

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
      tenantName="Liouni Industries"
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

## 6. Quy Chuẩn Kiểm Thử & Quality Gate

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
