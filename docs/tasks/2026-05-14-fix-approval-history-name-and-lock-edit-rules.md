# Task: FIX - Cash/Bank approval history hiển thị tên người duyệt + khóa chỉnh sửa sau duyệt/post (giữ editable chứng từ liên quan)

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu:
  1. Revert lại flow ERP PLAN mode: chỉ plan, chờ duyệt rồi mới thực thi/post.
  2. Trong UI lịch sử duyệt đang hiện id, cần hiển thị tên người duyệt.
  3. Khi phiếu đã duyệt hoặc đã post thì không cho edit phiếu tiền mặt/tiền gửi.
  4. Riêng field chọn chứng từ liên quan vẫn cho phép edit.
- Bối cảnh/ngữ cảnh:
  - Scope thuộc ERP Web (TienMat/TienGui + shared panel/history hiển thị approver).
  - Yêu cầu ưu tiên consistency với luồng kiểm soát hiện tại và policy cash/bank đã áp dụng.

## Goal

- Chuẩn hóa lại contract PLAN mode theo đúng guardrail: chỉ lập kế hoạch, không sửa code/DB/deploy trước khi user xác nhận.
- Sửa UI history/chi tiết để người dùng thấy tên người duyệt thay vì UUID/id.
- Áp dụng rule khóa chỉnh sửa sau APPROVED/POSTED cho phiếu cash/bank nhưng vẫn mở chỉnh sửa nhóm `related_documents`.

## Scope

- In-scope:
  - Tài liệu task + plan thực thi DB -> API -> UI cho yêu cầu trên.
  - ERP Web: logic hiển thị approver name, rule editable theo status và ngoại lệ `related_documents`.
  - API contract usage phía web: tận dụng các trường hiện có (`approved_by`, snapshot/name fields nếu có).
- Out-of-scope:
  - Không deploy, không sửa code, không sửa DB trong PLAN mode này.
  - Không đổi business flow ngoài cash/bank voucher + approval history surface liên quan.

## Relevant Files

- `src/modules/finance/api/financeApi.ts` - xác nhận field status/approved_by/related_documents trong contract.
- `src/modules/finance/components/CashVoucherDrawer/index.tsx` - vùng disabled/editable của form cash.
- `src/modules/finance/components/TienGui/BankVoucherDrawer.tsx` - vùng disabled/editable của form bank.
- `src/modules/finance/hooks/useCashVoucherHandlers.ts` - state/viewOnly và submit/update payload cash.
- `src/modules/finance/hooks/useBankVoucherHandlers.ts` - state/viewOnly và submit/update payload bank.
- `src/shared/components/SlidePanel.tsx` - panel hiển thị thông tin người duyệt/lịch sử.
- `src/core/locale/vi.ts`, `src/core/locale/en.ts` - i18n key cho nhãn history/approver nếu cần.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `payment_vouchers.status`
  - `payment_vouchers.approved_by`
  - `payment_vouchers.approved_at`
  - `payment_vouchers.related_documents`
  - (lookup hiển thị tên) collection user/employee mapping hiện hành của ERP API.
