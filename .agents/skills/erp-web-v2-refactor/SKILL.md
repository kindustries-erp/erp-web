---
name: erp-web-v2-refactor
description: Cẩm nang kỹ thuật & Module tri thức Tái cấu trúc ERP Web v2 (Dual-Run /v2/, Atomic Design 5 tầng, Platform Split Desktop/Mobile, Pure Domain Rules, 3 Tầng Testing và Rolling Migration) trong erp-web
---

# 🚀 Kỹ Thuật Tái Cấu Trúc ERP Web v2 (`src/v2/`)

Skill này chứa toàn bộ tri thức kỹ thuật, quy chuẩn kiến trúc, mẫu mã (code templates) và bộ công cụ kiểm toán tự động phục vụ chiến dịch nâng cấp và tái cấu trúc hệ thống `erp-web` lên phiên bản v2 độc lập tại thư mục `src/v2/`.

---

## 🎯 7 Nguyên Tắc Kiến Trúc Sống Còn

| # | Nguyên tắc | Quy định cụ thể |
| :--- | :--- | :--- |
| 1 | **Dual-Run Route `/v2/`** | Chạy song song `/v2/*` và `/` (V1) trên cùng 1 bundle. Chia sẻ `useAuthStore` & Axios API client. Không dùng Bridge Adapter. |
| 2 | **Shared UI vs Components (Import 1 Chiều)** | `src/v2/shared/ui/<name>/`: Mỗi primitive 1 subfolder riêng biệt (`button/`, `badge/`), kèm master barrel `@/v2/shared/ui`. Cài đặt qua `bun run ui:add <name>`. Atoms & Molecules ĐƯỢC PHÉP import từ `shared/ui` để wrap/custom. TUYỆT ĐỐI CẤM CHIỀU NGƯỢC LẠI (`shared/ui` không bao giờ import từ `atoms`/`molecules`). |
| 3 | **Storybook CDD & Theme V2 Độc Lập** | Mọi Shared Component (Atoms, Molecules, Organisms) và UI Primitives bắt buộc có file `[ComponentName].stories.tsx` co-located. Cấu hình theme độc lập tại `src/v2/shared/styles/` (`v2-theme.css`, `index.css`) & `src/v2/shared/theme/` (`applyV2Theme`, 4 themes). Storybook chỉ quét `src/v2` và chỉ import style V2. |
| 4 | **Platform Split (Desktop vs Mobile)** | Tách component tree: `[Name].desktop.tsx` & `[Name].mobile.tsx`. File entry `[Name].tsx` là Switcher (< 15 LoC) dùng `useViewport()`. |
| 5 | **Testing Pyramid 3 Tầng** | Unit tests co-located cạnh source file; Integration tests tại `modules/<name>/tests/integration/`; E2E tests tại `src/v2/tests/e2e/`. |
| 6 | **Giới Hạn Cứng < 180 LoC** | Cấm file vượt quá 180 LoC. Tách ngay `.hook.ts`, `.helper.ts`, sub-components nếu tiệm cận. |
| 7 | **Rolling Migration User-Driven** | Agent KHÔNG tự ý di chuyển module nào khi chưa có lệnh rõ ràng từ User. Di chuyển cuốn chiếu từng module, bảo đảm zero regression. |

---

## 📋 Hệ Thống Quy Ước Đặt Tên & Cấu Trúc (Convention Table)

| Thành phần | Quy ước | Ví dụ |
| :--- | :--- | :--- |
| **Thư mục domain** | `domain/` (số ít) | `src/v2/modules/sales-orders/domain/` |
| **Thư mục module** | `kebab-case` | `sales-orders/`, `business-partners/`, `erp-invoices/` |
| **Thư mục component** | `kebab-case` + `Folder-per-component` | `sales-status-badge/`, `sales-order-table/` |
| **File component chính** | `PascalCase.tsx` | `SalesOrderTable.tsx` |
| **File Platform Split** | `[Name].desktop.tsx` / `[Name].mobile.tsx` | `SalesOrderTable.desktop.tsx`, `SalesOrderTable.mobile.tsx` |
| **File Hook dùng chung** | `use[PascalCase].ts` | `useViewport.ts`, `useSalesOrdersQuery.ts` |
| **File Hook co-located** | `[ComponentName].hook.ts` | `SalesOrderTable.hook.ts` |
| **File Type/Interface** | `[ComponentName].type.ts` hoặc `[name].entity.ts` | `SalesOrderTable.type.ts`, `sales-order.entity.ts` |
| **File Unit Test co-located** | `[Name].test.ts` / `[Name].test.tsx` | `can-deliver-order.test.ts`, `useViewport.test.ts` |
| **File Storybook co-located** | `[ComponentName].stories.tsx` | `V2Button.stories.tsx`, `V2Sidebar.stories.tsx` |
| **Theme & Styles V2** | `src/v2/shared/styles/` & `src/v2/shared/theme/` | `v2-theme.css`, `v2ThemeHelper.ts` |
| **Shadcn primitives** | `src/v2/shared/ui/<name>/` (Folder-per-component) | `@/v2/shared/ui` hoặc `@/v2/shared/ui/button` |
| **Màu sắc** | No Blue Mandate — HSL Semantic Palette | CẤM dùng `bg-blue-600`, dùng `bg-primary` hoặc HSL token |
| **Đa ngôn ngữ** | 100% i18n VI/EN | CẤM hardcode chuỗi string trong JSX, dùng `t('...')` |

---

## 💻 Code Patterns Mẫu Chuẩn

