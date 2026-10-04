---
name: v2-drawer
description: Module tri thức Chuẩn Hóa Drawer V2 (V2StandardDrawer) theo kiến trúc ERP Web v2 (Dual-Run /v2/, Atomic Design 5 tầng, Platform Split Desktop/Mobile, < 180 LoC, No Blue Mandate, 100% i18n, Co-located Vitest testing & Storybook) trong erp-web (src/v2/shared/components/organisms/v2-standard-drawer và src/v2/shared/ui/sheet).
---

# 📋 Module Tri Thức: Chuẩn Hóa Drawer V2 (`V2StandardDrawer`) - Frontend (`erp-web`)

## 1. Tổng Quan Kiến Trúc & Trách Nhiệm Hệ Thống

`V2StandardDrawer` là component Drawer/Ngăn kéo chuẩn mực thế hệ mới của hệ thống **Liouni ERP Web V2**, lấy **ERP Invoice Drawer V1** (`StandardDrawer` + `slide-panel` trong `src/styles/panels.css`) làm chuẩn vàng (100% visual & feature parity), đồng thời tái cấu trúc sạch sẽ theo chuẩn **Atomic Design 5 Tầng**:

1. **Atomic Design 5 Tầng Phân Minh**:
   - **L1 (Atoms & UI Primitives)**:
     - `src/v2/shared/ui/sheet/`: Radix Dialog nâng cấp với keyframes `slide-in-from-right`, `slide-out-to-right`, `slide-in-from-bottom`, `slide-out-to-bottom` sử dụng đường cong gia tốc `cubic-bezier(0.16, 1, 0.3, 1)`. Biến thể `floating` (Desktop) và `fullscreen` (Esc/Maximize).
     - `src/v2/shared/components/atoms/v2-button/`: 100% buttons trong Drawer đều sử dụng `V2Button` (nút đóng, maximize, toggle right panel, chevron collapse, copy row, trigger action popover, actions footer).
     - `src/v2/shared/components/atoms/v2-text/`: 100% text/nhãn/title trong Drawer đều sử dụng `V2Text` (`drawer-title`, `drawer-subtitle`, `section-title`, `body-sm`).
   - **L2 (Molecules)**:
     - `<V2TabBar>` (`src/v2/shared/components/molecules/v2-tab-bar/`): Thành phần TabBar thống nhất toàn diện hỗ trợ 3 biến thể (`variant`):
       - `variant="header"`: Dải tabs điều hướng trên đỉnh đặt sticky ngay dưới Header và nằm ngoài scroll container, active tab nền đen `bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground`, icon, badge tròn, hỗ trợ `extra`.
       - `variant="sub"`: Dải tab phụ segmented pill container (`rounded-xl p-1 bg-muted/40 border border-border/70`), active pill dạng thẻ trắng nổi bóng (`bg-surface text-foreground shadow-xs border`), hỗ trợ gắn trên đỉnh Cột trái (`leftTabs`) hoặc Cột phải (`rightTabs`), kèm cụm nút tiện ích bên phải (`leftTabExtra` / `rightTabExtra`: `[ 📄 Xem trước HĐ thuần ]`, `[ 📎 Tài liệu & PDF ]`).
       - `variant="app"`: Dải tab đa nhiệm cấp ứng dụng với gạch chân `border-b-2 border-primary` và nút đóng `X`.
     - `<DrawerSection>`: Phân vùng nội dung kính mờ `backdrop-blur-[12px]`, cơ chế **Collapsible Arrow-Only** (click đúng icon mũi tên `V2Button` `ChevronDown`), `fitViewportHeight`, hỗ trợ `hideHeader`/`hideTitle`, dùng `V2Text variant="section-title"`.
     - `<DrawerField>`: Trường nhập liệu kèm nhãn (`V2Text variant="label"`), dấu `*` đỏ khi bắt buộc, helper text và thông báo lỗi.
     - `<DrawerRow>`: Cặp key-value tinh tế cho chế độ xem (View Mode), tích hợp nút copy nhanh giá trị (`V2Button variant="ghost"`).
     - `<DrawerHeader>`: Thanh tiêu đề kính mờ tích hợp `isScrolledTop` shadow, `V2Text variant="drawer-title"`, `V2Button variant="drawer-edit"`, **thanh divider dọc phân cách nút Chỉnh sửa với cụm controls**, Toàn màn hình (`Maximize2`/`Minimize2`), Thu gọn/Mở rộng Cột phải (`ChevronRight`/`ChevronLeft`), và nút Đóng `X`.
     - `<DrawerFooter>`: Chân trang cố định (sticky) với `isScrolledBottom` shadow, hỗ trợ `safe-area-inset-bottom`, tự động wrap nút trên mobile, dùng `V2Button` cho tất cả actions, và **tích hợp `V2Dropdown` mở menu nhóm tác vụ `[ Thao tác ⌄ ]` ở góc trái**.
     - `<V2Dropdown>` (`src/v2/shared/components/molecules/v2-dropdown/`): Molecule menu dropdown độc lập 2 tầng, **Desktop chạy trên nền tảng `AppPopover` (`V2Popover`)** giúp triệt tiêu hoàn toàn lỗi xung đột focus-trap / pointer-event bên trong Sheet/Dialog; Mobile mở dạng Bottom Sheet có grab handle.
     - `<DrawerAuditTimeline>`: Lịch sử thao tác dạng trục dọc (`spine`) liên tục, node tròn (`w-6 h-6`), không lồng viền card nặng nề, dùng `V2Text`.
     - `<DrawerRelatedDeck>`: Horizon Divider Bar (`border-t border-border/60`) và Connected Context Deck ở đáy Main Body (dùng `V2Button`, `V2Text`, thẻ kính mờ `backdrop-blur-md`, collapsible).
   - **L3 (Organisms)**: `src/v2/shared/components/organisms/v2-standard-drawer/`:
     - `V2StandardDrawer.tsx`: Switcher nền tảng (< 20 LoC) dùng `useViewport()`.
     - `V2StandardDrawer.desktop.tsx`: Floating Sheet Card (`top-2.5 right-4 bottom-4 md:right-5 md:bottom-4.5`, `rounded-2xl`, `border border-border/80`, `card-shadow`). Bố cục 2 khối Card kính độc lập nằm trên canvas, cách nhau bằng `gap-4 lg:gap-6` (không dùng đường kẻ dọc `border-l` ngăn cách).
     - `V2StandardDrawer.mobile.tsx`: Fullscreen Bottom Sheet (`100vw`, `100dvh`, Grab Handle, Slide-up).
     - `V2StandardDrawer.hook.ts`: Hook quản lý state tabs, fullscreen, right panel collapse, scroll detection (`isScrolledTop`, `isScrolledBottom`), confirm close và phím tắt `Esc` 2 tầng.
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

