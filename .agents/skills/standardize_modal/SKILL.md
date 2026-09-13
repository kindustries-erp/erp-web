---
name: standardize-modal
description: Create or implement a Modal component following the ERP standard (shadcn Dialog, glassmorphism, size variants, keyboard/focus management, i18n). Use this skill whenever generating or updating any modal dialog in the system.
---

# 📋 Modal Standards

> ⚡ **FAST-TRACK (PlopJS Generator)**: Để sinh nhanh component Modal / Dialog chuẩn (`form` hoặc `confirm`), chạy:
> ```bash
> bun plop modal <moduleName> <componentName> <modalType> <modalSize>
> ```
> *(Chi tiết tại skill `plop-generate`)*

Khi tạo mới hoặc chỉnh sửa bất kỳ Modal nào trong hệ thống, bạn **BẮT BUỘC** phải sử dụng component `<Dialog>` từ `@/shared/components/ui/Dialog` (được xây dựng trên nền Radix UI Dialog và shadcn standard) kết hợp với các hiệu ứng **glass / blur** nhất quán.

---

## 1. Thành phần cơ bản của Dialog (`@/shared/components/ui/Dialog`)

Project đã cung cấp sẵn bộ component `Dialog` chuẩn:
- `<Dialog open={open} onOpenChange={onOpenChange}>`: Root controller quản lý open/close.
- `<DialogTrigger>`: Nút kích hoạt mở modal (nếu dùng uncontrolled).
- `<DialogContent>`: Hộp nội dung modal — đã tích hợp sẵn glassmorphism (`bg-surface/80`, `backdrop-blur-xl`, border tinh tế, shadow-2xl, auto portal, auto scroll lock, focus trap, và ESC handling).
- `<DialogHeader>`, `<DialogFooter>`: Cụm tiêu đề và cụm nút hành động.
- `<DialogTitle>`, `<DialogDescription>`: Tiêu đề và mô tả có hỗ trợ accessibility (ARIA).
- `<DialogClose>`: Nút đóng modal.

---

## 2. Visual Standard — Glass & Surface Tokens

Mọi modal trong hệ thống đều thừa hưởng hoặc tùy biến dựa trên tokens sau (đồng bộ chuẩn với các popup/popover trong hệ thống):

### Overlay (nền mờ nhẹ nhàng + blur nhẹ)
Được tích hợp sẵn trong `<DialogContent>`, áp dụng:
`bg-slate-900/20 backdrop-blur-[2px]`

### Modal Box (hộp kính chuẩn popup-content)
Được cấu hình sẵn trong `<DialogContent>`:
```tsx
className={cn(
  "rounded-2xl border border-border bg-surface popup-content",
  "shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22),0_4px_16px_rgba(15,23,42,0.08)] duration-150",
)}
```

---

## 2.1. 🎨 Quy Tắc Bảng Màu & Tuyệt Đối Cấm Màu Xanh Dương (No Blue Mandate)

> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG SỬ DỤNG MÀU XANH DƯƠNG (`blue-*`, `bg-blue-*`, `text-blue-*`, `border-blue-*`)** trong toàn bộ giao diện Modal / Confirm Modal (Text, Badges, Dots, Cards, Buttons).
> 
> **Thay thế bằng hệ màu chuẩn:**
> 1. **Neutral Palette (Mặc định)**: Dùng `foreground`, `muted`, `muted-foreground`, `border`, `slate-*`, `zinc-*`, `neutral-*` cho thông tin chung, nhãn ghi chú, metadata, danh sách cập nhật.
> 2. **Brand Primary**: Dùng `primary`, `bg-primary`, `text-primary` cho nút hành động chính.
> 3. **Semantic Colors**:
>    - **Thành công / Hoàn thành**: Dùng `emerald-*` (`bg-emerald-50 text-emerald-700 border-emerald-200`).
>    - **Cảnh báo / Tiến trình / Nhắc nhở**: Dùng `amber-*` hoặc `neutral / muted` (`bg-amber-50 text-amber-800 border-amber-200` hoặc `bg-muted text-foreground border-border`).
>    - **Lỗi / Hủy / Nguy hiểm**: Dùng `destructive` / `red-*` (`bg-destructive/10 text-destructive border-destructive/20`).

