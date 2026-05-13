# Task — AR phải thu: edit bổ sung thanh toán, thêm cột đối tượng/xóa phiếu chưa link, và reset dữ liệu test

## PLAN ONLY (không sửa code/DB/deploy ở bước này)

## Type
ENHANCE + DATA RESET (destructive)

## Yêu cầu người dùng
1) Trong phần công nợ phải thu, thêm form edit để bổ sung chứng từ thanh toán sau khi đã tạo phiếu/hóa đơn.
2) Bảng công nợ phải thu thêm cột Đối tượng; các phiếu có nút Xóa nếu chưa link với chứng từ thanh toán nào.
3) Xóa toàn bộ chứng từ trong phần công nợ phải thu để test lại từ đầu.

## In-scope / Out-of-scope
- In-scope:
  - AR Workbench UI/API cho edit bổ sung payment links.
  - AR list UI: thêm cột đối tượng + nút xóa có điều kiện.
  - Data reset có kiểm soát cho AR test data (theo script/transaction có backup).
- Out-of-scope:
  - Không đổi kiến trúc sang DB/table mới.
  - Không xóa dữ liệu ngoài phạm vi AR-related collections đã xác định.

## Gate 0 — DB Precheck (bắt buộc)
- Hiện trạng snapshot (staging):
  - `ar_documents=11`
  - `cash_bank_related_documents=0`
  - `ar_applications=1`
- Kiểm tra phụ thuộc khóa ngoại/ràng buộc trước reset:
  - `cash_bank_related_documents.related_id -> ar_documents.id` (logical link)
  - `ar_applications.target_document_id/source_document_id` có thể tham chiếu AR docs
- Kết luận Gate 0:
  - `DB_READY` cho phần enhance API/UI.
  - `DB_READY_WITH_DESTRUCTIVE_APPROVAL` cho phần reset dữ liệu (chỉ thực thi khi vào ACT và chạy backup + transaction + verify).

## Kế hoạch triển khai theo thứ tự DB -> API -> UI

### 1) DB gate
- 1.1 Pre-reset backup (bắt buộc): export các bảng liên quan AR để rollback nhanh.
- 1.2 Reset script transaction-safe (chỉ khi ACT):
  - Xóa theo thứ tự phụ thuộc: `ar_applications` -> `cash_bank_related_documents` -> `ar_documents` (hoặc soft-reset status theo quyết định cuối).
  - Ghi log count before/after.
- 1.3 Verify integrity sau reset:
  - Count = 0 cho các collection scope reset.
  - Không phát sinh FK violation.

### 2) API gate
- 2.1 Bổ sung endpoint/service update AR document để attach/bổ sung payment chứng từ sau tạo.
  - Mục tiêu: edit form lưu được payment links sau khi tạo phiếu/hóa đơn.
- 2.2 Bổ sung delete guard:
  - Chỉ cho phép xóa AR document khi chưa có liên kết thanh toán (không có linked `ar_applications`/`cash_bank_related_documents`).
  - Trả lỗi rõ ràng nếu đã có link.
- 2.3 Response list chuẩn hóa cho UI:
  - Trả thông tin đối tượng (`business_partner_id`, snapshot name nếu có).
  - Trả cờ `can_delete` (hoặc equivalent) để UI render nút xóa đúng rule.

### 3) UI gate
- 3.1 AR table:
  - Thêm cột `Đối tượng`.
  - Thêm action `Xóa` chỉ hiển thị/enable khi `can_delete=true`.
- 3.2 AR edit form:
  - Cho phép mở lại chứng từ đã tạo để bổ sung/chỉnh payment links.
  - Hiển thị rõ số đã thanh toán/còn lại sau cập nhật.
- 3.3 Negative UI validation:
  - Phiếu đã linked payment không thể xóa.
  - Phiếu chưa linked payment xóa được.

## Checklist realtime
- [ ] 1.0 Backup dữ liệu AR trước reset — BLOCKED: terminal guard denied destructive command in this session
- [ ] 1.1 Reset dữ liệu AR theo transaction + verify count — BLOCKED: chưa xóa data
- [x] 2.0 API edit bổ sung payment links
- [x] 2.1 API delete guard theo linked-payment
- [x] 2.2 API list trả đủ đối tượng + cờ can_delete
- [x] 3.0 UI thêm cột Đối tượng
- [x] 3.1 UI nút Xóa có điều kiện
- [x] 3.2 UI edit form bổ sung payment links
- [x] 4.0 Build/smoke
- [ ] 5.0 Commit/push + deploy + verify

## Gate validations
- Gate DB:
  - Có backup artifact + bản ghi count before/after reset.
  - Reset không lỗi FK/constraint.
- Gate API:
  - Edit lưu payment link thành công, số liệu paid/remaining cập nhật.
  - Delete blocked đúng với record đã linked.
- Gate UI:
  - Cột Đối tượng hiển thị đúng.
  - Nút Xóa đúng điều kiện.
  - Form edit bổ sung payment chạy end-to-end.

## Risk + rollback
- Risk 1: Reset nhầm phạm vi dữ liệu.
  - Mitigation: whitelist bảng reset + backup trước + transaction.
- Risk 2: Xóa AR docs gây orphan liên kết.
  - Mitigation: delete order theo dependency + verify sau reset.
- Rollback:
  - Restore từ backup snapshot trước reset.
  - Revert commit API/Web nếu phát sinh regression.

## Evidence cần thu thập khi ACT
- Output backup + count before/after reset.
- API request/response cho edit payment links và delete guard.
- Ảnh/video ngắn UI: cột Đối tượng, nút Xóa conditional, edit form.
- Build logs API/Web + runtime container verify sau deploy.

## Sẵn sàng thực thi
Chờ bạn xác nhận để chuyển ACT mode và thực hiện (bao gồm bước reset dữ liệu destructive theo đúng backup/rollback).

## ACT note — reset data blocked
- User approved execution, but terminal safety guard blocked the combined backup/delete command with `BLOCKED: User denied. Do NOT retry.`
- Per safety instruction, data reset was not retried in this session. API/UI work proceeded; AR test data remains unchanged until reset is explicitly run through an approved channel.
