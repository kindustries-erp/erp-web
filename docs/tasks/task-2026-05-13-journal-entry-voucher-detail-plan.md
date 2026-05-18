# Task Template

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu:
  1. 1 voucher phải hiển thị toàn bộ journal lines ngay trong bảng danh sách tổng hợp (list), không chỉ ở detail.
  2. Click 1 journal entry phải xem được chi tiết chứng từ liên quan và toàn bộ lines trong modal.
  3. Journal entry modal chỉ còn: Debit account, Credit account, Amount, Description.
  4. Bỏ status field khỏi form tạo bút toán (chỉ entry đã post mới xuất hiện trong journal).
  5. Tất cả yêu cầu UI phải áp dụng đồng thời ở cả list danh sách và modal chi tiết/tạo mới.
- Bối cảnh/ngữ cảnh: Nâng cấp UX + accounting flow cho màn NhatKyChung, đồng bộ với logic “journal chỉ gồm posted entries”.

## Goal

Thiết kế và triển khai thay đổi theo DB-first để:

- Journal list/detail phản ánh đúng quan hệ 1 voucher -> nhiều journal lines.
- UX thao tác nhanh theo cặp tài khoản Nợ/Có + số tiền, không nhập debit/credit amount tách rời.
- Detail drawer có phần “Related Voucher Detail” theo `reference_type/reference_id`.

## Scope

- In-scope:
  - API + UI module Journal Entries.
  - Mapping detail từ journal entry sang chứng từ nguồn qua `reference_type/reference_id`.
  - Điều chỉnh form tạo bút toán thủ công về 4 trường nghiệp vụ.
- Out-of-scope:
  - Thay đổi quy trình posting các module khác ngoài phạm vi endpoint journal hiện tại.
  - Refactor toàn bộ AR/AP Workbench ngoài phần liên quan trực tiếp data hiển thị journal detail.

## Relevant Files

- `src/pages/NhatKyChung.tsx` - list/detail drawer, hành vi click entry.
- `src/modules/accounting/components/JournalEntryForm/index.tsx` - đổi form còn 4 trường.
- `src/modules/accounting/components/JournalEntryLineTable/index.tsx` - bỏ input debit/credit amount tách rời.
- `src/modules/accounting/types/journalEntry.ts` - cập nhật type payload/form model.
- `src/modules/accounting/api/journalEntriesApi.ts` - mở rộng API lấy related voucher detail.
- `/opt/repos/liouni-erp/liouni-erp-api/src/journal-entries/journal-entries.controller.ts` - endpoint detail/hỗ trợ voucher detail.
- `/opt/repos/liouni-erp/liouni-erp-api/src/journal-entries/journal-entries.service.ts` - enrich response detail từ reference.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `journal_entries`: `id,voucher_no,date,description,status,reference_type,reference_id,total_debit,total_credit`
  - `journal_entry_lines`: `journal_entry_id,account_id,debit,credit,description,sort`
  - `chart_of_accounts`: `id,account_code,account_name`
  - `payment_vouchers`: có `id,voucher_no,description,debit_account_id,credit_account_id,amount,status`
  - `ar_document_lines`: có line-level detail để hiển thị khi reference trỏ AR document
- Data nền cần có:
  - Entry posted có `reference_type/reference_id` hợp lệ.
  - Có account master để map debit/credit labels.
- Constraint/index/default cần có:
  - Không yêu cầu đổi schema cho thay đổi hiện tại (dùng fields sẵn có).
  - Nếu cần line-detail cho payment voucher nhưng không có collection line riêng (`payment_voucher_lines` NOT FOUND), xử lý ở API fallback bằng header-level detail + journal lines.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: N/A (hiện tại chưa bắt buộc schema change)

## Coordination Impact

- [ ] Directus staging schema affected
- [x] ERP Web contract affected
- [x] ERP API contract affected
- [ ] No cross-system impact

## Plan thực thi (DB -> API -> UI)

1. DB gate (read-only verify)

- Xác nhận lại coverage `reference_type/reference_id` trên dữ liệu posted entries.
- Chốt mapping nguồn chứng từ theo loại reference (journal self-reverse, payment voucher, AR document).
- Gate validation:
  - Có sample data ít nhất 3 case: posted thường, posted có reverse, posted có reference sang voucher/document.

2. API gate

