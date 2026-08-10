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
- **`onToggleEdit`**: **Bắt buộc** nếu Drawer hỗ trợ cập nhật dữ liệu. Phải truyền hàm chuyển sang chế độ edit (ví dụ: `() => setMode("edit")`) để hiển thị icon Edit góc trên bên phải.
- `title`, `subtitle`: Tiêu đề chính và phụ.
- **`titleExtra`**: Nếu dữ liệu có trạng thái (status/state), **bắt buộc** dùng `titleExtra` truyền vào component `<Badge>` (từ `@/shared/components/ui/badge`) để hiển thị kế bên tiêu đề.
- `actions`: Mảng các nút bấm (Save, Cancel, Close...).
- `confirmOnClose`: Bật `true` nếu đang ở mode `edit` để tránh user vô tình đóng mất data đang nhập.
- `leftPanel`: Nội dung chính của Drawer.
- **Đa ngôn ngữ (i18n)**: Tất cả text (title, label, placeholder, button...) **bắt buộc** dùng `t(...)` từ `useTranslation("namespace")`.

## 2. Quy tắc cho 1-Column Drawer (Profile, Cấu hình đơn giản)

Dành cho các form đơn giản (như Company Profile, User Profile):

- Bắt buộc set `layout="1-column"`.
- Bắt buộc set `size="sm"` (hoặc `"md"` nếu form hơi dài/nhiều text).
- Toàn bộ nội dung được truyền vào prop `leftPanel`.
- Không sử dụng `rightPanel`.

**Mẫu code 1-Column Drawer**:

```tsx
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { useTranslation } from "react-i18next";

export function UserProfileDrawer({ open, onClose, mode, setMode, data }) {
  const { t } = useTranslation("users");

  const actions =
    mode === "edit"
      ? [
          { label: t("Hủy", "Cancel"), onClick: onCancel },
          { label: t("Lưu", "Save"), primary: true, onClick: onSave },
        ]
      : [{ label: t("Đóng", "Close"), onClick: onClose }];

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      title={t("Hồ sơ người dùng", "User Profile")}
      titleExtra={
        <Badge variant={data.status === "ACTIVE" ? "default" : "secondary"}>
          {t(data.status)}
        </Badge>
      }
      layout="1-column"
      size="sm"
      confirmOnClose={mode === "edit"}
      actions={actions}
      leftPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection title={t("Thông tin chung", "General Info")}>
            <DrawerField label={t("Họ tên", "Full Name")}>
              <input className={inputCls} />
            </DrawerField>
            <DrawerField label={t("Email", "Email")}>
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
- **`rightPanel`**: Chứa các thông tin meta, tham chiếu, file đính kèm (Metadata, Logs). (Không cần Status ở đây nếu đã dùng `titleExtra` trên Header).
- **Bắt buộc**: Các nhóm nội dung (content group) độc lập (ví dụ: Thông tin chung, Thuộc tính, Ghi chú, Lịch sử...) phải được đặt trong một `<DrawerSection>` riêng biệt. Component này sẽ tự động tạo một thẻ (card) có tiêu đề và đường phân cách theo đúng chuẩn UI.
- **Button trong DrawerSection**: Đối với các phần (section) chứa bảng dữ liệu (như table danh sách) hoặc các section cần hành động (Add, Link, Delete All...), **bắt buộc** phải đặt các action button này ở góc trên bên phải của section. Để làm điều này, sử dụng prop `titleExtra` của `<DrawerSection>`. Không được đặt button ở bên trong nội dung dưới title hoặc phía trên table.

**Mẫu code 2-Columns Drawer**:

```tsx
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { useTranslation } from "react-i18next";

export function VoucherDrawer({ open, onClose, mode, setMode, data }) {
  const { t } = useTranslation("vouchers");

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      title={t("Phiếu nhập kho: PNK-001", "Receipt Voucher: PNK-001")}
      titleExtra={
        <Badge variant={data.status === "DONE" ? "default" : "secondary"}>
          {t(data.status)}
        </Badge>
      }
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      actions={[{ label: t("Đóng", "Close"), onClick: onClose }]}
      leftPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection title={t("Thông tin chung", "General Info")}>
            <DrawerField label={t("Nhà cung cấp", "Vendor")}>...</DrawerField>
          </DrawerSection>
          <DrawerSection title={t("Hàng hóa", "Items")}>
            {/* Table hàng hóa ở đây */}
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection title={t("Siêu dữ liệu", "Metadata")}>
            <DrawerField label={t("Ngày tạo", "Created At")}>
              10/10/2026
            </DrawerField>
            <DrawerField label={t("Người tạo", "Created By")}>
              Admin
            </DrawerField>
          </DrawerSection>
          <DrawerSection title={t("Chứng từ liên quan", "Related Docs")}>
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
- [ ] Nếu Drawer cho phép cập nhật, đã truyền `onToggleEdit` chưa?
- [ ] Nếu record có trạng thái (status), đã dùng `<Badge>` truyền vào `titleExtra` chưa?
- [ ] Tất cả text tĩnh đã được dùng hook `useTranslation` (i18n) để wrap bằng `t(...)` chưa?
- [ ] Drawer đơn giản (1 cột) đã set `layout="1-column"` và `size="sm"`/`"md"` chưa?
- [ ] Drawer chứng từ (2 cột) đã set `layout="2-columns"` và `size="xl"`/`"lg"` chưa?
- [ ] Phần nội dung bên trong đã dùng các khối chuẩn như `<DrawerSection>`, `<DrawerField>` để bao bọc các input chưa?
- [ ] Các action button của một `<DrawerSection>` (như nút Thêm, Xóa, Liên kết cho bảng) đã được đưa lên góc trên bên phải bằng prop `titleExtra` của `DrawerSection` chưa?
- [ ] Input đã sử dụng CSS class `inputCls` từ `@/shared/components/DrawerModal` (nếu có) chưa?
- [ ] Chức năng cảnh báo đóng Drawer khi đang Edit (`confirmOnClose={mode === 'edit'}`) đã được cấu hình đúng chưa?
