---
name: v2-drawer
description: Module tri thức Chuẩn Hóa Drawer V2 (V2StandardFormDrawer) theo kiến trúc ERP Web v2 (Dual-Run /v2/, Atomic Design 5 tầng, Platform Split Desktop/Mobile, < 180 LoC, No Blue Mandate, 100% i18n, Co-located Vitest testing & Storybook) trong erp-web (src/v2/shared/components/organisms/v2-standard-form-drawer và src/v2/shared/ui/sheet).
---

# 📋 Module Tri Thức: Chuẩn Hóa Drawer V2 (`V2StandardFormDrawer`) - Frontend (`erp-web`)

## 1. Tổng Quan Kiến Trúc & Trách Nhiệm Hệ Thống

`V2StandardFormDrawer` là component Drawer/Ngăn kéo chuẩn mực thế hệ mới của hệ thống **Liouni ERP Web V2**, được thiết kế nhằm thay thế và nâng cấp toàn diện component V1 (`StandardFormDrawer`) theo các tiêu chuẩn kỹ thuật nghiêm ngặt:

1. **Atomic Design 5 Tầng Phân Minh**:
   - **L1 (UI Primitives)**: `src/v2/shared/ui/sheet/` xây dựng trên nền tảng `@radix-ui/react-dialog` với 4 hướng mở (`right`, `bottom`, `left`, `top`), hiệu ứng trượt êm mượt và kính mờ `backdrop-blur`.
   - **L2 (Molecules)**: Các thành phần con độc lập:
     - `<DrawerSection>`: Phân vùng nội dung kính mờ `backdrop-blur-[12px]`, cơ chế **Collapsible Arrow-Only** (chỉ thu gọn khi click đúng vào icon mũi tên `ChevronDown`, không bắt sự kiện trên toàn header), `fitViewportHeight` (`lg:max-h-[calc(100vh-210px)]` trên desktop, `max-h-none` trên mobile), và hỗ trợ `hideHeader`/`hideTitle`.
     - `<DrawerField>`: Trường nhập liệu kèm nhãn, dấu `*` đỏ khi bắt buộc, helper text và thông báo lỗi.
     - `<DrawerRow>`: Cặp key-value tinh tế cho chế độ xem (View Mode), tích hợp nút copy nhanh giá trị.
     - `<DrawerTopTabBar>`: Dải tabs điều hướng trên đỉnh ngay dưới Header, hỗ trợ cuộn cảm ứng `touch-pan-x` trên mobile, `badgeCount`, icon và không dùng màu blue.
     - `<DrawerAuditTimeline>`: Lịch sử thao tác dạng trục dọc (`spine`) liên tục, node tròn (`w-6 h-6`), và dotted horizontal connector, không lồng viền card nặng nề.
     - `<DrawerHeader>`: Thanh tiêu đề tích hợp nút Chỉnh sửa (`onToggleEdit`), Toàn màn hình (`Maximize2`), Thu gọn/Mở rộng Cột phải (`ChevronRight`), và nút Đóng `X`.
     - `<DrawerFooter>`: Chân trang cố định (sticky), hỗ trợ `safe-area-inset-bottom`, tự động wrap nút trên mobile và hỗ trợ các variants (primary, secondary, danger, outline).
   - **L3 (Organisms)**: `src/v2/shared/components/organisms/v2-standard-form-drawer/`:
     - `V2StandardFormDrawer.tsx`: Switcher thuần túy (< 15 LoC) sử dụng `useViewport()`.
     - `V2StandardFormDrawer.desktop.tsx`: Right slide-over panel theo tỷ lệ `vw`.
     - `V2StandardFormDrawer.mobile.tsx`: Fullscreen Bottom Sheet (`100vw`, `100dvh`, Grab Handle).
     - `V2StandardFormDrawer.hook.ts`: Hook quản lý state tabs, fullscreen, right panel collapse, confirm close và phím tắt `Esc` 2 tầng.
