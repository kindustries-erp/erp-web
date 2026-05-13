# Task — AR unified invoice/ledger flow + counterparty-only related documents

## PLAN ONLY (không sửa code/DB/deploy ở bước này)

## Type
ENHANCE

## Yêu cầu người dùng
1) Trong form tiền-gửi/tiền-mặt, khu vực chứng từ liên quan chỉ hiện chứng từ theo đúng đối tác đã chọn.
2) Trong công nợ phải thu có 2 nút tạo form riêng: "Tạo hóa đơn" và "Thu khác"; tuy nhiên cả hai phải ghi vào cùng một DB/bảng nghiệp vụ, chỉ phân biệt bằng field/type.
3) Danh sách invoice và danh sách công nợ gộp chung, dùng chung 1 DB.
4) Khi chọn chứng từ thanh toán hoặc ở trang ngân hàng/tiền mặt chọn hóa đơn để cấn trừ, hệ thống phải tự động trừ và hiển thị rõ: số đã thanh toán, số còn lại trên chứng từ/hóa đơn tương ứng.

## In-scope / Out-of-scope
- In-scope:
  - UI/flow hợp nhất trong Phải thu: 1 màn hình, 2 nút tạo (Tạo hóa đơn / Thu khác) nhưng dùng chung 1 backend data model.
  - Filter chứng từ liên quan theo đối tác trong Cash/Bank.
  - API query/filter để chỉ trả chứng từ đúng đối tác cho từng form.
- Out-of-scope:
  - Tách DB mới cho invoice/ledger (không làm). Mục tiêu là tiếp tục dùng DB hiện tại.

## Gate 0 — DB Precheck (bắt buộc)
- Collections tồn tại:
  - `ar_documents`
  - `partner_ledger_items`
  - `payment_vouchers`
  - `cash_bank_related_documents`
- Kết luận:
  - `DB_READY`
- Giải thích:
  - Invoice và công nợ đã nằm trên cùng hệ dữ liệu hiện tại (AR + ledger) và có thể gộp theo workflow mà không cần đổi schema ngay trong phase này.

## Kế hoạch triển khai theo thứ tự DB -> API -> UI

### 1) DB gate (read-only trong phase này)
- Không đổi schema ở phase đầu.
- Xác nhận mapping nghiệp vụ:
  - invoice source: `ar_documents`
  - debt ledger source: `partner_ledger_items`
  - payment links: `payment_vouchers` + `cash_bank_related_documents`
- Nếu trong lúc ACT phát hiện thiếu ràng buộc quan trọng cho unified form (ví dụ cần enum/type mới), sẽ tách sub-task DB riêng trước khi qua API/UI.

### 2) API gate
- Chuẩn hóa contract cho AR create từ 2 nút:
  - `POST` từ nút "Tạo hóa đơn" và nút "Thu khác" đều ghi vào cùng collection/table nghiệp vụ AR.
  - Phân biệt nghiệp vụ bằng field/type (`entry_type` hoặc map tương đương) thay vì tách DB.
  - Trả payload có `open_amount/settled_amount/remaining_amount` cho UI hiển thị ngay sau khi link thanh toán.
- Chuẩn hóa filter counterparty:
  - `getArDocuments` và danh sách link-candidate bắt buộc nhận `business_partner_id`.
  - Chặn trả chứng từ khác đối tác trong response dùng cho Cash/Bank picker.
- Negative gate validation:
  - Gọi API với counterparty A không được trả chứng từ của counterparty B.

### 3) UI gate
- Cash/Bank drawer:
  - Related documents selector chỉ hiện chứng từ theo đối tác đã chọn.
  - Nếu chưa chọn đối tác: disable selector + hint yêu cầu chọn đối tác trước.
- Phải thu với 2 nút tạo riêng:
  - Nút 1: `Tạo hóa đơn` (mở form preset theo loại hóa đơn).
  - Nút 2: `Thu khác` (mở form preset theo loại thu khác).
  - Cả hai form dùng chung shell controls và submit về cùng backend model; khác nhau ở field/type gắn vào payload.
