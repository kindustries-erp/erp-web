---
name: v2-drawer
description: Module tri thức Chuẩn Hóa Drawer V2 (V2StandardFormDrawer) theo kiến trúc ERP Web v2 (Dual-Run /v2/, Atomic Design 5 tầng, Platform Split Desktop/Mobile, < 180 LoC, No Blue Mandate, 100% i18n, Co-located Vitest testing & Storybook) trong erp-web (src/v2/shared/components/organisms/v2-standard-form-drawer và src/v2/shared/ui/sheet).
---

# 📋 Module Tri Thức: Chuẩn Hóa Drawer V2 (`V2StandardFormDrawer`) - Frontend (`erp-web`)

## 1. Tổng Quan Kiến Trúc & Trách Nhiệm Hệ Thống

`V2StandardFormDrawer` là component Drawer/Ngăn kéo chuẩn mực thế hệ mới của hệ thống **Liouni ERP Web V2**, lấy **ERP Invoice Drawer V1** (`StandardFormDrawer` + `slide-panel` trong `src/styles/panels.css`) làm chuẩn vàng (100% visual & feature parity), đồng thời tái cấu trúc theo chuẩn **Atomic Design 5 Tầng**:

1. **Atomic Design 5 Tầng Phân Minh**:
   - **L1 (Atoms & UI Primitives)**:
     - `src/v2/shared/ui/sheet/`: Radix Dialog nâng cấp với keyframes `slide-in-from-right`, `slide-out-to-right`, `slide-in-from-bottom`, `slide-out-to-bottom` sử dụng đường cong gia tốc `cubic-bezier(0.16, 1, 0.3, 1)`. Biến thể `floating` (Desktop) và `fullscreen` (Esc/Maximize).
     - `src/v2/shared/ui/button/` & `src/v2/shared/components/atoms/v2-button/`: Bổ sung variants `drawer-edit`, `drawer-tab`.
     - `src/v2/shared/ui/text/` & `src/v2/shared/components/atoms/v2-text/`: Bổ sung variants `section-title`, `drawer-title`, `drawer-subtitle`.
   - **L2 (Molecules)**:
     - `<DrawerSection>`: Phân vùng nội dung kính mờ `backdrop-blur-[12px]`, cơ chế **Collapsible Arrow-Only** (chỉ thu gọn khi click đúng vào icon mũi tên `ChevronDown`, không bắt sự kiện trên toàn header), `fitViewportHeight`, hỗ trợ `hideHeader`/`hideTitle`, dùng `V2Text variant="section-title"`.
     - `<DrawerField>`: Trường nhập liệu kèm nhãn (`V2Text variant="label"`), dấu `*` đỏ khi bắt buộc, helper text và thông báo lỗi.
     - `<DrawerRow>`: Cặp key-value tinh tế cho chế độ xem (View Mode), tích hợp nút copy nhanh giá trị (`Button variant="ghost"`).
     - `<DrawerHeader>`: Thanh tiêu đề kính mờ tích hợp `isScrolledTop` shadow, `V2Text variant="drawer-title"`, `V2Button variant="drawer-edit"`, Toàn màn hình (`Maximize2`/`Minimize2`), Thu gọn/Mở rộng Cột phải (`ChevronRight`/`ChevronLeft`), và nút Đóng `X`.
     - `<DrawerFooter>`: Chân trang cố định (sticky) với `isScrolledBottom` shadow, hỗ trợ `safe-area-inset-bottom`, tự động wrap nút trên mobile và dùng `V2Button` cho tất cả actions.
     - `<DrawerTopTabBar>`: Dải tabs điều hướng trên đỉnh ngay dưới Header, hỗ trợ cuộn cảm ứng `touch-pan-x` trên mobile, `badgeCount`, icon, dùng `V2Text`.
     - `<DrawerAuditTimeline>`: Lịch sử thao tác dạng trục dọc (`spine`) liên tục, node tròn (`w-6 h-6`), không lồng viền card nặng nề, dùng `V2Text`.
     - `<DrawerRelatedDeck>`: Horizon Divider Bar (`border-t border-border/60`) và Connected Context Deck ở đáy Main Body (dùng `V2Button variant="drawer-tab"`, `V2Text`, thẻ kính mờ `backdrop-blur-md`, collapsible).
   - **L3 (Organisms)**: `src/v2/shared/components/organisms/v2-standard-form-drawer/`:
     - `V2StandardFormDrawer.tsx`: Switcher nền tảng (< 20 LoC) dùng `useViewport()`.
     - `V2StandardFormDrawer.desktop.tsx`: Floating Sheet Card (`top-2.5 right-4 bottom-4 md:right-5 md:bottom-4.5`, `rounded-2xl`, `border border-border/80`, `card-shadow`). Bố cục 2 khối Card kính độc lập nằm trên canvas, cách nhau bằng `gap-4 lg:gap-6` (không dùng đường kẻ dọc `border-l` ngăn cách).
     - `V2StandardFormDrawer.mobile.tsx`: Fullscreen Bottom Sheet (`100vw`, `100dvh`, Grab Handle, Slide-up).
     - `V2StandardFormDrawer.hook.ts`: Hook quản lý state tabs, fullscreen, right panel collapse, scroll detection (`isScrolledTop`, `isScrolledBottom`), confirm close và phím tắt `Esc` 2 tầng.