- Data nền cần có:
  - Voucher ở các trạng thái `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `POSTED`.
  - Record có `approved_by` để kiểm chứng mapping id -> display name.
- Constraint/index/default cần có:
  - Không yêu cầu migration schema cho fix này nếu API đã trả đủ dữ liệu name/snapshot.
  - Nếu API chưa trả approver name và không có endpoint lookup ổn định thì phát sinh `DB_GAP_FOUND` (cần bổ sung nguồn dữ liệu tên người duyệt ở API/DB).
- Kết quả: `DB_READY`
- Lý do DB_READY (PLAN precheck bằng evidence code):
  - Web contract đã có `approved_by`, `status`, `related_documents` trong `financeApi.ts`.
  - Rule yêu cầu hiện tại thiên về presentation + editable gating ở UI, chưa bắt buộc đổi schema.
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A (chưa phát hiện ở plan hiện tại)

## Plan thực thi theo gate (DB -> API -> UI)

### Gate 1 - DB/Directus verification (read-only, không migrate)

- [ ] Verify qua precheck script/API rằng các field nêu trên tồn tại runtime thật (không chỉ type FE).
- [ ] Lấy mẫu 1-2 voucher đã approved/posted để xác nhận dữ liệu `approved_by` và `related_documents`.
- Gate validation:
  - `DB_READY` giữ nguyên nếu field/data đúng như kỳ vọng.
  - Nếu thiếu dữ liệu tên người duyệt từ nguồn API -> chuyển `DB_GAP_FOUND` và dừng trước Gate 2.

### Gate 2 - API contract handling

- [ ] Inspect endpoint list/detail voucher ở ERP API: xác định field trả về cho approver display (ví dụ `approved_by_name` hoặc qua join user).
- [ ] Nếu API đã có approver name: chuẩn hóa mapper FE để ưu tiên name, fallback an toàn.
- [ ] Nếu API chưa có approver name: lập sub-plan API bổ sung response field (không thực thi trong plan này).
- Gate validation:
  - Có contract rõ ràng “UI không hiển thị id trần nếu có tên”.

### Gate 3 - UI implementation plan

- [ ] Approval history/slide panel: thay render id bằng display name (fallback theo thứ tự: full_name -> username -> id).
- [ ] Lock rule: khi voucher `APPROVED` hoặc `POSTED`:
  - Toàn bộ field phiếu (core voucher data) readonly.
  - Action sửa/xóa không hợp lệ phải ẩn hoặc disable theo đúng flow.
- [ ] Exception rule: nhóm `related_documents` vẫn editable sau duyệt/post.
  - Tách `viewOnly` thành granular flags:
    - `coreFieldsReadOnly`
    - `relatedDocumentsEditable`
  - Chỉ truyền `disabled` vào `RelatedDocumentsEditor` theo flag riêng, không dùng cờ khóa toàn form.
- [ ] Cập nhật i18n text nếu có thay đổi label/tooltip cho trạng thái khóa.
- Gate validation:
  - DRAFT/PENDING: sửa full bình thường.
  - APPROVED/POSTED: chỉ edit được `related_documents`, các field khác khóa.
  - History hiển thị tên người duyệt thay vì UUID/id.

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done (PLAN-only precheck bằng evidence code/contracts)
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 `npm run build`
  - [ ] 4.2 Smoke test flow liên quan (pending runtime deploy)
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Deploy stack liên quan + verify runtime
  - [ ] 5.4 Tổng kết evidence

## Realtime checklist khi EXECUTE (dự kiến)

- [ ] E1: Verify DB/runtime fields bằng script/API
- [ ] E2: Chốt source approver name từ API response
- [ ] E3: Sửa render approval history dùng name fallback chain
- [ ] E4: Refactor edit-lock thành granular lock (core lock, related docs unlock)
- [ ] E5: Smoke matrix theo status DRAFT/PENDING/APPROVED/POSTED cho TienMat + TienGui
- [ ] E6: `npx tsc --noEmit`
- [ ] E7: Commit/push web (và API nếu có)
- [ ] E8: Deploy stack và verify container/log/smoke

## Risk + Rollback

- Risks:
  - Mapping tên người duyệt không nhất quán giữa cash và bank khiến chỗ hiện tên, chỗ còn id.
  - Granular unlock cho `related_documents` có thể vô tình mở thêm field khác nếu control disabled dùng chung.
  - Side effect ở action buttons theo status (approve/post/cancel) nếu lock logic đụng chung condition cũ.
- Rollback plan:
  - Rollback theo commit từng gate (UI mapper, lock granularity tách commit).
  - Nếu lỗi runtime sau deploy: revert commit web, rebuild/redeploy stack web, xác nhận route smoke về trạng thái trước.

## Evidence cần thu thập khi EXECUTE

- DB/API evidence:
  - Kết quả Gate 0 runtime precheck (field tồn tại).
  - JSON sample response có approver name hoặc mapping fallback.
- UI evidence:
  - Screenshot/log smoke history hiển thị tên người duyệt.
  - Smoke matrix 4 trạng thái cho TienMat và TienGui (field core bị khóa, related_documents vẫn sửa được ở APPROVED/POSTED).
- Quality/deploy evidence:
  - `npx tsc --noEmit` pass.
  - Commit hash + push branch.
  - Deploy logs + container status + startup logs.

## Validation Evidence

- DB precheck result: PLAN-only evidence từ contract source đã đọc (`financeApi.ts` có `approved_by/status/related_documents`) và sẽ verify runtime ở bước E1 khi được duyệt thực thi.
- `npx tsc --noEmit`: Chưa chạy (PLAN mode).
- Smoke test: Chưa chạy (PLAN mode).

## Lessons Learned

- Chưa phát sinh (PLAN mode, chưa execute).

## Commit/Push Status

- Web repo: Chưa thực hiện (PLAN mode).
- API repo: Chưa thực hiện (PLAN mode).
- DB/directus staging: Chưa thực hiện (PLAN mode).

## Sẵn sàng thực thi

- PLAN ONLY đã hoàn tất, chưa chạm code/DB/deploy.
- Chờ user xác nhận để chuyển sang EXECUTE theo đúng gate DB -> API -> UI.
