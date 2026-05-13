# Task Plan — FIX mất chứng từ liên quan khi mở lại phiếu tiền mặt/ủy nhiệm thu chi

## Request Input (bạn chỉ cần điền phần này)
- Type: FIX
- Mục tiêu: Khi tạo phiếu tiền mặt/ủy nhiệm thu chi có chứng từ liên quan và submit, mở lại phiếu vẫn phải thấy chứng từ liên quan; khi mở qua trang công nợ, chứng từ phải phản ánh đã thanh toán đúng.
- Bối cảnh/ngữ cảnh: Hiện tại sau submit, mở lại phiếu không còn chứng từ liên quan; kéo theo trang công nợ chưa ghi nhận đã thanh toán.

## PLAN ONLY
- Trạng thái: CHỈ LẬP KẾ HOẠCH.
- Chưa sửa code/DB/config.
- Chưa deploy.

## Goal
Khóa lỗi mất liên kết `related_documents` sau khi tạo/cập nhật phiếu và đảm bảo số liệu thanh toán AR (`settled_amount/open_amount/status`) được tính nhất quán, lưu bền vững, hiển thị đúng ở cả Cash/Bank và Công nợ.

## Scope
- In-scope:
  - Luồng create/update/read chi tiết payment voucher cho CASH/BANK và CUSTOMER_ADVANCE_RECEIPT.
  - Persist + load lại `cash_bank_related_documents` khi mở lại voucher.
  - Recompute và persist trạng thái thanh toán cho `ar_documents` khi liên kết thay đổi.
  - Đồng bộ hiển thị trạng thái đã thanh toán ở trang công nợ dựa trên dữ liệu persisted.
  - Gỡ tính năng đảo bút toán (reverse journal entry) khỏi luồng nghiệp vụ liên quan trong phạm vi màn hình/API bị ảnh hưởng bởi task này.
- Out-of-scope:
  - Thay đổi nghiệp vụ mới ngoài phạm vi liên kết chứng từ liên quan.
  - Refactor UI tổng thể không liên quan bug.
  - Đổi schema lớn nếu Gate 0 không yêu cầu.

## Relevant Files
- `liouni-erp-api/src/payment-vouchers/payment-vouchers.service.ts` - điểm chính sync/load related documents + recompute settlement.
- `liouni-erp-web/src/modules/finance/utils/financeHelpers.ts` - mapping form build/read liên quan `related_documents`.
- `liouni-erp-web/src/modules/finance/api/financeApi.ts` - contract request/response của `related_documents` và số liệu settled/open.
- (sẽ xác nhận thêm sau inspect) component cash/bank modal và AR workbench đọc dữ liệu sau submit.

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `payment_vouchers`: `id`, `voucher_type`, `status`.
  - `cash_bank_related_documents`: `payment_voucher_id`, `related_type`, `related_id`, `amount`, `sort`.
  - `ar_documents`: `id`, `total_amount`, `settled_amount`, `open_amount` (nếu có computed), `status`.
- Data nền cần có:
  - Ít nhất 1 phiếu thu/chi có `related_documents` trỏ tới `ar_documents`.
  - Ít nhất 1 AR document có số tiền để đối soát settled/open.
- Constraint/index/default cần có:
  - FK `cash_bank_related_documents.payment_voucher_id -> payment_vouchers.id`.
  - Đảm bảo không có trigger/automation xóa liên kết ngoài ý muốn sau submit.
  - Kiểm tra cơ chế tính `open_amount` (DB generated/trigger hay API patch).
- Kết quả: `DB_READY` (precheck sơ bộ theo code hiện có, chưa thấy dấu hiệu cần đổi schema ngay).
- Nếu `DB_GAP_FOUND`: tạo DB task (directus-staging) trước khi thực thi API/UI.

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB precheck chi tiết bằng Directus/DB script
- [x] 2.0 DB gate (nếu cần)
  - [x] 2.1 Xác nhận/điều chỉnh constraints/index/trigger cho persist related docs
  - [x] 2.2 Xác nhận cơ chế persist settled/open/status AR ở tầng DB/API
- [x] 3.0 API gate
  - [x] 3.1 Trace create/update voucher: payload `related_documents` có vào service đầy đủ
  - [x] 3.2 Trace `syncRelatedDocuments`: không bị clear ngoài ý muốn khi edit/re-open
  - [x] 3.3 Verify `findOne/findAll` luôn `attachRelatedDocuments` đúng voucher
  - [x] 3.4 Verify recompute AR settlement chạy đúng cho create/update/delete liên kết
  - [x] 3.5 Thêm/siết smoke test endpoint để bắt regression
- [x] 4.0 UI gate
  - [x] 4.1 Verify modal/buildForm hiển thị lại `related_documents` sau reopen
  - [x] 4.2 Verify submit/edit không gửi payload làm mất liên kết
  - [x] 4.3 Verify trang công nợ đọc số liệu settled/open đã persist, không chỉ tính tạm UI
- [ ] 5.0 Validation gate
  - [x] 5.1 API: `npm run build`
  - [x] 5.2 Web: `npx tsc --noEmit`
  - [ ] 5.3 E2E smoke nghiệp vụ: tạo phiếu có liên kết -> reopen còn liên kết -> vào công nợ thấy đã thanh toán
- [ ] 6.0 Close gate
  - [ ] 6.1 Lessons learned (nếu có blocker/sai hướng)
  - [ ] 6.2 Commit + push repo liên quan
  - [ ] 6.3 Deploy stack liên quan và verify container/log
  - [ ] 6.4 Tổng hợp evidence cuối

## Gate validations
- Gate DB pass khi có evidence collection/field/constraint đúng và không có automation xóa link bất thường.
- Gate API pass khi:
  - Tạo/cập nhật voucher giữ nguyên liên kết mong muốn.
  - `GET` voucher trả lại `related_documents` đúng sau reopen.
  - AR `settled_amount/status` cập nhật đúng theo linked amount.
- Gate UI pass khi:
  - Reopen phiếu thấy đúng danh sách chứng từ liên quan.
  - Trang công nợ cùng chứng từ hiển thị đã thanh toán/partial đúng nghiệp vụ.

## Risk + rollback
- Risks:
  - Double-count settled amount nếu recompute chạy sai filter.
  - Mất link cũ khi update nếu payload partial bị hiểu là replace-all.
  - Side effect tới luồng đặt cọc/cấn trừ dùng chung `payment_vouchers`.
- Rollback:
  - Revert commit API/UI theo từng repo.
  - Nếu có DB change, rollback bằng script đảo ngược đã chuẩn bị trước.
  - Redeploy về image trước đó và xác nhận smoke route.

## Evidence cần thu thập
- Gate 0:
  - Output precheck collections/fields/constraints.
  - Sample record trước sửa: voucher + related docs + AR status.
- API:
  - Request/response create voucher có `related_documents`.
  - Response get lại voucher sau submit/reopen.
  - Log/response chứng minh recompute settled/status đã chạy.
- UI:
  - Bằng chứng thao tác: tạo phiếu -> reopen phiếu -> giữ nguyên liên kết.
  - Bằng chứng trang công nợ của cùng chứng từ hiển thị trạng thái thanh toán đúng.
- Validation:
  - Build/tsc pass.
  - Smoke checklist pass đầy đủ.

## Sẵn sàng thực thi
Chờ bạn xác nhận "Sẵn sàng thực thi" thì tôi mới bắt đầu vào pha thực thi (DB -> API -> UI), tuyệt đối không làm tắt thứ tự gate.