2. **Platform Split (Desktop vs Mobile)**:
   - **Desktop ($\ge 1024px$)**: Floating Card với 4 góc bo cong (`rounded-2xl`), viền 4 cạnh (`border border-border/80`), trượt êm từ phải sang trái. Khi bật fullscreen chuyển sang `inset-0 w-screen h-dvh rounded-none border-0`.
   - **Mobile & Tablet ($< 1024px$)**: Fullscreen Bottom Sheet chiếm `100vw` và `100dvh`, trượt từ dưới lên, có Grab Handle, bù padding an toàn (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`), cột phải xếp dọc tự nhiên dưới cột trái.
3. **No Blue Mandate & 100% i18n**:
   - Tuyệt đối không dùng class `blue-*`. Toàn bộ màu sắc dùng neutral tokens, brand `primary`, semantic `emerald-*` (thành công), `amber-*` (tiến trình/cảnh báo) và `destructive` (lỗi/hủy).
   - Đa ngôn ngữ 100% qua từ điển `v2.drawer.*` trong `src/v2/shared/locales/` (`vi.ts`, `en.ts`).
4. **Kiểm Soát Kích Thước File Cứng (< 180 LoC)**:
   - 100% files thành phần đều `< 175 LoC`.

---

## 2. Quy Chuẩn Kích Thước Responsive theo `vw` (Desktop $\ge 1024px$)

| Size Preset | Responsive Width theo `vw` | Min Width | Max Width | Mục đích sử dụng thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **`sm`** | `lg:w-[42vw] xl:w-[38vw] 2xl:w-[32vw]` | `420px` | `660px` | Form đơn giản 1 cột: Profile, Đổi mật khẩu, Gán nhãn tags |
| **`md`** | `lg:w-[60vw] xl:w-[54vw] 2xl:w-[48vw]` | `620px` | `980px` | Form 1 cột trung bình: Master data, Cấu hình danh mục kho |
| **`lg`** | `lg:w-[78vw] xl:w-[74vw] 2xl:w-[68vw]` | `840px` | `1380px` | Form 2 cột vừa phải: Đối tác, Khách hàng Garage |
| **`xl`** | `lg:w-[93vw] xl:w-[90vw] 2xl:w-[88vw]` | `1020px` | `1780px` | Chứng từ đa góc nhìn (~90vw): Hóa đơn ERP, Phiếu kho, PO, SO, Lệnh SX |
| **`full`** | `lg:w-[calc(100vw-36px)]` | `1020px` | `calc(100vw-36px)` | Toàn màn hình (không che Sidebar): Traceability Graph, Báo cáo lớn |

---

## 3. Public API Contract (`V2StandardFormDrawerProps`)

```typescript
import type {
  DrawerTopTabItem,
  DrawerAction,
  DrawerRelatedTabItem,
  V2DrawerSize,
  V2DrawerMode,
  V2DrawerLayout,
} from "@/v2/shared/components/organisms/v2-standard-form-drawer";

export interface V2StandardFormDrawerProps {
  open: boolean;
  mode?: V2DrawerMode; // "view" | "edit" (default: "view")
  onClose: () => void;
  onToggleEdit?: () => void; // Hiển thị nút bút chì góc trên bên phải khi ở mode view

  title: string | React.ReactNode;
  titleExtra?: React.ReactNode; // Status badge kế bên tiêu đề
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;

  layout?: V2DrawerLayout; // "1-column" | "2-columns"
  size?: V2DrawerSize;      // "sm" | "md" | "lg" | "xl" | "full"

  // Điều khiển Toàn màn hình (Fullscreen)
  enableFullscreen?: boolean; // Mặc định true cho layout 2-columns
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;

  // Điều khiển Thu gọn / Mở rộng Cột phải
  collapsibleRightPanel?: boolean; // Mặc định true cho layout 2-columns
  isRightPanelCollapsed?: boolean;
  onRightPanelCollapseChange?: (collapsed: boolean) => void;
  stickyRightPanel?: boolean;

  // Top Tabs cho chứng từ đa góc nhìn
  tabs?: DrawerTopTabItem[];
  activeTabKey?: string;
  defaultTabKey?: string;
  onTabChange?: (tabKey: string) => void;

  // Nội dung
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children?: React.ReactNode;

  // Horizon Divider & Related Deck
  relatedTabs?: DrawerRelatedTabItem[];
  defaultRelatedTabKey?: string;
  defaultRelatedCollapsed?: boolean;
  bottomPanel?: React.ReactNode;
  bottomPanelTitle?: React.ReactNode;
  onRelatedTabChange?: (tabKey: string) => void;
  deckCardClassName?: string;

  // Thao tác nút bấm & Chân trang
  actions?: DrawerAction[];
  footerLeft?: React.ReactNode;

  // Cảnh báo & Trạng thái
  loading?: boolean;
  error?: string | null;
  confirmOnClose?: boolean; // Hiển thị confirm modal khi đóng nếu mode === "edit"
}
```

---

## 4. Mẫu Sử Dụng Chuẩn (Code Examples)

### Ví dụ 1: Form Đơn Giản 1 Cột (`layout="1-column"`, `size="sm"`)

```tsx
import { V2StandardFormDrawer, DrawerSection, DrawerField } from "@/v2/shared/components/organisms/v2-standard-form-drawer";

export function UserProfileDrawer({ open, onClose }) {
  return (
    <V2StandardFormDrawer
      open={open}
      onClose={onClose}
      layout="1-column"
      size="sm"
      title="Hồ Sơ Cá Nhân"
      subtitle="Cập nhật thông tin tài khoản"
      actions={[
        { label: "Đóng", onClick: onClose, variant: "secondary" },
        { label: "Lưu thay đổi", onClick: handleSave, primary: true },
      ]}
    >
      <DrawerSection title="Thông Tin Cơ Bản">
        <DrawerField label="Họ và Tên" required>
          <input className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-xs" />
        </DrawerField>
      </DrawerSection>
    </V2StandardFormDrawer>
  );
}
```

### Ví dụ 2: Chứng Từ Hóa Đơn 2 Cột với Related Deck & Timeline (Golden Parity)

```tsx
import {
  V2StandardFormDrawer,
  DrawerSection,
  DrawerRow,
  DrawerAuditTimeline,
} from "@/v2/shared/components/organisms/v2-standard-form-drawer";
import { Badge } from "@/v2/shared/ui/badge";
import { Wallet, History, FileText } from "lucide-react";

export function ErpInvoiceDetailDrawer({ open, onClose, invoice }) {
  return (
    <V2StandardFormDrawer
      open={open}
      onClose={onClose}
      layout="2-columns"
      size="xl"
      title={`Hóa Đơn Điện Tử: ${invoice.symbol} - ${invoice.invoiceNumber}`}
      titleExtra={<Badge variant="default">Đã phát hành</Badge>}
      subtitle={`Người mua: ${invoice.buyerName} • Ký ngày: ${invoice.signedDate}`}
      actions={[
        { label: "Tải XML", variant: "outline", align: "left", onClick: () => downloadXml(invoice) },
        { label: "In PDF", variant: "secondary", align: "left", onClick: () => printPdf(invoice) },
        { label: "Đóng", onClick: onClose, variant: "secondary" },
        { label: "Lưu thay đổi", onClick: handleSave, primary: true },
      ]}
      leftPanel={
        <>
          <DrawerSection title="Thông Tin Người Mua & Xuất Hóa Đơn">
            <DrawerRow label="Mã Số Thuế" value={invoice.buyerTaxCode} copyable />
            <DrawerRow label="Tên Đơn Vị" value={invoice.buyerName} />
            <DrawerRow label="Địa Chỉ" value={invoice.buyerAddress} />
          </DrawerSection>
          <DrawerSection title={`Danh Mục Hàng Hóa (${invoice.items.length})`}>
            {/* Embedded DataTable */}
          </DrawerSection>
        </>
      }
      rightPanel={
        <>
          <DrawerSection title="Tổng Quan Tài Chính">
            <DrawerRow label="Tiền Chưa Thuế" value={invoice.subtotalFormatted} />
            <DrawerRow label="Tiền Thuế GTGT" value={invoice.vatAmountFormatted} />
            <DrawerRow label="Tổng Thanh Toán" value={invoice.totalFormatted} />
          </DrawerSection>
          <DrawerSection title="Chứng Thư Số & GDT">
            <DrawerRow label="Mã GDT" value={invoice.gdtCode} copyable />
            <DrawerRow label="Thời Gian Ký" value={invoice.signedAt} />
          </DrawerSection>
        </>
      }
      relatedTabs={[
        {
          key: "settlements",
          label: "Chứng Từ Cấn Trừ",
          icon: <Wallet className="w-3.5 h-3.5" />,
          badgeCount: invoice.settlements.length,
          content: <InvoiceSettlementsList items={invoice.settlements} />,
        },
        {
          key: "audit",
          label: "Lịch Sử Thao Tác",
          icon: <History className="w-3.5 h-3.5" />,
          badgeCount: invoice.auditLogs.length,
          content: <DrawerAuditTimeline items={invoice.auditLogs} />,
        },
      ]}
    />
  );
}
```

---

## 5. Danh Mục Kiểm Tra Chất Lượng (Quality Gate Checklist)

- [x] Lấy ERP Invoice V1 (`StandardFormDrawer` + `slide-panel`) làm chuẩn vàng (100% feature & visual parity).
- [x] Floating Card: 4 góc bo cong `rounded-2xl`, viền 4 cạnh `border border-border/80`, cách mép màn hình `top-2.5 right-4 bottom-4 md:right-5 md:bottom-4.5`.
- [x] Slide animation êm mượt: Sử dụng `cubic-bezier(0.16, 1, 0.3, 1)` với Tailwind keyframes `slide-in-from-right` và `slide-in-from-bottom`.
- [x] 2 Khối Card Kính Độc Lập: Cột trái và cột phải nằm trên canvas với `gap-4 lg:gap-6`, không dùng đường kẻ dọc `border-l` cứng nhắc.
- [x] Horizon Divider & Related Deck: `<DrawerRelatedDeck />` hỗ trợ tabs có icon, badges, container kính mờ, collapsible.
- [x] Atoms Composition: Tất cả molecules sử dụng Atoms (`V2Text`, `V2Button`, `Button`, `Text`) thay vì raw HTML.
- [x] Khống chế kích thước file: 100% file thành phần đều `< 175 LoC`.
- [x] Tuân thủ No Blue Mandate: Không dùng class màu `blue-*`.
- [x] Phím tắt `Esc` 2 tầng: Esc lần 1 thu nhỏ toàn màn hình, Esc lần 2 đóng drawer (hỏi confirm nếu đang edit).
- [x] Đầy đủ bộ unit tests Vitest co-located (138/138 tests pass) và Storybook stories mô phỏng đầy đủ ERP Invoice.
