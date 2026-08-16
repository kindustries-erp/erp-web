---
name: scan-module-knowledge
description: Quét toàn bộ kiến thức một module frontend (Routing, PageKey, Breadcrumbs, Components, Tables, Drawers, Modals, Hooks, API Client) trong erp-web để tạo mới hoặc cập nhật file skill tại .agents/skills/modules/<module-name>/SKILL.md.
---

# 🔍 Module Knowledge Scanner & Updater (`erp-web`)

## Mục đích

Cung cấp quy trình quét tự động và chuẩn hoá để **tạo mới hoặc cập nhật** tài liệu tri thức cho bất kỳ module nào trong `erp-web`. Giúp Agent các phiên sau làm việc trên module đó có thể đọc ngay skill mà không tốn token quét toàn bộ mã nguồn.

---

## Khi nào sử dụng?

- Khi người dùng yêu cầu: *"Quét UI/Web module X và lưu vào .agents"* hoặc *"Cập nhật skill cho module X"*.
- Khi một module frontend vừa được xây dựng xong hoặc refactor có thay đổi về routing, component layout, drawer, API client, hoặc hooks.

---

## Quy trình Thực hiện (5 Bước Chuẩn)

### Bước 1: Quét Routing, Tab & Navigation
1. Tìm đăng ký PageKey trong `src/shared/types/index.ts` (kiểu `PageKey`).
2. Kiểm tra `SECTION_ROOTS` và `BREADCRUMBS` trong `src/core/config/appStore.ts`.
3. Kiểm tra Sidebar navigation trong `src/core/components/layout/hooks/useNavItems.tsx` và icon trong `TabBar.tsx`.
4. Tìm file Page component được import trong `src/App.tsx` (vd: `src/pages/<PageName>.tsx`).

### Bước 2: Quét Cấu trúc Trang & Bảng Dữ liệu (Table Page)
1. Đọc file Page chính trong `src/pages/` hoặc `src/modules/<module>/`.
2. Kiểm tra template sử dụng: `<SpreadsheetPageTemplate>` hoặc `<DashboardPageTemplate>`.
3. Trích xuất cấu trúc bộ lọc `FilterPanelConfig` (`useFilterPanel`).
4. Liệt kê toàn bộ các cột của `<DataTable>`:
   - STT/Checkbox, Cột Code (`TableText`), Cột Tên, Cột Phân loại/Trạng thái (`Badge`), Cột Tiền tệ/Số lượng (`tabular-nums`), Cột Ngày (`DateRangeColumnSlot`), Cột Thao tác (`ActionDropdown`).
5. Kiểm tra sub-row hoặc expand view (nếu có).

### Bước 3: Quét Form Drawers & Modals
1. Đọc các component Drawer trong `src/modules/<module>/components/` (kế thừa `StandardFormDrawer` hoặc `DrawerModal`).
2. Trích xuất các phân khu (`DrawerSection`), các trường dữ liệu (`DrawerField`), cơ chế validation (`react-hook-form` / Zod hoặc state).
3. Kiểm tra các chức năng nâng cao (Excel import/export, Combobox infinite scroll, inline table cell input, clone record).
4. Kiểm tra các modal xác nhận (`ConfirmModal`) cho các thao tác xóa, hủy, duyệt, đổi trạng thái.

### Bước 4: Quét API Client & Hooks Quản lý State
1. Đọc API client trong `src/modules/<module>/api/<module>Api.ts`.
2. Trích xuất tất cả TypeScript interfaces (`DTOs`, `Payloads`, `Response types`).
3. Trích xuất các phương thức gọi API (`list`, `get`, `create`, `update`, `remove`, `export`, `import`, `getColumnOptions`).
4. Đọc các custom hooks trong `src/modules/<module>/hooks/` (vd: `use<Module>Drawer.ts`, `use<Module>List.ts`).

### Bước 5: Sinh hoặc Cập nhật File Skill Chuẩn

Tạo hoặc cập nhật file tại đường dẫn:
```text
erp-web/.agents/skills/modules/<module-name>/SKILL.md
```

#### Template Mẫu Cho File Skill:
```markdown
---
name: <module-name>
description: Module tri thức <Tên Module> trong erp-web. Chứa toàn bộ cấu trúc UI, routing, DataTable columns, Drawers, Modals, API client và các tương tác UX.
---

# 🎨 Module Tri Thức: <Tên Module> - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện
- **PageKey**: `...`
- **Sidebar Group**: `...`
- **Tên hiển thị tab**: `...`
- **Breadcrumbs**: `...`
- **Route Component**: `src/pages/...`

## 2. Cấu trúc Source Code Frontend
[Sơ đồ cây file trong src/modules/<module>/ và src/pages/]

## 3. Thành phần Giao diện & Logic Trọng tâm
### 3.1. Trang danh sách
[Chi tiết template, filter panel, table columns]

### 3.2. Form Drawer & Modals
[Chi tiết drawer sections, fields, modes, confirm modals]

### 3.3. Thao tác hàng & Quy trình UX
[Chi tiết ActionDropdown, export, import, clone, status transitions]

## 4. API Client Interface
[Toàn bộ TypeScript types và methods trong <module>Api.ts]

## 5. Tích hợp Liên Module
[Các trang/module khác gọi hoặc liên kết tới module này]

## 6. Quy tắc Kiểm tra & QC UI Mandate
[Checklist tiêu chuẩn UI, i18n, atomic design, typecheck]
```

---

## Danh mục Kiểm tra Hoàn tất (Checklist)

- [ ] Đã quét đủ Page, Drawer, Table Columns, API Client, Types.
- [ ] File skill được lưu đúng tại `erp-web/.agents/skills/modules/<module-name>/SKILL.md`.
- [ ] YAML frontmatter có `name` (trùng tên module) và `description` rõ ràng.
- [ ] Thư mục `modules` đã được đăng ký trong `.agents/skills.json`.
- [ ] Đã cập nhật tham chiếu trong `erp-web/.agents/skills/liouni-erp-web-current-truth/SKILL.md`.