---

## 3. Size Variants & Positioning

| Variant | Class | Dùng khi |
|---------|-------|----------|
| `sm` | `max-w-[360px]` | Confirm dialog, Alert đơn giản |
| `md` | `max-w-[480px]` (default) | Form nhỏ, Input dialog |
| `lg` | `max-w-[560px]` | Search modal, Command palette, Form vừa |
| `xl` | `max-w-[680px]` | Form phức tạp, Bảng danh mục |

### Vị trí căn chỉnh:
- **Default (Center Screen)**: `<DialogContent className="max-w-[480px]">` (tự động căn giữa màn hình cả ngang lẫn dọc).
- **Top Aligned (Command Palette / Search Modal)**:
```tsx
<DialogContent className="top-[15vh] translate-y-0 max-w-[560px] p-0 overflow-hidden" hideCloseButton>
```

---

## 4. Keyboard & Focus Management

- **Esc to Close**: `<Dialog>` tự động xử lý đóng khi nhấn phím `Escape`.
- **Focus Management**: `<Dialog>` tự động trap focus và auto-focus vào input đầu tiên (hoặc có thể dùng `ref.current?.focus()` trong `useEffect` khi modal mở).
- **Global Shortcut (`Ctrl/Cmd + K`)**: Dành riêng cho Command Palette / Universal Search, đăng ký listener tại root layout/topbar.

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

## 5. Đa ngôn ngữ (i18n Mandate)

Tất cả tiêu đề, mô tả, placeholder, nút bấm và nhãn trạng thái **BẮT BUỘC** sử dụng hàm `t(...)` từ `useT()` / `useTranslation()`.

```tsx
import { useT } from "@/core/i18n";

const t = useT();

<DialogTitle>{t("common.confirm")}</DialogTitle>
<DialogDescription>{t("common.confirmDesc")}</DialogDescription>
```

---

## 6. Mẫu code chuẩn: Universal Search Modal (Command Palette Style)

```tsx
import { useEffect, useRef, useCallback } from "react";
import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/Dialog";
import { Search } from "lucide-react";

interface UniversalSearchModalProps {
  open: boolean;
  onClose: () => void;
  navTo: (p: PageKey) => void;
}

export function UniversalSearchModal({
  open,
  onClose,
  navTo,
}: UniversalSearchModalProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        hideCloseButton
        className={cn(
          "top-[15vh] translate-y-0 p-0 max-w-[560px] overflow-hidden",
          "border border-white/10 dark:border-white/5",
          "bg-surface/85 dark:bg-surface/80 backdrop-blur-xl backdrop-saturate-150",
          "shadow-2xl shadow-black/25",
        )}
      >
        <DialogTitle className="sr-only">
          {t("nav.universalSearch.placeholder")}
        </DialogTitle>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-4 h-4 text-[color:var(--muted-fg)] flex-shrink-0" />
          <input
            ref={inputRef}
            placeholder={t("nav.universalSearch.placeholder")}
            className="flex-1 bg-transparent outline-none text-sm text-foreground"
          />
          <kbd className="text-[10px] text-[color:var(--faint)] border border-border/80 rounded px-1.5 py-0.5 font-mono">
            Esc
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-0.5">
          {/* list items */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. Mẫu code chuẩn: Standard Form/Action Modal

```tsx
import { useT } from "@/core/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";

interface MyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MyModal({ open, onClose, onConfirm }: MyModalProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("module.modalTitle")}</DialogTitle>
          <DialogDescription>{t("module.modalSubtitle")}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Modal Form / Content */}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 8. Mẫu code chuẩn: Standard Confirm Modal (Close Confirm & Action Confirm Pattern)

