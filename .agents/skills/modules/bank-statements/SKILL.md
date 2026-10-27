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

## Nền tảng drawer chi tiết giao dịch (V2, chưa dùng)
- Chưa có consumer: drawer chi tiết (V1 `pages/finance/components/bank-transaction-detail-drawer/`) vẫn chạy. Phần V2 chỉ có API, domain và mutation, chưa có UI.
- `domain/value-objects/cashflowAttributes.ts`: phân loại và mục đích dòng tiền, `isPurposeAllowed`. Không chứa nhãn.
- `domain/entities/cashTransaction.ts`: `PostingDraftLine`, `CashClassificationDraft`, mã lỗi hạch toán `PostingValidationError`.
- `domain/rules/`: `buildDefaultPostingLines`, `validatePosting` (thiếu ngày, không có dòng, thiếu TK, lệch Nợ/Có), `buildTransactionPatch` (chỉ gửi trường đổi, trả null khi không đổi gì), `buildAuditItems` (trả `AuditEntry`, UI tự dịch nhãn theo `kind`).
- `api/cashTransactionApi.ts`: chi tiết, PATCH, post/unpost, danh sách theo đối tác, đồ thị chứng từ, link/unlink hóa đơn cấn trừ. Dùng `v2HttpClient`.
- `api/mutations/useSaveCashTransactionMutation.ts`: PATCH rồi post/unpost, không nguyên tử. Lỗi là `CashTransactionSaveError` mang `step` (`UPDATE_INFO` | `POST` | `UNPOST`) và `serverMessage`. UI map `step` sang `v2.bankStatements.cashDetail.error.*`.
- `components/helpers/cashflowOptions.helper.ts`: nhãn và danh sách option, khóa `v2.bankStatements.cashflow.*` (định nghĩa trong `bankStatements.cashflow.locale.ts`, gộp vào `bankStatements.locale.ts`).
- Dùng chung: `src/v2/shared/utils/branchIds.ts` (`resolveBranchIds`, `isSameBranchIds`).
- Việc còn lại: hook và drawer V2, parity với V1 (hạch toán, chứng từ liên kết, bảng kê đối tác, biến động), wiring theo cầu nối.
