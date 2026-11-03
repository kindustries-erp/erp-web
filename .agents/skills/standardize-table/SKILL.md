---
name: standardize-table
description: Chuẩn Bảng dữ liệu của erp-web, gồm V1 (DataTable, SpreadsheetPageTemplate) và V2 (V2StandardTable). Dùng khi tạo hoặc sửa trang bảng, cột, filter/sort, subtotal, phân trang, view mode, bảng nhúng trong drawer hoặc modal. Create or enhance a DataTable page following ERP UI standards. Nạp erp-web-truth trước; cấu trúc Atomic xem erp-web-structure.
---

# ERP Web — Table Standards

Skill gộp mọi chuẩn bảng của `erp-web`: luật cột và bảng, trang bảng, và bản V2. SKILL.md này chỉ định tuyến; chi tiết nằm trong `references/` (đường dẫn đầy đủ bên dưới, vì adapter của agent không nạp thư mục `references/`).

Nạp `erp-web-truth` trước để có ngữ cảnh repo. Cấu trúc Atomic, giới hạn 180 dòng và audit chung nằm ở `erp-web-structure`.

## 1. Chọn hướng xử lý

Xác định trước: code nằm ở `src/` (V1) hay `src/v2/` (V2). Hai bên dùng component khác nhau, không trộn.

| Tình huống | Đọc | Ghi chú |
| :--- | :--- | :--- |
| Trang bảng mới hoặc refactor trang V1 | `.agents/skills/standardize-table/references/table-page.md`, rồi `table-rules.md` | Page: breadcrumb, TabBar, i18n, hook + React Query, boilerplate |
| Luật cột, filter, sort, context menu, subtotal, phân trang, view mode (V1) | `.agents/skills/standardize-table/references/table-rules.md` | Cũng dùng cho bảng nhúng trong drawer hoặc modal |
| Bảng hoặc trang dưới `src/v2/` | `.agents/skills/standardize-table/references/v2-table.md` | `V2StandardTable`; không import `@/shared/*` của V1 |
| Drawer chi tiết gắn với bảng | skill `standardize-drawer` | Mở bằng `mode` view/edit, không điều hướng URL |

## 2. Luật cốt lõi (chi tiết ở references)

- **Component**: V1 dùng `DataTable` với `variant="spreadsheet"` trong `SpreadsheetPageTemplate`. V2 dùng `V2StandardTable`.
- **Màu**: không dùng `blue-*`. Bảng token và màu được chấp nhận: `erp-web-truth/references/ui-shell-and-theme.md` mục 4.
- **i18n**: 100% chuỗi qua `t()` (VI/EN); V2 dùng prefix `v2.`.
- **Row actions**: dùng prop `rowActions`, không tạo cột action tĩnh.
- **Subtotal**: ô tổng dùng `SubtotalSummaryCell`; từ trang 2 trở đi phải truyền số lũy kế (`cumulativeAmount`, `cumulativeQty`, `cumulativeCount`).
- **`tableId`**: duy nhất theo bảng (`[module]-table`), dùng để lưu cấu hình cột.
- **Không bọc thêm border** quanh bảng; container đã có bo góc.
- **Query**: hằng số `DEFAULT_STALE_TIME` đọc từ `@/shared/lib/queryKeys`, không ghi cứng giá trị.
- **Kích thước**: mỗi file dưới 180 dòng; tách `.columns.tsx`, `.hook.ts`, `.type.ts`.

## 3. Sinh khung và quy trình

- Sinh nhanh: `bun plop table-page ...` (trang đầy đủ) hoặc `bun plop table-section <moduleName> <componentName> <rowTypeName>` (bảng nhúng). Chi tiết tại skill `plop-generate`.
- Quy trình 5 giai đoạn và bộ lệnh grep audit bắt buộc: `.agents/workflows/standardize-table.md` (`/standardize-table`).

## 4. Tài liệu đi kèm

- `references/table-rules.md`: luật cột, filter, context menu, cột số/tiền/trạng thái, subtotal, phân trang, sort, hiển thị cột, hiệu năng, toàn màn hình, view mode, composite filter key, checklist.
- `references/table-page.md`: cấu trúc trang, breadcrumb và TabBar, i18n và empty state, hook server-side, tích hợp bảng và drawer, ViewModeCombobox và PillTabs, Header Page Tabs, boilerplate, checklist.
- `references/v2-table.md`: `V2StandardTable` (cây file 5 tầng, cách dùng, toolbar, hàng tổng, query trên URL, Storybook, trạng thái tải và rỗng).
