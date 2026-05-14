# Task Template

## Request Input (bạn chỉ cần điền phần này)
- Type: ENHANCE
- Mục tiêu: Trong phiếu tiền mặt/tiền gửi, chỉ cho xóa khi DRAFT; sau khi duyệt thì không cho xóa, chỉ cho hủy. Khi người có quyền bấm duyệt thì phiếu tự động chuyển POSTED, không cần thêm bước hạch toán thủ công.
- Bối cảnh/ngữ cảnh: EXECUTE mode đã được user xác nhận bằng “thuc thi”.

## Goal
Thiết kế thay đổi thống nhất DB -> API -> UI để đảm bảo:
1) Guard xóa chứng từ chỉ còn hiệu lực ở trạng thái DRAFT.
2) Sau duyệt, chứng từ không thể xóa; thay bằng luồng CANCELLED theo quyền.
3) Approve action bởi người có quyền sẽ auto-post ngay (status đích POSTED), bỏ nhu cầu thao tác hạch toán riêng.
4) Không phá vỡ luồng đối soát AR liên quan (related_documents, settled/open amount).

## Scope
- In-scope:
  - Luồng trạng thái phiếu tiền mặt/tiền gửi (payment_vouchers) cho các hành vi approve/delete/cancel.
  - API guard và transition validation tương ứng.
  - UI action visibility/enabled-state cho nút Xóa, Hủy, Duyệt trong Cash/Bank.
  - Đồng bộ side-effects kế toán/settlement khi approve auto-post.
- Out-of-scope:
  - Tạo mới loại chứng từ khác ngoài payment_vouchers.
  - Thay đổi giao diện module ngoài Cash/Bank trừ nơi hiển thị trạng thái/liên kết liên quan trực tiếp.
  - Refactor tổng thể kiến trúc không liên quan acceptance nêu trên.

## Relevant Files
- `src/modules/finance/components/VoucherTable/index.tsx` - list action visibility.
- `src/modules/finance/components/CashVoucherDrawer/index.tsx` - tiền mặt drawer actions.
- `src/pages/TienGui.tsx` - tiền gửi drawer actions.
- `src/modules/finance/hooks/useVoucherDrawer.ts` - shared status transition calls/toasts.
- `liouni-erp-api/src/payment-vouchers/*` - workflow transitions, permission guard, delete/cancel/approve handlers.
- `directus-staging` collections `payment_vouchers`, `journal_entries`, `journal_entry_lines`, `ar_documents`, `ar_applications` - ràng buộc dữ liệu và side-effects.

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `payment_vouchers`: `id`, `status`, `voucher_type`, `approved_at/approved_by`, `posted_at/posted_by`, `cancelled_at/cancelled_by` (hoặc cột tương đương), `is_deleted` nếu có soft-delete pattern.
  - `journal_entries`, `journal_entry_lines`: idempotency posting theo `reference_type/reference_id`, trạng thái reverse/cancel nếu có.
  - `ar_documents`, `ar_applications` (nếu chứng từ có liên kết AR settlement).
- Data nền cần có:
  - Role/policy cho quyền approve/cancel/delete.
  - Dữ liệu mẫu voucher ở các trạng thái DRAFT, PENDING_APPROVAL/APPROVED/POSTED.
- Constraint/index/default cần có:
  - Guard transition status hợp lệ (DB trigger hoặc API workflow guard).
  - Idempotent posting unique guard theo source voucher (tránh tạo trùng journal khi approve lặp).
  - Rule không cho delete khi status != DRAFT.
- Kết quả: `DB_READY` (runtime precheck đã xác nhận schema/index cần thiết; không cần DB migration)
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): Tạo nếu khi execute phát hiện thiếu cột/constraint/policy.

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done (runtime precheck)
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [ ] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 API/Web build
  - [ ] 4.3 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## EXECUTE Status
- Đã sửa API/Web theo acceptance.
- Không chạy migration/SQL vì Gate 0 = `DB_READY`.
- Build validation đã pass; deploy/runtime smoke pending.

## Gate validations (khi execute)
- DB Gate:
  - [x] Confirm schema + permissions cho status transition approve->posted và cancel.
  - [x] Confirm guard/idempotency posting theo voucher reference.
- API Gate:
  - [x] DELETE `/payment-vouchers/:id` trả lỗi business rõ ràng khi status != DRAFT.
  - [x] APPROVE endpoint khi success phải trả status cuối `POSTED` (không dừng ở APPROVED).
  - [x] Cancel endpoint cho phép trạng thái hợp lệ sau duyệt/post theo rule thống nhất.
  - [ ] Negative tests: user thiếu quyền approve/cancel/delete bị chặn đúng.
