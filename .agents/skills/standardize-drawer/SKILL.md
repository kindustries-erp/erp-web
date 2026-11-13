---
name: standardize-drawer
description: Chuẩn Drawer của erp-web, gồm V1 (StandardFormDrawer, DrawerSection, DrawerField), V2 (V2StandardDrawer) và mạng lưới chứng từ liên kết (DrawerDocumentTraceability, trong drawer-rules mục 11). Dùng khi tạo hoặc sửa drawer chi tiết hoặc form, layout 1 hay 2 cột, tab, hoặc tab chứng từ liên kết. Create or enhance a Drawer following ERP UI standards. Nạp erp-web-truth trước; cấu trúc Atomic xem erp-ui-structure.
---

# ERP Web — Drawer Standards

Skill gộp mọi chuẩn drawer của `erp-web`: V1, V2 và mạng lưới chứng từ liên kết. SKILL.md này chỉ định tuyến; chi tiết nằm trong `references/` (đường dẫn đầy đủ bên dưới, vì adapter của agent không nạp thư mục `references/`).

Nạp `erp-web-truth` trước để có ngữ cảnh repo. Cấu trúc Atomic, giới hạn 180 dòng và audit chung nằm ở `erp-ui-structure`.

## 1. Chọn hướng xử lý

Xác định trước: code nằm ở `src/` (V1) hay `src/v2/` (V2). Hai bên dùng component khác nhau, không trộn.

| Tình huống | Đọc | Ghi chú |
| :--- | :--- | :--- |
| Drawer chi tiết hoặc form trong `src/` (V1) | `.agents/skills/standardize-drawer/references/drawer-rules.md` | `StandardFormDrawer`: kích thước và mobile, Top Navigation Tabs, 1 cột, `DrawerSection`, cột phải, `relatedTabs`, hiệu năng nhập liệu. §10 là mẫu `V2StandardDrawer` + `V2FormField` |
| Drawer dưới `src/v2/` | `.agents/skills/standardize-drawer/references/v2-drawer.md` | `V2StandardDrawer`, `V2TabBar`; không import `@/shared/*` của V1 |
| Tab chứng từ liên kết, cấn trừ, truy vết nhiều bước | `.agents/skills/standardize-drawer/references/drawer-rules.md` mục 11 | `DrawerDocumentTraceability`, gắn làm tab trong `tabs`; bản V2 xem `v2-drawer.md` |
| Bảng nhúng hoặc bảng mở drawer | skill `standardize-table` | Trang bảng mở drawer theo `mode` view/edit, không điều hướng URL |

## 2. Luật cốt lõi (chi tiết ở references)

- **Component**: V1 dùng `StandardFormDrawer` từ `@/shared/components/StandardFormDrawer`. V2 dùng `V2StandardDrawer`.
- **Layout**: chọn 1 cột hay 2 cột theo độ phức tạp của form; tab điều hướng đặt phía trên.
- **Màu**: không dùng `blue-*`. Bảng token: `erp-web-truth/references/ui-shell-and-theme.md` mục 4.
- **i18n**: 100% chuỗi qua `t()` (VI/EN); V2 dùng prefix `v2.`.
- **A11y**: theo mục A11y trong `erp-ui-structure/references/atomic-ui.md`.
- **Kích thước**: mỗi file dưới 180 dòng; tách section và hook khi gần ngưỡng.

## 3. Sinh khung và quy trình

- Sinh nhanh: `bun plop drawer <moduleName> <componentName> <drawerType> <drawerSize> <hasStatus>`. Chi tiết tại skill `plop-generate`.
- Quy trình 4 bước: `.agents/workflows/standardize-drawer.md` (`/standardize-drawer`).

## 4. Tài liệu đi kèm

- `references/drawer-rules.md`: thuộc tính bắt buộc của `StandardFormDrawer`, kích thước và mobile, No Blue, phân loại drawer, Top Navigation Tabs, 1 cột, `DrawerSection`, cột phải, `relatedTabs`, hiệu năng, mẫu V2 (§10), mạng lưới chứng từ liên kết `DrawerDocumentTraceability` (§11), checklist (§12).
- `references/v2-drawer.md`: `V2StandardDrawer` (kiến trúc 5 tầng, kích thước, xếp tầng multi-drawer, props, ví dụ, quality gate, dark mode, mở V2 chồng lên drawer V1).
