---
name: standardize-drawer
description: Create or enhance a Drawer component using StandardFormDrawer to follow standard UI rules in the ERP project (1-column vs 2-columns layout, DrawerSection, DrawerField, etc.). Use this skill whenever generating or updating drawers.
---

# 📋 Drawer Standards

Khi tạo mới hoặc chỉnh sửa Drawer trong hệ thống, bạn **BẮT BUỘC** phải sử dụng component `<StandardFormDrawer>` từ `@/shared/components/StandardFormDrawer` kết hợp với các UI elements chuẩn như `<DrawerSection>`, `<DrawerRow>`, `<DrawerField>`.

## 1. Các thuộc tính bắt buộc của StandardFormDrawer

- `open`: boolean để mở/đóng.
- `mode`: `"view"` hoặc `"edit"`.
- `onClose`: Hàm đóng drawer.
- `onToggleEdit`: (Tùy chọn) Hàm chuyển sang chế độ edit nếu ở chế độ view.
- `title`, `subtitle`: Tiêu đề chính và phụ.
- `actions`: Mảng các nút bấm (Save, Cancel, Close...).
- `confirmOnClose`: Bật `true` nếu đang ở mode `edit` để tránh user vô tình đóng mất data đang nhập.
- `leftPanel`: Nội dung chính của Drawer.

## 2. Quy tắc cho 1-Column Drawer (Profile, Cấu hình đơn giản)

Dành cho các form đơn giản (như Company Profile, User Profile):

- Bắt buộc set `layout="1-column"`.
- Bắt buộc set `size="sm"` (hoặc `"md"` nếu form hơi dài/nhiều text).
- Toàn bộ nội dung được truyền vào prop `leftPanel`.
- Không sử dụng `rightPanel`.

**Mẫu code 1-Column Drawer**:

```tsx
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";

export function UserProfileDrawer({ open, onClose, mode, setMode }) {
  const actions =
    mode === "edit"
      ? [
          { label: "Lưu", primary: true, onClick: onSave },
          { label: "Hủy", onClick: onCancel },
        ]
      : [{ label: "Đóng", onClick: onClose }];

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      title="Hồ sơ người dùng"
      layout="1-column"
      size="sm"
      confirmOnClose={mode === "edit"}
      actions={actions}
      leftPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection title="Thông tin chung">
            <DrawerField label="Họ tên">
              <input className={inputCls} />
            </DrawerField>
            <DrawerField label="Email">
              <input className={inputCls} />
            </DrawerField>
          </DrawerSection>
        </div>
      }
    />
  );
}
```

## 3. Quy tắc cho 2-Columns Drawer (Chứng từ, Phiếu nhập xuất, Hóa đơn)

Dành cho các màn hình nghiệp vụ phức tạp có chứng từ (như Hóa đơn ERP, Phiếu nhập xuất kho):

- Bắt buộc set `layout="2-columns"`.
- Bắt buộc set `size="xl"` (hoặc `"lg"` nếu form vừa phải).
- Nên truyền `collapsibleRightPanel={true}` để user có thể ẩn/hiện cột bên phải (nếu áp dụng).
- **`leftPanel`**: Chứa thông tin chi tiết chứng từ (ví dụ: Thông tin chung, Bảng danh sách hàng hóa/dịch vụ).
- **`rightPanel`**: Chứa các thông tin meta, trạng thái, tham chiếu, file đính kèm (Metadata, Status, Logs).

**Mẫu code 2-Columns Drawer**:

```tsx
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";

export function VoucherDrawer({ open, onClose, mode }) {
  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      title="Phiếu nhập kho: PNK-001"
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      actions={[{ label: "Đóng", onClick: onClose }]}
      leftPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection title="Thông tin chung">
            <DrawerField label="Nhà cung cấp">...</DrawerField>
          </DrawerSection>
          <DrawerSection title="Hàng hóa">
            {/* Table hàng hóa ở đây */}
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection title="Trạng thái">
            <DrawerField label="Ngày tạo">10/10/2026</DrawerField>
            <DrawerField label="Người tạo">Admin</DrawerField>
          </DrawerSection>
          <DrawerSection title="Chứng từ liên quan">
            {/* Danh sách link đính kèm */}
          </DrawerSection>
        </div>
      }
    />
  );
}
```

## Summary Checklist trước khi hoàn thành:

- [ ] Drawer đã sử dụng `<StandardFormDrawer>` chưa?
- [ ] Drawer đơn giản (1 cột) đã set `layout="1-column"` và `size="sm"`/`"md"` chưa?
- [ ] Drawer chứng từ (2 cột) đã set `layout="2-columns"` và `size="xl"`/`"lg"` chưa?
- [ ] Phần nội dung bên trong đã dùng các khối chuẩn như `<DrawerSection>`, `<DrawerField>` để bao bọc các input chưa?
- [ ] Input đã sử dụng CSS class `inputCls` từ `@/shared/components/DrawerModal` (nếu có) chưa?
- [ ] Chức năng cảnh báo đóng Drawer khi đang Edit (`confirmOnClose={mode === 'edit'}`) đã được cấu hình đúng chưa?