2. **Platform Split (Desktop vs Mobile)**:
   - **Desktop ($\ge 1024px$)**: Slide-over trượt từ bên phải với kích thước `vw` co giãn linh hoạt (`sm`, `md`, `lg`, `xl`, `full`) và bị chặn cứng bởi `max-w-[calc(100vw-208px)]` (bảo đảm **không bao giờ che khuất Sidebar** bên trái).
   - **Mobile & Tablet ($< 1024px$)**: Chuyển đổi mượt mà sang Fullscreen Bottom Sheet chiếm `100vw` và `100dvh`, có thanh kéo Grab Handle ở đỉnh, tự động bù padding cho tai thỏ (`env(safe-area-inset-top)`) và thanh gạt Home (`env(safe-area-inset-bottom)`), các nút footer tự động xuống dòng và cột phải được xếp dọc tự nhiên dưới cột trái.
3. **No Blue Mandate & 100% i18n**:
   - Tuyệt đối không dùng bất kỳ class `blue-*` nào. Toàn bộ màu sắc dùng neutral tokens, brand `primary`, semantic `emerald-*` (thành công), `amber-*` (tiến trình/cảnh báo) và `destructive` (lỗi/hủy).
   - Đa ngôn ngữ 100% qua từ điển `v2.drawer.*` trong `src/v2/shared/locales/` (`vi.ts`, `en.ts`).
4. **Kiểm Soát Kích Thước File Cứng (< 180 LoC)**:
   - 100% files thành phần đều nằm dưới 175 dòng, tuân thủ nguyên tắc Single Responsibility.

---

## 2. Quy Chuẩn Kích Thước Responsive theo `vw` (Desktop $\ge 1024px$)

| Size Preset | Responsive Width theo `vw` | Min Width | Max Width | Mục đích sử dụng thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **`sm`** | `lg:w-[42vw] xl:w-[38vw] 2xl:w-[32vw]` | `420px` | `660px` | Form đơn giản 1 cột: Profile, Đổi mật khẩu, Gán nhãn tags |
| **`md`** | `lg:w-[60vw] xl:w-[54vw] 2xl:w-[48vw]` | `620px` | `980px` | Form 1 cột trung bình: Master data, Cấu hình danh mục kho |
| **`lg`** | `lg:w-[78vw] xl:w-[74vw] 2xl:w-[68vw]` | `840px` | `1380px` | Form 2 cột vừa phải: Đối tác, Khách hàng Garage |
| **`xl`** | `lg:w-[93vw] xl:w-[90vw] 2xl:w-[88vw]` | `1020px` | `1780px` | Chứng từ đa góc nhìn (~90vw): Hóa đơn ERP, Phiếu kho, PO, SO, Lệnh SX |
| **`full`** | `lg:w-[calc(100vw-208px)]` | `1020px` | `calc(100vw-208px)` | Toàn màn hình (không che Sidebar): Traceability Graph, Báo cáo lớn |

---

## 3. Public API Contract (`V2StandardFormDrawerProps`)

```typescript
import type { DrawerTopTabItem, DrawerAction, V2DrawerSize, V2DrawerMode, V2DrawerLayout } from "@/v2/shared/components/organisms/v2-standard-form-drawer";

export interface V2StandardFormDrawerProps {
  open: boolean;
  mode?: V2DrawerMode; // "view" | "edit" (default: "view")
  onClose: () => void;
  onToggleEdit?: () => void; // Hiển thị nút bút chì góc trên bên phải khi ở mode view

  title: string;
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

  // Top Tabs cho chứng từ đa góc nhìn
  tabs?: DrawerTopTabItem[];
  activeTabKey?: string;
  defaultTabKey?: string;
  onTabChange?: (tabKey: string) => void;

  // Nội dung
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children?: React.ReactNode;

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

### Ví dụ 2: Chứng Từ 2 Cột với Cột Phải Thu Gọn Được (`size="xl"`)

```tsx
import { V2StandardFormDrawer, DrawerSection, DrawerRow } from "@/v2/shared/components/organisms/v2-standard-form-drawer";
import { Badge } from "@/v2/shared/ui/badge";