## 3. Public API Contract (`V2StandardDrawerProps`)

```typescript
import type {
  V2TabItemData,
  DrawerAction,
  DrawerRelatedTabItem,
  V2DropdownGroup,
  V2DropdownEntry,
  V2DrawerSize,
  V2DrawerMode,
  V2DrawerLayout,
} from "@/v2/shared/components/organisms/v2-standard-drawer";

export interface V2StandardDrawerProps {
  open: boolean;
  mode?: V2DrawerMode; // "view" | "edit" (default: "view")
  onClose: () => void;
  onToggleEdit?: () => void; // Hiển thị nút Chỉnh sửa góc trên bên phải khi ở mode view

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

  // 1. Header Tabs (Toàn cục qua V2TabBar variant="header")
  tabs?: V2TabItemData[];
  activeTabKey?: string;
  defaultTabKey?: string;
  onTabChange?: (tabKey: string) => void;
  tabBarExtra?: React.ReactNode;

  // 2. Left Sub-Tabs (Optional qua V2TabBar variant="sub")
  leftTabs?: V2TabItemData[];
  activeLeftTabKey?: string;
  defaultLeftTabKey?: string;
  onLeftTabChange?: (subTabKey: string) => void;
  leftTabExtra?: React.ReactNode;

  // 3. Right Sub-Tabs (Optional qua V2TabBar variant="sub")
  rightTabs?: V2TabItemData[];
  activeRightTabKey?: string;
  defaultRightTabKey?: string;
  onRightTabChange?: (subTabKey: string) => void;
  rightTabExtra?: React.ReactNode;

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
  actionGroups?: V2DropdownGroup[]; // Nhóm thao tác mở popover dropdown [ Thao tác ⌄ ]
  actionDropdownItems?: V2DropdownEntry[];
  actionDropdownTriggerLabel?: string; // Mặc định "Thao tác"
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
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";

export function UserProfileDrawer({ open, onClose }) {
  return (
    <V2StandardDrawer
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
    </V2StandardDrawer>
  );
}
```