Khi cần hiển thị hộp thoại xác nhận (Confirm/Alert như xác nhận xóa, xác nhận đóng Drawer/Form, xác nhận hoàn thành đợt, chuyển trạng thái):
- **Ưu tiên sử dụng component tái sử dụng `<ConfirmModal>`** từ `@/shared/components/ConfirmModal`.
- **Nguyên tắc thiết kế**: Tối giản, thanh lịch (`max-w-[380px] p-6`), không lồng các khung card/bảng quá phức tạp bên trong hộp thoại xác nhận.
- **Tiêu đề & Nội dung**: `DialogTitle` rõ ràng (`text-sm font-semibold`), `DialogDescription` ngắn gọn, súc tích (`text-xs leading-relaxed`).
- **Cụm nút hành động chuẩn**:
  - Nút Hủy: `variant="secondary" size="md"`
  - Nút Xác nhận: `variant="primary"` (hoặc `variant="danger"` cho thao tác hủy/xóa nguy hiểm), `size="md" className="min-w-[100px]"` kèm spinner xoay khi loading.

### Cách sử dụng `<ConfirmModal>`:
```tsx
import { useState } from "react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useT } from "@/core/i18n";

export function ExampleConfirmUsage() {
  const t = useT();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await executeAction();
      setOpenConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModal
      open={openConfirm}
      title={t("Xác nhận hoàn thành & Nhập kho")}
      message={
        <div className="space-y-2 text-xs leading-relaxed">
          <p>
            {t("Bạn có chắc chắn muốn xác nhận hoàn thành và nhập kho")}{" "}
            <strong className="font-bold text-foreground font-mono">
              {validCount}
            </strong>{" "}
            {t("đơn vị cho Lệnh sản xuất")}{" "}
            <strong className="font-mono font-semibold text-foreground">
              {orderRef}
            </strong>
            ?
          </p>
          {incompleteCount > 0 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {t("Lưu ý: Có")} {incompleteCount}{" "}
              {t("dòng chưa điền đủ thông tin sẽ được bỏ qua.")}
            </p>
          )}
        </div>
      }
      confirmLabel={t("Đồng ý nhập kho")}
      cancelLabel={t("Hủy")}
      danger={false}
      loading={loading}
      onConfirm={handleConfirm}
      onCancel={() => setOpenConfirm(false)}
    />
  );
}
```

---

## Summary Checklist trước khi hoàn thành:

- [ ] Modal sử dụng `<Dialog>` và `<DialogContent>` từ `@/shared/components/ui/Dialog` hoặc `<ConfirmModal>` từ `@/shared/components/ConfirmModal`?
- [ ] Modal content có hiệu ứng glassmorphism (`backdrop-blur-xl`, `bg-surface/80`) chưa?
- [ ] Size variant (`max-w-[380px]` cho confirm/close alert, `max-w-[480px]` cho form, `max-w-[560px]` cho search/command) phù hợp use-case chưa?
- [ ] Với Confirm Modal: thiết kế tối giản, sạch sẽ, không đóng khung/card lồng phức tạp bên trong hộp thoại?
- [ ] Có `<DialogTitle>` (hoặc `<DialogTitle className="sr-only">`) để đảm bảo accessibility (ARIA) chưa?
- [ ] Phím `Esc` và click outside overlay hoạt động bình thường chưa?
- [ ] Scroll lock tự động hoạt động khi mở modal chưa?
- [ ] Nếu là Command Palette: sử dụng layout `top-[15vh] translate-y-0`, `hideCloseButton`, và đăng ký global shortcut `⌘K` / `Ctrl+K` ở parent layout chưa?
- [ ] Tất cả text tĩnh đều được bọc qua `t(...)` đa ngôn ngữ (i18n) chưa?

