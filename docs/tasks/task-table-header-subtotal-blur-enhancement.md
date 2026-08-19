# Task: Nâng cấp giao diện Table Header & Subtotal Blur (Frosted Glass)

## Mục tiêu

- Thêm biến CSS token `--table-header-bg` và `--table-footer-bg` với độ mờ và độ đặc tối ưu (~90% opacity, 10px blur, saturate 160%) cho tất cả các theme (Default, Classic, Orcaq, Midnight).
- Đảm bảo trải nghiệm đọc chữ tốt nhất: không bị rối mắt khi chữ bên dưới trượt qua header hoặc subtotal row.
- Cập nhật `DataTable.tsx`, `StandardTable.tsx`, `SpreadsheetPageTemplate`, `DocumentLineTable.tsx` và `ui/table.tsx`.
- Áp dụng backdrop blur cho cả Header (`thead`, `th`, sticky top) và Subtotal (`tfoot`, sticky bottom summary row), đồng bộ ô sticky corner góc trên và dưới.
- Tinh chỉnh column resizing handle.

## Trạng thái thực hiện (Checklist)

- [x] Cập nhật biến CSS trong các theme (`default.css`, `classic.css`, `orcaq.css`, `midnight.css`) & `components.css`
- [x] Cập nhật primitive `src/shared/components/ui/table.tsx`
- [x] Cập nhật `src/shared/components/DataTable.tsx` (Header, Corner sticky, Summary footer, Resize handle)
- [x] Cập nhật `src/shared/components/DocumentLineTable.tsx`
- [x] Cập nhật các bảng subtotal / ledger đặc thù (`FifoFlatTable.tsx`, `InventoryFlatLedgerTable.tsx`)
- [x] Chạy `bun test` (221/221 pass), `bun run check:ci` (pass), `bun run build` (pass)
- [x] Hoàn thành tài liệu walkthrough
