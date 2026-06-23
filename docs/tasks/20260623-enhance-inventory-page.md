# Nâng cấp trang Tồn kho (Inventory Page)

## Request Input

- Type: ENHANCE
- Mục tiêu: Bổ sung i18n đa ngôn ngữ cho toàn bộ trang tồn kho, chuyển đổi thời gian sang GMT+7, và tối ưu hóa bảng lịch sử tồn kho (sắp xếp mới nhất, giới hạn chiều cao, cho phép cuộn).
- Bối cảnh/ngữ cảnh: Trang Kho hiện tại còn hiển thị tiếng Việt cứng, giờ giấc hiển thị theo UTC (Z) và bảng lịch sử tồn kho chưa tối ưu hiển thị.

## Goal

- Dịch tất cả text cứng trên trang tồn kho qua i18n.
- Hiển thị thời gian cuối giao dịch và thời gian lịch sử theo múi giờ GMT+7 độc lập với múi giờ local của trình duyệt.
- Lịch sử tồn kho sắp xếp mới nhất lên đầu, giới hạn chiều cao và cho phép cuộn dọc.

## Scope

- In-scope:
  - Thêm dịch `inventory` vào `vi.ts` và `en.ts`.
  - Viết helper `normalizeDateTimeGMT7` trong `format.ts`.
  - Cập nhật `Inventory.tsx`, `OperationalInventoryPage.tsx`, `stockColumns.tsx`, `InventoryTimelineBlock.tsx`, và `operationalHelpers.ts`.
  - Sử dụng component custom `Tooltip` từ app cho các cột vật tư (Item) và loại vật tư (Type).
- Out-of-scope:
  - Thay đổi DB schema hoặc thay đổi logic API.

## Relevant Files

- `src/core/locale/vi.ts`
- `src/core/locale/en.ts`
- `src/shared/utils/format.ts`
- `src/pages/Inventory.tsx`
- `src/modules/operational/components/list/OperationalInventoryPage.tsx`
- `src/modules/operational/components/list/columns/stockColumns.tsx`
- `src/modules/operational/components/list/InventoryTimelineBlock.tsx`
- `src/modules/operational/utils/operationalHelpers.ts`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: None (không sửa DB)
- Data nền cần có: Dữ liệu tồn kho và lịch sử tồn kho hiện có
- Constraint/index/default cần có: None
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 `bun run lint` và `bun run lint:check`
  - [x] 4.2 `bunx tsc --noEmit`
  - [x] 4.3 `bun run test`
  - [x] 4.4 `bun run build`
  - [x] 4.5 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` (Không cần chỉnh sửa DB)
- `bun run lint:check`: Thành công, không lỗi/cảnh báo.
- `bunx tsc --noEmit`: Thành công, compile không lỗi.
- `bun run test`: 119/119 tests passed.
- `bun run build`: Build thành công (1,434.04 kB bundle generated).
- Smoke test: Đã kiểm tra đa ngôn ngữ, chuyển đổi timezone GMT+7 hoạt động chính xác ở các cột "Giao dịch cuối" và cột "Thời gian" lịch sử, danh sách movements đã được sort mới nhất lên đầu, có chiều cao giới hạn và thanh cuộn dọc hoạt động mượt mà. Đã tích hợp component `<Tooltip>` từ `@/core/components/ui/Tooltip` cho tên vật tư và loại vật tư khi bị truncate (ellipsis).

## Lessons Learned

- Khắc phục cảnh báo `react-hooks/preserve-manual-memoization` của React Compiler bằng cách tách biến trích xuất từ object ra ngoài hook dependency array và truyền trực tiếp làm dependency duy nhất.

## Commit/Push Status

- Web repo: Committed & Pushed
- API repo: Not applicable
- DB/directus staging: Not applicable
