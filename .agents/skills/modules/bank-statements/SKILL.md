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

## Drawer chi tiết giao dịch tiền mặt (V2, đã nối)
- Nối tại `modules/bank-statements/components/BankStatementsTab/components/BankStatementDrawers.tsx`: `type === "cash"` dùng `CashTransactionDetailDrawer` (export từ `@/v2/modules/bank-statements`), tab bank vẫn dùng drawer V1 `BankTransactionDetailDrawer`. Không có file cầu nối riêng.
- Chọn dòng ở bảng kê đối tượng gọi `onSelectTransaction` → mở giao dịch khác ngay trong drawer.
- Khóa tab từ nơi mở (`txn_details`, `txn_partner`, `partner`, `accounting`...) đi qua `resolveDetailTab`; tab Theo đối tượng ẩn khi không có tên hoặc tài khoản đối ứng (`canShowPartnerTabs`).
- Tab: Chi tiết (`CashVoucherSummary`), Hạch toán (`CashPostingSection` + `V2PostingLinesEditor`), Theo đối tượng (`CashPartnerTransactions`, `CashPartnerAnalytics`), Chứng từ liên kết (`CashTraceabilitySection` dùng `V2DocumentTraceability` và `CashInvoiceNetOffModal`), Lịch sử (`buildAuditItems`).
- Lưu: `buildTransactionPatch` (chỉ gửi trường đổi) + `buildPostingRequest` (POST/UNPOST/SKIP) qua `useSaveCashTransactionMutation`; lỗi báo đúng bước (`CashTransactionSaveError.step`). Lỗi lưu hiển thị ở chân drawer, không dùng prop `error` của `V2StandardDrawer` (prop đó thay toàn bộ thân).
- Bỏ hạch toán và gỡ liên kết có xác nhận trước khi gọi API.
- Hook trạng thái: `drawers/CashTransactionDetailDrawer.hook.ts`; nháp hạch toán: `drawers/useCashPostingDraft.ts`; helper thuần: `drawers/CashTransactionDetailDrawer.helper.ts`.
- Khóa i18n: `v2.bankStatements.cashDetail.*` (`bankStatements.cashDetail.locale.ts`), `v2.bankStatements.cashflow.*`, `v2.bankStatements.cashNetOff.*`, `v2.bankStatements.cashPartner.*`, gộp vào `bankStatements.locale.ts`. Test có kiểm tra parity vi/en.

## Rule nghiệp vụ (domain/rules, value-objects)
- `buildDefaultPostingLines`, `validatePosting` (ngày, dòng, tài khoản, cân bằng), `summarizeJournalEntry`.
- `netOffAllocation`: mặc định số cấn trừ trừ dần theo hạn mức, kẹp `[0, còn lại]`, kiểm tra vượt hạn mức, `invoiceRemaining`.
- `partnerTransactionQuery`: đổi trạng thái bảng đối tượng thành tham số API, số còn lại, nguồn tiền.
- `partnerAnalytics`: tổng thu/chi/ròng, tự cộng từ chuỗi theo kỳ khi API thiếu tổng.
- `cashflowAttributes` (value-object): phân loại và mục đích, không chứa nhãn.

## Hợp đồng API dùng (V2 client)
- `api/cashTransactionApi.ts`: chi tiết, PATCH, post/unpost, danh sách theo đối tượng (`items`, `total`), đồ thị chứng từ, link/unlink hóa đơn.
- `api/partnerStatsApi.ts`: `dashboard-stats`, `transactions/column-options` (có `column_filters`).
- `api/accountingLookupApi.ts`: `chart-of-accounts` (mảng hoặc `{items}`), `journal-entries/:id`.
- `api/branchOptionsApi.ts`: `GET /branches` (`items` hoặc `data`).

## Còn lại
- Tag của giao dịch (`EntityTagSelector`) chưa có bản V2: chưa hiện trong drawer tiền mặt.
- Drawer bank vẫn là V1; các nơi khác gọi `BankTransactionDetailDrawer` (garage, hóa đơn, sổ nhật ký, đối tác dòng tiền) chưa đổi.
- Bảng kê đối tượng và biến động dùng chung dữ liệu bank và cash (V1 cũng vậy); chưa lọc theo nguồn tiền.
- Biến động hiện bảng theo kỳ không có dòng tổng (tổng nằm ở các thẻ phía trên).
- Chưa smoke test trên trình duyệt `/cashflow?tab=cash`.
