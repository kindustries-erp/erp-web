---
name: bank-statements-web
description: Tri thức frontend cho drawer xuất Excel sao kê ngân hàng / sổ quỹ tiền mặt (bản V2 trong src/v2/modules/bank-statements).
---

# Bank statements (erp-web)

## Phạm vi
- Trang sao kê vẫn là V1 (`src/modules/bank-statements/`). Chỉ drawer xuất Excel đã chạy trên V2.
- Module V2: `src/v2/modules/bank-statements/` (sinh bằng plop `v2-module`, `wire = false`, chưa có route `/v2`).

## Cấu trúc drawer V2
- `drawers/BankStatementExportDrawer.tsx`: view, dựng trên `V2ExportExcelDrawer`. Props: `open`, `onClose`, `type` (`bank` | `cash`), `accounts`, `buildBaseQuery`, `currentFilterSummary`.
- `drawers/BankStatementExportDrawer.hook.ts`: điều phối bắt đầu xuất, tải lại từ lịch sử.
- `drawers/BankStatementExportDrawer.form.hook.ts`: cột đã chọn (lưu localStorage key `v2_bank_statement_export_columns`), tài khoản, loại giao dịch, tóm tắt bộ lọc.
- `drawers/BankStatementExportDrawer.autoDownload.hook.ts`: tự tải khi job xong (SSE trước, lịch sử dự phòng), mỗi job một lần.
- `drawers/BankStatementExportConditions.tsx`: bọc `V2ExportConditionSection`, thêm `V2Combobox` tài khoản và loại giao dịch.
- `drawers/BankStatementExportDrawer.columns.config.ts`: 24 cột trong 4 nhóm (general, amount, correspondent, invoiceNetOff). Key khớp `bank-statement-excel.layout.ts` ở erp-api.

## Hợp đồng API
- `POST /api/v1/bank-transactions-core/export/excel/background`
- `GET  /api/v1/bank-transactions-core/export/excel/background/history`
- `GET  /api/v1/bank-transactions-core/export/excel/background/:jobId/download`
- SSE `GET /api/v1/bank-transactions-core/export/excel/progress/stream`, `processId = bank-statement-xlsx-export`.

## Quy tắc
- Chỉ import V2 từ `@/v2/shared/*`. Không import `@/core`, `@/shared`, `@/modules` (trừ `@/modules/auth/domain/authStore`).
- Key i18n theo namespace `v2.bankStatements.export.*` (vi/en trong `bankStatements.locale.ts`).
- Không dùng màu `blue-*`. Mỗi file dưới 180 dòng.

## Còn lại
- Hook phân kỳ (`period.hook.ts`) đang trùng với mẫu của `vinfast-parts`. Có thể gom về một hook dùng chung trong `src/v2/shared/` khi có module thứ ba.
- `bankStatementApi` (V1) vẫn còn các hàm export cũ không còn được gọi.
