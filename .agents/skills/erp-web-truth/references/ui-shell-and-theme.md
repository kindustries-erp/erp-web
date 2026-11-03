# ERP Web — Shell, điều hướng và theme (reference)

Tài liệu tham chiếu của `erp-web-truth`. Chỉ đọc khi task chạm vào shell, sidebar, topbar, drawer hoặc theme.

## 1. App shell V2 cho trang V1

- `V2ShellLayout` (`src/core/components/layout/V2ShellLayout.tsx`) là App Shell đang dùng để hiển thị giao diện V2 cho các trang nghiệp vụ V1.
- Hai adapter nối menu và tab V1 vào shell V2: `useV2AdaptedNavSections` và `useV2AdaptedTabs` (trong `src/core/components/layout/adapters/`).
- Thành phần: `V2Sidebar` (thu gọn/mở rộng), right panel với topbar và tab bar.
- `V2SidebarItem` có trường `children?: V2SidebarItem[]` (đệ quy).
- Molecule `V2SidebarSubGroup` (`src/v2/shared/components/molecules/v2-sidebar-subgroup/`) hiển thị nhóm con dạng flyout bên phải (`side="right"`), dùng được cả khi sidebar mở rộng và thu gọn.
- Phân quyền RBAC lọc menu đệ quy và ẩn nhóm rỗng.

## 2. Chi nhánh hiện tại

- `currentBranchId` được lưu trong store `erp-app` (`src/core/config/appStore/appStore.ts`).
- Hook `useEnsureValidCurrentBranch` (`src/core/components/layout/hooks/`) đưa về chi nhánh đầu tiên khi chi nhánh đang chọn không còn hợp lệ. Hook được gọi trong `V2ShellLayout` và `Topbar`.

## 3. Nav section tách riêng

- `garage-nav-section` và `accounting-nav-section` là các organism độc lập trong `src/core/components/layout/sidebar/components/`. Mỗi section có test co-located.
- Nhóm `HỆ THỐNG` gồm mục trực tiếp `Hộp thư` (`email-inbox`), nhóm `Quản lý truy cập` (`sub-access-control`) và nhóm `Thiết lập chung` (`sub-general-settings`).
- Icon V2 đi qua registry `src/v2/shared/components/atoms/v2-icon/icons.ts`. Không import icon trực tiếp ngoài registry.

## 4. Theme và design token

Token nằm ở `src/styles/` (ví dụ `panels.css`, `shell.css`, `themes/classic.css`, `themes/default.css`). Theme dark `Classic` dùng lớp chiều sâu 4 tầng:

| Tầng | Vai trò | Token ví dụ |
| :--- | :--- | :--- |
| L0 | Canvas ngoài cùng | `--app-shell-bg` |
| L1 | Shell (main panel, sidebar) | `--main-panel-bg`, `--sidebar-bg` |
| L2 | Card, bảng, bề mặt | `--surface` |
| L3 | Control, header bảng, input | `--surface-hover`, `--table-header-bg` |

Màu accent Teal: `--primary`, `--primary-accent`, `--sidebar-active-bg`. Không dùng `blue-*`.

Drawer V2 (`V2DrawerSheet`, `src/v2/shared/components/molecules/v2-drawer-sheet/`): vỏ dạng floating card, overlay tối có blur nhẹ, viền mảnh cho header và footer.

Khi đổi token, kiểm tra cả light và dark.