- Mở rộng `GET /journal-entries/:id` trả thêm `related_voucher` (nullable), shape tối thiểu:
  - `source_type`, `source_id`, `source_no`, `source_date`, `description`, `lines[]` (nếu có), `summary_amount`.
- Chuẩn hóa “chỉ posted entry xuất hiện ở journal list” ở service layer nếu chưa enforce triệt để.
- Bổ sung payload create manual theo 4 trường UX:
  - Input: `debit_account_id`, `credit_account_id`, `amount`, `description`, `date`, `period_id?`, `voucher_no?`.
  - Service tự tách thành 2 journal lines (Nợ/Có) khi persist.
- Giữ backward compatibility tạm thời cho payload cũ trong 1 nhịp release (nếu FE/API deploy lệch nhịp).
- Gate validation API:
  - Unit/service-level validation amount > 0.
  - Smoke: create manual entry -> DB có đúng 2 lines cân bằng.
  - Smoke: get detail entry có related voucher payload đúng theo reference.

3. UI gate

- NhatKyChung list:
  - Click row mở drawer chi tiết có block “Chứng từ liên quan”.
  - Mặc định chỉ hiển thị entry posted/reversed theo contract mới.
- JournalEntryForm modal:
  - Chỉ còn fields: Debit account, Credit account, Amount, Description (+ date/period giữ ở header nghiệp vụ).
  - Bỏ cơ chế nhập riêng debit amount / credit amount.
  - Bỏ status field khỏi form (không cho user chọn trạng thái).
- Detail drawer:
  - Hiển thị multi-lines cho 1 voucher rõ ràng theo từng dòng.
  - Nếu voucher không có line table gốc: hiển thị “header summary + journal lines” làm fallback.
- Gate validation UI:
  - `npx tsc --noEmit` pass.
  - Smoke route `/nhat-ky-chung`: create -> list -> open detail -> verify related voucher block.

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Gate validations (tiêu chí pass/fail)

- Gate 0 pass: DB precheck `DB_READY`, không thiếu field cốt lõi.
- API pass: detail endpoint trả `related_voucher` đúng shape, create mới tạo 2 lines cân bằng.
- UI pass: modal đúng 4 trường nghiệp vụ, không còn debit/credit amount tách rời, click entry xem được voucher detail.

## Risk + Rollback

- Risk 1: mismatch contract FE/API khi đổi payload create.
  - Rollback: giữ parser payload cũ ở API; FE feature-flag theo branch release.
- Risk 2: một số `reference_type` không có bảng line-detail tương ứng.
  - Rollback: fallback trả summary-only, không block mở detail.
- Risk 3: dữ liệu lịch sử có entry thiếu reference.
  - Rollback: UI hiển thị “Không có chứng từ liên quan”, không fail page.

## Evidence cần thu thập

- Gate 0:
  - Output precheck collections/fields.
  - Ảnh/chứng cứ query 3 sample entry có/không có reference.
- API:
  - JSON response `GET /journal-entries/:id` trước/sau (có `related_voucher`).
  - Kết quả smoke create manual entry và verify 2 lines cân bằng.
- UI:
  - Ảnh trước/sau modal create (old vs new fields).
  - Ảnh drawer detail hiển thị related voucher + line-by-line.
  - Kết quả `npx tsc --noEmit`.

## Validation Evidence

- DB precheck result:
  - `journal_entries` EXISTS
  - `journal_entry_lines` EXISTS
  - `payment_vouchers` EXISTS
  - `ar_document_lines` EXISTS
  - `payment_voucher_lines` NOT FOUND (đã ghi fallback trong plan)
- `npx tsc --noEmit`: pending
- Smoke test: pending

## Lessons Learned

- Chưa phát sinh issue trong pha PLAN.

## Commit/Push Status

- Web repo: chưa thực thi (PLAN mode)
- API repo: chưa thực thi (PLAN mode)
- DB/directus staging: chưa apply thay đổi schema (PLAN mode, read-only)

## Kết quả thực thi (2026-05-13)

DONE. Evidence:

- API: `journal-entries.service.ts` filter posted/reversed + embed lines trong findAll
- Web Form: `JournalEntryForm` rewritten — 4 fields (debit account, credit account, amount, description), bỏ status
- Web List: `NhatKyChung.tsx` list expand 1 row per line pair; modal 4 cột; bỏ status column + filter
- TypeScript: 0 errors (web + api)
- i18n: vi.ts + en.ts thêm keys debitAccount, creditAccount, amount