### 1. Switcher Pattern (< 15 LoC)
File: `SalesOrderTable.tsx`
```tsx
import React from 'react';
import { useViewport } from '@/v2/shared/hooks/useViewport';
import { SalesOrderTableDesktop } from './SalesOrderTable.desktop';
import { SalesOrderTableMobile } from './SalesOrderTable.mobile';
import { SalesOrderTableProps } from './SalesOrderTable.type';

export const SalesOrderTable: React.FC<SalesOrderTableProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? <SalesOrderTableMobile {...props} /> : <SalesOrderTableDesktop {...props} />;
};
```

### 2. Viewport Hook & Breakpoint Engine
File: `src/v2/shared/hooks/useViewport.ts`
```ts
import { useState, useEffect } from 'react';

export interface ViewportState {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useViewport(): ViewportState {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}
```

Co-located Test: `src/v2/shared/hooks/useViewport.test.ts`
```ts
import { describe, it, expect } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useViewport } from './useViewport';

describe('useViewport Hook', () => {
  it('phải nhận diện đúng Desktop khi width >= 1024px', () => {
    global.innerWidth = 1200;
    const { result } = renderHook(() => useViewport());
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  it('phải nhận diện đúng Mobile khi width < 768px', () => {
    global.innerWidth = 375;
    const { result } = renderHook(() => useViewport());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });
});
```

### 3. Pure Business Domain Rule & Co-located Test
File: `src/v2/modules/sales-orders/domain/rules/can-deliver-order.ts`
```ts
export interface OrderDeliveryCheckInput {
  status: 'DRAFT' | 'CONFIRMED' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  remainingQuantity: number;
  isCreditLocked?: boolean;
}

export interface DeliveryCheckResult {
  canDeliver: boolean;
  reason?: string;
}

export function canDeliverOrder(input: OrderDeliveryCheckInput): DeliveryCheckResult {
  if (input.status === 'CANCELLED') {
    return { canDeliver: false, reason: 'order_is_cancelled' };
  }
  if (input.status === 'DELIVERED') {
    return { canDeliver: false, reason: 'order_already_delivered' };
  }
  if (input.isCreditLocked) {
    return { canDeliver: false, reason: 'customer_credit_locked' };
  }
  if (input.remainingQuantity <= 0) {
    return { canDeliver: false, reason: 'no_remaining_quantity' };
  }
  return { canDeliver: true };
}
```

Co-located Test: `src/v2/modules/sales-orders/domain/rules/can-deliver-order.test.ts`
```ts
import { describe, it, expect } from 'bun:test';
import { canDeliverOrder } from './can-deliver-order';

describe('Domain Rule: canDeliverOrder', () => {
  it('cho phép giao khi đơn đã xác nhận và còn số lượng', () => {
    const result = canDeliverOrder({
      status: 'CONFIRMED',
      remainingQuantity: 5,
    });
    expect(result.canDeliver).toBe(true);
  });

  it('chặn giao khi khách hàng bị khóa công nợ', () => {
    const result = canDeliverOrder({
      status: 'CONFIRMED',
      remainingQuantity: 5,
      isCreditLocked: true,
    });
    expect(result.canDeliver).toBe(false);
    expect(result.reason).toBe('customer_credit_locked');
  });
});
```

---

## 🛡️ Platform Split Decision Matrix

```
useViewport() → breakpoints:
  mobile  : < 768px
  tablet  : 768px – 1023px (mặc định xem như mobile trừ khi có UI riêng)
  desktop : ≥ 1024px
```

| Tầng Atomic | Áp dụng Platform Split? | Giải pháp thực thi |
| :--- | :---: | :--- |
| **Atoms (L1)** | ❌ Không | Dùng Tailwind class responsive (`sm:`, `md:`, `lg:`) |
| **Molecules (L2)** | ❌ Không | Dùng Tailwind class responsive |
| **Organisms (L3)** | ✅ Bắt buộc khi layout khác biệt | Tách `[Name].desktop.tsx` (Table) và `[Name].mobile.tsx` (Card list) |
| **Templates (L4)** | ✅ Bắt buộc | `SpreadsheetPageTemplate.desktop.tsx` vs `MobilePageTemplate.mobile.tsx` |
| **Pages (L5)** | ✅ Bắt buộc khi UX khác biệt | Tách riêng file page Desktop và Mobile |
| **App Shell** | ✅ Bắt buộc | `V2AppLayout.desktop.tsx` (Sidebar) vs `V2AppLayout.mobile.tsx` (Bottom Nav) |
| **Drawers / Modals** | ✅ Bắt buộc | Desktop: Right Drawer (65vw); Mobile: Bottom Sheet trượt từ đáy |

---

## 🔍 Grep Audit Suite (Chạy trước khi Commit / Hoàn Tất Task)

```bash
# 1. Kiểm tra vi phạm No Blue Mandate (phải trả về 0 kết quả)
grep -rn "blue-" src/v2/modules/[module-name]/

# 2. Kiểm tra file vượt ngưỡng 180 LoC
find src/v2/modules/[module-name]/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 180 {print}'

# 3. Quét hardcode chuỗi text trong JSX
grep -rn '>[A-ZÀ-Ỹa-zà-ỹ0-9 ]*<' src/v2/modules/[module-name]/

# 4. Kiểm tra TypeScript toàn dự án
cd /home/dev/repos-dev/erp/erp-web && bunx tsc --noEmit

# 5. Chạy unit tests của module
cd /home/dev/repos-dev/erp/erp-web && bun test src/v2/modules/[module-name]/
```