### Ví dụ 2: Chứng Từ Hóa Đơn 2 Cột với V2TabBar 2 Tầng (Golden Simulation)

```tsx
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerRow } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Badge } from "@/v2/shared/ui/badge";
import { FileText, CreditCard, Link2, BookOpen, History, Paperclip } from "lucide-react";

export function ErpInvoiceDetailDrawer({ open, onClose, invoice }) {
  return (
    <V2StandardDrawer
      open={open}
      onClose={onClose}
      layout="2-columns"
      size="full"
      title={`Thông tin nội bộ: ${invoice.number}`}
      titleExtra={<Badge variant="outline">Mới</Badge>}
      subtitle={`Người mua: ${invoice.buyerName} • Kỳ ngày: ${invoice.date}`}
      tabs={[
        { key: "details", label: "Chi tiết", icon: <FileText className="w-3.5 h-3.5" /> },
        { key: "financials", label: "Tài chính", icon: <CreditCard className="w-3.5 h-3.5" /> },
        { key: "linked_docs", label: "Chứng từ liên kết", icon: <Link2 className="w-3.5 h-3.5" /> },
        { key: "accounting", label: "Hạch toán kế toán", icon: <BookOpen className="w-3.5 h-3.5" /> },
        { key: "history", label: "Lịch sử & Kiểm duyệt", icon: <History className="w-3.5 h-3.5" />, badgeCount: 1 },
      ]}
      leftTabs={[
        { key: "detail", label: "Chi tiết" },
        { key: "target", label: "Chi tiết theo đối tượng", badgeCount: 20 },
        { key: "items", label: "Chi tiết HHDV" },
        { key: "analysis", label: "Biến động & Phân tích" },
      ]}
      leftTabExtra={
        <div className="flex items-center gap-2">
          <V2Button variant="outline" size="xs">
            <FileText className="w-3.5 h-3.5" /> Xem trước HĐ thuần
          </V2Button>
          <V2Button variant="outline" size="xs">
            <Paperclip className="w-3.5 h-3.5" /> Tài liệu & PDF
          </V2Button>
        </div>
      }
      leftPanel={<DrawerSection title="DANH SÁCH CHI TIẾT HÀNG HÓA & DỊCH VỤ">...</DrawerSection>}
      rightPanel={<DrawerSection title="THÔNG TIN CHUNG">...</DrawerSection>}
    />
  );
}
```

---

## 5. Danh Mục Kiểm Tra Chất Lượng (Quality Gate Checklist)

- [x] Lấy ERP Invoice V1 (`StandardDrawer` + `slide-panel`) làm chuẩn vàng (100% feature & visual parity).
- [x] Đổi tên triệt để `V2StandardFormDrawer` thành `V2StandardDrawer`.
- [x] 100% components trong Drawer sử dụng `V2Button`, `V2Text`, và `V2TabBar`.
- [x] Hợp nhất thanh TabBar: `V2TabBar` tại `src/v2/shared/components/molecules/v2-tab-bar/` hỗ trợ 3 variants: `header`, `sub`, `app` và prop `extra`.
- [x] Floating Card: 4 góc bo cong `rounded-2xl`, viền 4 cạnh `border border-border/80`, cách mép màn hình `top-2.5 right-4 bottom-4 md:right-5 md:bottom-4.5`.
- [x] Slide animation êm mượt: Sử dụng `cubic-bezier(0.16, 1, 0.3, 1)` với Tailwind keyframes `slide-in-from-right` và `slide-in-from-bottom`.
- [x] 2 Khối Card Kính Độc Lập: Cột trái và cột phải nằm trên canvas với `gap-4 lg:gap-6`, không dùng đường kẻ dọc `border-l` cứng nhắc.
- [x] Khống chế kích thước file: 100% file thành phần đều `< 175 LoC`.
- [x] Tuân thủ No Blue Mandate: Không dùng class màu `blue-*`.
- [x] Phím tắt `Esc` 2 tầng: Esc lần 1 thu nhỏ toàn màn hình, Esc lần 2 đóng drawer (hỏi confirm nếu đang edit).
- [x] 100% unit tests Vitest co-located pass (155/155 tests pass) và Storybook stories mô phỏng đầy đủ ERP Invoice.