- UI Gate:
  - [x] Nút Xóa chỉ hiện/enable ở DRAFT.
  - [x] Sau duyệt/post, thay bằng nút Hủy (theo quyền), không còn thao tác xóa.
  - [x] Sau approve thành công, UI phản ánh trạng thái POSTED ngay và không còn đề xuất bước hạch toán thủ công.

## Plan implementation theo thứ tự DB -> API -> UI

### Phase A — DB / Directus staging
1. Inspect schema/policy hiện tại cho `payment_vouchers` + bảng bút toán liên quan.
2. Xác nhận có/thiếu guard transition và idempotent posting.
3. Nếu thiếu: chuẩn bị DB task trong directus-staging (SQL + metadata/policy) để:
   - Chặn delete non-DRAFT ở tầng dữ liệu/workflow.
   - Đảm bảo approve không tạo duplicate journal khi retry.
4. Evidence DB: field/constraint/policy snapshots + query verify.

### Phase B — ERP API
1. Chuẩn hóa state machine cho voucher:
   - DRAFT -> (approve bởi người có quyền) -> POSTED.
   - POSTED/APPROVED/PENDING_APPROVAL: delete bị từ chối.
   - Hủy dùng cancel flow có kiểm tra quyền và trạng thái.
2. Gộp/điều chỉnh approve handler để trigger posting logic ngay trong cùng transaction-safe flow.
3. Bổ sung/siết message lỗi business cho thao tác sai trạng thái.
4. Bảo toàn side-effects AR settlement/recompute nếu đang phụ thuộc trạng thái voucher.
5. API evidence: request/response mẫu cho approve/delete/cancel (positive + negative).

### Phase C — ERP Web UI
1. Cập nhật action rendering ở list/detail/modal phiếu tiền mặt/tiền gửi:
   - Draft: có Xóa (nếu quyền).
   - Đã duyệt/posted: ẩn hoặc disable Xóa; hiển thị Hủy theo quyền.
2. Cập nhật copy/label/status badge để thể hiện approve là auto-posted.
3. Loại bỏ/ẩn điểm chạm UI gợi ý “hạch toán thêm” sau duyệt (nếu có).
4. UI evidence: before/after screenshot logic + smoke flow thao tác thực tế.

## Risk + Rollback
- Rủi ro:
  1) Conflict với flow cũ tách APPROVED và POSTED.
  2) Side-effects AR/journal có thể chạy 2 lần nếu approve retry không idempotent.
  3) UI cache/state có thể hiển thị sai action sau transition nhanh.
- Giảm thiểu:
  - Khóa transition ở API + guard idempotency DB.
  - Viết negative tests cho delete non-DRAFT và approve lặp.
  - Re-fetch detail sau action success để đồng bộ trạng thái UI.
- Rollback:
  - Revert commit API/Web theo cặp.
  - Nếu có DB change: rollback SQL/metadata theo script ngược đã chuẩn bị trước khi apply.
  - Redeploy lại phiên bản trước và verify route/logs.

## Evidence cần thu thập (khi execute)
1. Gate 0 DB evidence:
   - Output precheck collections/fields.
   - Snapshot constraints/index/policy liên quan.
2. API evidence:
   - Approve thành công => `status=POSTED`.
   - Delete non-DRAFT bị chặn đúng message.
   - Cancel hợp lệ sau duyệt/post (theo rule).
   - Negative permission checks.
3. UI evidence:
   - DRAFT thấy nút Xóa.
   - POSTED không còn Xóa, có Hủy theo quyền.
   - Sau bấm Duyệt, badge/status lên POSTED ngay.
4. Build/deploy evidence:
   - `npx tsc --noEmit` pass.
   - API/Web build pass.
   - Container status + startup logs sau deploy stack liên quan.

## Validation Evidence
- DB precheck result: `payment_vouchers|6`, `journal_ref|2`, `cash_bank_related_documents|1`, `idx_journal_entries_payment_voucher_ref_unique` exists => `DB_READY`.
- API `npm run build`: pass.
- Web `npx tsc --noEmit`: pass.
- Web `npm run build`: pass (Vite warnings only: existing dynamic/static import chunking + large chunk warning).
- Smoke test: pending deploy/runtime verification.

## Lessons Learned
- Không có issue mới.

## Commit/Push Status
- Web repo: pending commit/push.
- API repo: pending commit/push.
- DB/directus staging: no DB change needed.

## Sẵn sàng thực thi
Chờ bạn xác nhận để chuyển sang EXECUTE mode. Khi bạn trả lời “Sẵn sàng thực thi”, mình sẽ bắt đầu theo đúng thứ tự DB -> API -> UI, cập nhật checklist realtime và thu thập đầy đủ evidence.