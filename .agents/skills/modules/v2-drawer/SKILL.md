---
name: v2-drawer
description: Module tri thức Chuẩn Hóa Drawer V2 (V2StandardDrawer) theo kiến trúc ERP Web v2 (Dual-Run /v2/, Atomic Design 5 tầng, Platform Split Desktop/Mobile, < 180 LoC, No Blue Mandate, 100% i18n, Co-located Vitest testing & Storybook) trong erp-web (src/v2/shared/components/organisms/v2-standard-drawer và src/v2/shared/ui/sheet).
---

# 📋 Module Tri Thức: Chuẩn Hóa Drawer V2 (`V2StandardDrawer`) - Frontend (`erp-web`)

## 1. Tổng Quan Kiến Trúc & Trách Nhiệm Hệ Thống

`V2StandardDrawer` là component Drawer/Ngăn kéo chuẩn mực thế hệ mới của hệ thống **Liouni ERP Web V2**, lấy **ERP Invoice Drawer V1** (`StandardDrawer` + `slide-panel` trong `src/styles/panels.css`) làm chuẩn vàng (100% visual & feature parity), đồng thời tái cấu trúc sạch sẽ theo chuẩn **Atomic Design 5 Tầng**:

1. **Atomic Design 5 Tầng Phân Minh**:
   - **L1 (Atoms & UI Primitives)**:
     - `src/v2/shared/ui/sheet/`: Radix Dialog nâng cấp với keyframes `slide-in-from-right`, `slide-out-to-right`, `slide-in-from-bottom`, `slide-out-to-bottom` sử dụng đường cong gia tốc `cubic-bezier(0.16, 1, 0.3, 1)`. Biến thể `floating` (Desktop) và `fullscreen` (Esc/Maximize). `SheetOverlay` sáng sủa trong suốt 96% theo chuẩn V1 với token CSS `bg-[var(--drawer-overlay-bg,rgba(15,23,42,0.04))]` (loại bỏ hoàn toàn `backdrop-blur` và `bg-black/35` gây đục/tối màn hình cha).
     - `src/v2/shared/components/atoms/v2-button/`: 100% buttons trong Drawer đều sử dụng `V2Button` (nút đóng, maximize, toggle right panel, chevron collapse, copy row, trigger action popover, actions footer).
     - `src/v2/shared/components/atoms/v2-text/`: 100% text/nhãn/title trong Drawer đều sử dụng `V2Text` (`drawer-title`, `drawer-subtitle`, `section-title`, `body-sm`).
   - **L2 (Molecules)**:
     - `<V2TabBar>` (`src/v2/shared/components/molecules/v2-tab-bar/`): Thành phần TabBar thống nhất toàn diện hỗ trợ 4 biến thể (`variant`):
       - `variant="header"`: Dải tabs điều hướng trên đỉnh đặt sticky ngay dưới Header và nằm ngoài scroll container, active tab nền đen `bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground`, icon, badge tròn, hỗ trợ `extra`.
       - `variant="sub"`: Dải tab phụ dạng viên thuốc bo tròn toàn phần (`rounded-full bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/70 p-[3px] h-8 gap-1 shadow-... overflow-x-auto overflow-y-hidden`), tích hợp **Sliding Pill Indicator** trượt mượt mà (`180ms ease-out`), triệt tiêu hoàn toàn lỗi cuộn dọc Linux `▲▼`. Các tab items sử dụng `V2Button` (`variant="pill-tab"`, `size="pill-sm"`, `h-6 px-3 text-xs rounded-full`), tạo khoảng hở (space) 3px–4px thông thoáng quanh viên thuốc active so với viền container (floating island y hệt V1), nhãn dùng `V2Text` (`variant="tab-pill"` `tracking-tight`), ẩn icon khi inactive (chỉ bung `w-3.5` khi tab active hoặc có `alwaysShowIcon: true` kèm transition mượt), badge đếm chuẩn hóa (`min-w-[16px] h-4 px-1.5 ml-1 rounded-full text-[10px] font-mono`). Hỗ trợ `leftTabs` và `rightTabs`.
       - `variant="button-group"`: Dải tab chuyển đổi chế độ xem bên phải (`leftTabExtra`), tab active nền đen phẳng `bg-slate-900 text-white font-semibold shadow-xs`, tab inactive thẻ trắng có viền `bg-white dark:bg-zinc-900 text-slate-700 border border-slate-200/80`, hỗ trợ icon, badge và chấm tròn trạng thái `dot` (emerald/amber/rose).
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
     - `V2StandardDrawer.desktop.tsx`: Floating Sheet Card (< 145 LoC) tích hợp `V2StandardDrawer.state-guard.tsx`, `V2StandardDrawer.desktop-columns.tsx`, `V2StandardDrawer.confirm-modal.tsx` và `DrawerRelatedDeck`.
     - `V2StandardDrawer.desktop-columns.tsx`: Bố cục 2 cột Desktop (< 80 LoC), điều khiển hiệu ứng **Smooth CSS Transition Expand/Collapse** cho cột phải (`transition-all duration-300 ease-in-out`, co giãn `gap-0` <-> `gap-4 lg:gap-6`, `w-0 opacity-0` <-> `w-72 xl:w-80 opacity-100`, inner wrapper `min-w-[280px]` chống vỡ layout) và hiệu ứng **Tab Content Fade Transition** (`animate-in fade-in-50 duration-200`).
     - `V2StandardDrawer.mobile-panels.tsx`: Bố cục cột và tabs trên Mobile (< 75 LoC) tích hợp sub tabs, main content, stacked right panel và related deck.
     - `V2StandardDrawer.mobile.tsx`: Fullscreen Bottom Sheet (< 145 LoC, Grab Handle, Slide-up, Vertical Card Cascading Stack).
     - `V2StandardDrawer.state-guard.tsx`: Trình bao bọc trạng thái Loading spinner và Error banner tập trung (< 50 LoC) dùng chung cho cả Desktop và Mobile.
     - `V2StandardDrawer.confirm-modal.tsx`: Modal xác nhận đóng Drawer khi form bẩn / dirty state (< 40 LoC).
     - `V2StandardDrawer.hook.ts`: Hook quản lý state tabs, fullscreen, right panel collapse, scroll detection, confirm close, multi-drawer stack coordination và phím tắt `Esc` 2 tầng (< 178 LoC).
     - `v2DrawerStack.ts`: Module Stack Manager & hook `useV2DrawerStack` độc lập React tree, điều phối `depth`, `zIndex`, `isTopmost`, `isUnderlying`, `desktopShiftPx` (-20px) và `mobileTopOffsetPx` (+16px).
     - `v2TabControl.ts`: Hook đồng bộ tab controlled/uncontrolled (< 25 LoC).
     - `V2StandardDrawer.mock.tsx`: Mock data & components chuẩn vàng phục vụ Storybook và mô phỏng hóa đơn/chứng từ.
     - `V2StandardDrawer.stories.tsx`: Storybook stories minh họa trực quan (Single Column, Hóa đơn GSM, Tab switching & Right panel collapse animation).
     - `V2StandardDrawer.test.tsx`: 15 test cases Vitest co-located phủ 100% desktop/mobile/fullscreen/confirm-modal/tabs/multi-drawer stacking/Esc priority.
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