export function WarehouseVoucherDrawer({ open, onClose, voucherData }) {
  return (
    <V2StandardFormDrawer
      open={open}
      onClose={onClose}
      layout="2-columns"
      size="xl"
      title={`Phiếu Nhập Kho: ${voucherData.code}`}
      titleExtra={<Badge variant="default">{voucherData.statusName}</Badge>}
      subtitle={`Chi nhánh: ${voucherData.branchName}`}
      actions={[
        { label: "Hủy phiếu", onClick: handleCancel, variant: "danger", align: "left" },
        { label: "Đóng", onClick: onClose, variant: "secondary" },
        { label: "Xác nhận nhập kho", onClick: handleConfirm, primary: true },
      ]}
      leftPanel={
        <div className="space-y-3">
          <DrawerSection title={`Danh Sách Mặt Hàng (${voucherData.lines.length})`}>
            {/* Embedded DataTable */}
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="space-y-3">
          <DrawerSection title="Thông Tin Chung">
            <DrawerRow label="Mã Phiếu" value={voucherData.code} copyable />
            <DrawerRow label="Ngày Nhập" value={voucherData.date} />
            <DrawerRow label="Nhà Cung Cấp" value={voucherData.supplierName} />
          </DrawerSection>
        </div>
      }
    />
  );
}
```

### Ví dụ 3: Chứng Từ Đa Góc Nhìn với Top Navigation Tabs (`tabs`)

```tsx
import { V2StandardFormDrawer, DrawerSection, DrawerAuditTimeline, type DrawerTopTabItem } from "@/v2/shared/components/organisms/v2-standard-form-drawer";
import { FileText, Wallet, Network, History } from "lucide-react";

export function ErpInvoiceDrawer({ open, onClose, invoice }) {
  const tabs: DrawerTopTabItem[] = [
    {
      key: "details",
      label: "Chi Tiết Hóa Đơn",
      icon: <FileText className="w-3.5 h-3.5" />,
      content: <InvoiceMainDetailSection invoice={invoice} />,
    },
    {
      key: "financials",
      label: "Tài Chính & Cấn Trừ",
      icon: <Wallet className="w-3.5 h-3.5" />,
      badgeCount: invoice.settlementsCount,
      content: <InvoiceFinancialSection invoice={invoice} />,
    },
    {
      key: "traceability",
      label: "Chứng Từ Liên Kết",
      icon: <Network className="w-3.5 h-3.5" />,
      hideRightPanel: true, // Bung 100% chiều rộng cho Canvas Graph
      content: <InvoiceTraceabilityGraph rootId={invoice.id} />,
    },
    {
      key: "history",
      label: "Lịch Sử Thao Tác",
      icon: <History className="w-3.5 h-3.5" />,
      badgeCount: invoice.auditLogs.length,
      content: (
        <DrawerSection title="Nhật Ký Kiểm Toán">
          <DrawerAuditTimeline items={invoice.auditLogs} />
        </DrawerSection>
      ),
    },
  ];

  return (
    <V2StandardFormDrawer
      open={open}
      onClose={onClose}
      layout="2-columns"
      size="xl"
      title={`Hóa Đơn: ${invoice.invoiceNumber}`}
      tabs={tabs}
      rightPanel={<InvoiceRightPanel invoice={invoice} />}
    />
  );
}
```

---

## 5. Danh Mục Kiểm Tra Chất Lượng (Quality Gate Checklist)

- [x] Sử dụng đúng `V2StandardFormDrawer` từ `@/v2/shared/components/organisms/v2-standard-form-drawer`.
- [x] Áp dụng Platform Split tự động: Desktop mở từ phải theo `vw`, Mobile mở Bottom Sheet `100dvh` kèm Grab Handle.
- [x] Khống chế kích thước file: 100% file thành phần đều `< 180 LoC`.
- [x] Tuân thủ No Blue Mandate: Không dùng class màu `blue-*`, chỉ dùng tokens neutral, brand primary và semantic HSL.
- [x] Phím tắt `Esc` 2 tầng: Esc lần 1 thu nhỏ toàn màn hình, Esc lần 2 đóng drawer (có hỏi confirm nếu đang edit).
- [x] `DrawerSection` áp dụng cơ chế Arrow-Only click (không bắt sự kiện thu gọn trên toàn thanh tiêu đề).
- [x] Đầy đủ bộ unit tests Vitest co-located và Storybook stories cho các biến thể.
