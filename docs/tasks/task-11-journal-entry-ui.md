# Task Template

## Request Input
- Type: FEATURE
- Mục tiêu: UI cho tính năng Journal Entry — (1) danh sách bút toán đã hạch toán với filter/search; (2) form hạch toán bút toán thủ công
- Bối cảnh/ngữ cảnh: Module kế toán core. Phụ thuộc API gate: liouni-erp-api/docs/tasks/task-01-journal-entry-api.md

## Goal
Xây dựng 2 màn hình chính:
1. Journal Entry List — bảng danh sách bút toán, filter theo tài khoản/kỳ/trạng thái/date range, search theo số phiếu hoặc mô tả, click row để xem chi tiết
2. Journal Entry Form (Drawer/Page) — form hạch toán thủ công: header (ngày, kỳ, mô tả), bảng dòng hạch toán (tài khoản, debit, credit, diễn giải), auto-validate balanced trước khi submit, nút Post để chuyển draft->posted

## Scope
- In-scope: List page, Detail view, Create form, Post action, Reverse action
- Out-of-scope: Import từ file, báo cáo tổng hợp, auto-journal từ module khác

## Relevant Files
- `src/pages/ke-toan/journal-entries/` (tạo mới)
- `src/pages/ke-toan/journal-entries/index.tsx` — list page
- `src/pages/ke-toan/journal-entries/[id].tsx` — detail/edit page
- `src/components/ke-toan/JournalEntryForm.tsx` — form component
- `src/components/ke-toan/JournalEntryLineTable.tsx` — bảng dòng hạch toán
- `src/hooks/useJournalEntries.ts` — API hooks
- `src/types/journal-entry.ts` — TypeScript types từ API contract
- `src/api/journal-entries.ts` — axios calls

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan: journal_entries, journal_entry_lines, chart_of_accounts
- Data nền cần có: DB gate + API gate đều phải READY
- Constraint/index/default cần có: đã xử lý tại DB gate
- Kết quả: `DB_READY` — DB gate và API gate đã hoàn tất
- Nếu `DB_GAP_FOUND`: N/A

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done — xác nhận DB + API gate READY
- [x] 2.0 Backend workflow/API gate done — API contract imported, endpoints tested ở API gate
- [x] 3.0 UI gate done
  - [x] 3.1 Types: src/modules/accounting/types/journalEntry.ts
  - [x] 3.2 API layer: src/modules/accounting/api/journalEntriesApi.ts (list, getById, create, post, reverse)
  - [x] 3.3 Hook: useJournalEntries, useJournalEntryLookups, useJournalEntryActions
  - [x] 3.4 JournalEntryLineTable component — editable rows, debit/credit input, running totals
  - [x] 3.5 JournalEntryForm component — header fields + line table + balanced validation
  - [x] 3.6 List page — columns: số phiếu, ngày, kỳ, mô tả, tổng debit, trạng thái; filter bar; pagination
  - [x] 3.7 Detail/Edit drawer — xem chi tiết + nút Post + nút Reverse
  - [x] 3.8 Navigation: dùng route/sidebar Nhật ký chung hiện có, nối page thật thay ComingSoon
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test: route /nhat-ky-chung render, list/filter UI hiển thị, create drawer/form render, build pass
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result: `DB_READY` — directus-staging/ops/tasks/task-01-journal-entry-db.md
- API gate result: `API_READY` — liouni-erp-api/docs/tasks/task-01-journal-entry-api.md, commit 7e3bbab
- `npx tsc --noEmit`: PASS
- Smoke test: Vite route `/nhat-ky-chung` render OK; create drawer text present; local dev API env không trỏ staging nên data call hiển thị expected API base error trong smoke không-auth. `npm run build` PASS.

## Lessons Learned
- Không có issue code mới; API schema issue đã ghi ở API repo lessons learned.

## Commit/Push Status
- Web repo: commit+push khi hoàn tất
- API repo: commit+push sau gate API
- DB/directus staging: apply+verify+document (no code push required)