## 2.1. Quy Chuẩn Xếp Tầng Multi-Drawer (Cascading Stack)

1. **Desktop ($\ge 1024px$)**:
   - Khoảng cách từ mép màn hình phải đến Drawer đầu tiên là `20px` (`md:right-5`).
   - Mỗi Drawer mở sau (`depth = 1, 2...`) tự động lùi sang trái đúng bằng khoảng cách này:
     `transform: translateX(-20px * depth)`.
   - Kết quả thị giác: Mép phải lộ ra đúng dải 20px của Drawer cha bên dưới, đồng nhất tuyệt đối với khoảng cách 20px từ mép màn hình đến Drawer đầu tiên.
   - `zIndex = 50 + depth * 10`, `overlayZIndex = zIndex - 1` đảm bảo Drawer con luôn nổi trên Drawer cha.

2. **Mobile Screen ($< 1024px$)**:
   - Áp dụng cơ chế **Vertical Card Cascading (Xếp tầng dọc từ dưới lên tương tự iOS Modal / Vaul)**:
   - Drawer cha bên dưới khi có Drawer con mở đè lên sẽ tự động thu nhỏ nhẹ và mờ dịu: `scale-[0.97] opacity-85 origin-bottom transition-all duration-300 ease-out`.
   - Drawer con mở từ dưới lên, mép trên hạ xuống `16px * depth`:
     `top: calc(env(safe-area-inset-top, 0px) + 16px * depth)`
     `height: calc(100dvh - env(safe-area-inset-top, 0px) - 16px * depth)`
     `rounded-t-2xl shadow-[0_-12px_32px_rgba(15,23,42,0.28)]`.
   - Đỉnh và Grab Handle của Drawer cha ló ra 16px ở trên cùng màn hình, giúp người dùng nhận biết trực quan mình đang ở cấp con.