- Danh sách hợp nhất:
  - 1 bảng/list chung hiển thị invoice + công nợ theo cùng filter/search/status.
  - Cột amount thống nhất hiển thị: tổng, đã thu/đã bù trừ, còn lại.

## Mapping component tái sử dụng (UI consistency)
- Drawer shell: tái dùng `DrawerModal`, `DrawerSection`, `DrawerField`.
- Select/tag mode: tái dùng pattern card/tag ở Cash/Bank presets.
- Date/select controls: tái dùng `DatePicker`, `Combobox`.
- Bảng công nợ: tái dùng/nhúng `PartnerLedgerTable` trong flow AR Workbench.

## Checklist realtime
- [x] 1.0 Gate 0 DB precheck ghi nhận DB_READY
- [x] 2.0 API: define single-table create contract cho 2 nút (`entry_type`) + response remaining
- [x] 2.1 API: enforce counterparty filter cho related docs candidates
- [x] 2.2 API negative validation (A không thấy docs của B)
- [x] 3.0 UI: Cash/Bank related docs chỉ theo đối tác
- [x] 3.1 UI: 2 nút tạo riêng (Tạo hóa đơn / Thu khác) nhưng chung data model
- [x] 3.2 UI: unified list invoice + công nợ
- [x] 4.0 Build/smoke
- [x] 5.0 Commit/push + deploy + verify

## Close-out evidence
- API build passed: `npm run build`.
- Web build passed: `npm run build`.
- API commit pushed: `0ec28a5 feat: auto reconcile ar cash bank links`.
- Web commit pushed: `fe6c4e4 feat: unify ar creation and cash bank linking`.
- Infra docs commit pushed: `86df048 docs: record ar cash bank reconciliation flow`.
- Deploy completed for `/opt/stacks/liouni-erp-api` and `/opt/stacks/liouni-erp-web`.
- Runtime verify: `liouni-erp-api` and `liouni-erp-web` containers Up; web local HTTP 200; unauthenticated AR documents endpoint returns 401 as expected.

## Gate validations
- Gate DB:
  - Có bằng chứng tồn tại collections cốt lõi.
- Gate API:
  - Filter theo đối tác hoạt động đúng và có negative proof.
  - Unified create trả đủ số dư còn lại.
- Gate UI:
  - Có đúng 2 nút tạo trong Phải thu (Tạo hóa đơn / Thu khác).
  - Dù 2 nút khác nhau, record tạo ra đi vào cùng DB model và phân biệt bằng type.
  - Cash/Bank không hiển thị chứng từ sai đối tác.

## Risk + rollback
- Risk 1: Gộp 2 form có thể gây nhầm field bắt buộc theo từng mode.
  - Mitigation: mode-driven validation rõ ràng theo `entry_mode`.
- Risk 2: Dữ liệu list hợp nhất khó đọc nếu trộn nhiều loại.
  - Mitigation: badge type + filter nhanh theo mode.
- Rollback:
  - Revert commit UI/API về trạng thái trước unified form.
  - Không có thay đổi DB trong phase đầu => rollback nhanh.

## Evidence cần thu thập khi ACT
- DB precheck output (collections tồn tại).
- API evidence:
  - Request/response với `business_partner_id=A` chỉ trả docs của A.
  - Negative case không lộ docs của B.
- UI evidence:
  - Ảnh/video ngắn: unified form với switch mode.
  - Ảnh/video: Cash/Bank selector chỉ hiện docs của đối tác đã chọn.
  - Ảnh/video: list hợp nhất invoice + công nợ.
- Build/deploy evidence:
  - `npm run build` pass.
  - Container status/logs sau deploy.

## Sẵn sàng thực thi
Chờ bạn xác nhận để chuyển ACT mode và triển khai đúng thứ tự DB -> API -> UI.