3. **Esc Key & Click Outside Priority Guard**:
   - Chỉ duy nhất Drawer đang hiển thị ở trên cùng (`isTopmost === true`) mới lắng nghe sự kiện phím `Escape` và click outside overlay.
   - Bấm `Escape` lần 1 chỉ đóng Drawer con trên cùng, phục hồi Drawer cha nguyên vẹn.

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

  // Content Panels
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children?: V2DrawerChildren; // Hỗ trợ cả ReactNode và Render Props (context) => ReactNode

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

  // Multi-Drawer Stacking Controls
  id?: string; // Định danh drawer trong stack, tự sinh ngẫu nhiên nếu không truyền
  stackOffsetPx?: number; // Bước dịch lùi Desktop (mặc định 20px) hoặc hạ đỉnh Mobile (mặc định 16px)
  disableStackOffset?: boolean; // Tắt hiệu ứng dịch lùi/hạ đỉnh nếu muốn đè phẳng hoàn toàn

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
- [x] Hợp nhất thanh TabBar: `V2TabBar` tại `src/v2/shared/components/molecules/v2-tab-bar/` hỗ trợ 4 variants: `header`, `sub`, `button-group`, `app` và prop `extra`.
- [x] Sliding Pill Indicator: Hook `useSlidingTabIndicator` cung cấp animation lướt trượt êm ái cho cả Header tabs và Sub tabs.
- [x] Platform Split cho TabBarPillView: Tách `TabBarPillView.desktop.tsx` và `TabBarPillView.mobile.tsx` với router mỏng `TabBarPillView.tsx` (< 20 LoC) dùng `useViewport()`.
- [x] Hệ Thống Global Scrollbar V2 Độc Lập: `src/v2/shared/styles/v2-scrollbar.css` mỏng 5px, rãnh trong suốt, bo tròn con nhộng, triệt tiêu 100% nút mũi tên thô nhọn `◀ ▶` cho toàn bộ V2 (Storybook & V2 App), giữ nguyên bản 100% cho V1.
- [x] Floating Card: 4 góc bo cong `rounded-2xl`, viền 4 cạnh `border border-border/80`, cách mép màn hình `top-2.5 right-4 bottom-4 md:right-5 md:bottom-4.5`.
- [x] Slide animation êm mượt: Sử dụng `cubic-bezier(0.16, 1, 0.3, 1)` với Tailwind keyframes `slide-in-from-right` và `slide-in-from-bottom`.
- [x] 2 Khối Card Kính Độc Lập: Cột trái và cột phải nằm trên canvas với `gap-4 lg:gap-6`, không dùng đường kẻ dọc `border-l` cứng nhắc.
- [x] Khống chế kích thước file: 100% file thành phần đều `< 178 LoC` (tuân thủ /ui-atomic-refactor < 180 LoC).
- [x] Tuân thủ No Blue Mandate: Không dùng class màu `blue-*`.
- [x] Phím tắt `Esc` 2 tầng: Esc lần 1 thu nhỏ toàn màn hình, Esc lần 2 đóng drawer (hỏi confirm nếu đang edit).
- [x] Multi-Drawer Stacking Store: `v2DrawerStack.ts` quản lý active stack cross-tree qua `useSyncExternalStore`, tự động cấp phát `zIndex = 50 + depth * 10`, `depth`, `isTopmost`, `isUnderlying`.
- [x] Desktop Cascading Shift: Drawer con lùi sang trái `translateX(-20px * depth)` tạo hiệu ứng xếp lớp thẻ bài 3D, mép phải lộ dải thẻ 20px hòa hợp với `md:right-5`.
- [x] Mobile Vertical Stack: Drawer con hạ đỉnh `16px * depth` kết hợp hiệu ứng `scale-[0.97]` và dim overlay làm mờ cho drawer cha bên dưới, tránh cắt xén mép ngang.
- [x] Priority Guard: Phím `Escape` và click outside overlay chỉ áp dụng cho duy nhất drawer trên cùng (`isTopmost === true`), không đóng drawer cha bên dưới.
- [x] 100% unit tests Vitest co-located pass (bao gồm 5 unit tests stack + 4 integration tests multi-drawer) và Storybook stories mô phỏng đầy đủ.



## Component dùng chung trong V2StandardDrawer

- Vỏ Sheet của cả desktop và mobile dùng molecule `V2DrawerSheet` (Esc và bấm nền đi qua `onRequestClose`, có tiêu đề sr-only).
- Trạng thái loading dùng atom `V2Spinner`; lỗi dùng molecule `V2AlertBanner` (`role="alert"`).
- Vạch kéo trên bottom sheet mobile dùng atom `V2GrabHandle`.
- Khối bố cục dùng `V2Stack` (có `shrink-0` khi nằm trong vùng cuộn `flex-col`, vì `V2Stack` có `min-h-0`); vạch ngăn trong panel mobile dùng `V2Divider`.

## DrawerSection (molecule) — đủ chuẩn

- Thu gọn/mở rộng giống DrawerSection V1: nội dung luôn nằm trong DOM, animate `grid-template-rows` và `opacity` (300ms). Khi thu gọn: `aria-hidden` và `inert` để không focus/tương tác được.
- Chỉ bấm nút mũi tên mới đổi trạng thái; nút có `aria-expanded`, `aria-controls` (id của vùng nội dung) và nhãn i18n (`v2.drawer.expandSection` / `v2.drawer.collapseSection`).
- Prop `count` hiển thị `(N)` cạnh tiêu đề (ví dụ số dòng bảng).
- Có story trong Storybook: `Components/Molecules/Overlay & Menu/V2DrawerSection`.

## Bổ sung: nhúng bảng, xem trước tệp, xếp tầng

- Bảng nhúng: `DrawerSection fitViewportHeight bodyClassName="flex flex-col overflow-hidden"` bao `V2StandardTable` (story `WithEmbeddedTable`). Không có `bodyClassName` thì thanh phân trang bị cắt và header không dính.
- Panel phải xem trước hóa đơn/chứng từ: `V2FilePreviewPanel` (organism `v2-file-preview-panel`), module tải tệp rồi truyền `url` hoặc `text`.
- Xếp tầng nhiều drawer được điều phối bằng `id` của drawer; trạng thái mở nên lấy từ `useV2OverlayState` để link/Back/tải lại giữ đúng chồng. Mẫu: `templates/v2-module-page/invoice-shape/` (drawer chi tiết + drawer hạch toán). Xem `v2-foundation`.

