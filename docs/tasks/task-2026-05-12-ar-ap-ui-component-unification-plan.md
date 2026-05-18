# Task: Chuẩn hóa component Search/Filter/Select/Date + Modal cho Phải thu/Phải trả theo pattern Tiền mặt (PLAN mode)

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu: Fix các component tìm kiếm, filter, search, select option, date select trong Phải thu/Phải trả và modal liên quan; bắt buộc tái sử dụng component đã dùng ở Tiền mặt/modal Tiền mặt để UI đồng nhất design system.
- Bối cảnh/ngữ cảnh: ERP PLAN mode, chưa được phép sửa code/DB/deploy.

## Goal

Lập kế hoạch triển khai chuẩn hóa UI controls và modal ở luồng Phải thu/Phải trả theo reusable-first, bám chặt pattern đã dùng tại Tiền mặt, đảm bảo đồng nhất UX/UI và không phá flow dữ liệu hiện có.

## Scope

- In-scope:
  - Lập kế hoạch chi tiết theo thứ tự DB -> API -> UI.
  - Xác định component chuẩn cần tái dùng từ Tiền mặt.
  - Xác định file impacted tại AR Workbench + Partner Ledger (Phải thu/Phải trả).
  - Định nghĩa gate validations, risk/rollback, evidence checklist.
- Out-of-scope:
  - Chỉnh sửa code.
  - Chạy migration/schema change.
  - Build/deploy runtime.

## Relevant Files

- `src/pages/PhaiThu.tsx` - entry page Phải thu, route chứa AR Workbench + legacy ledger.
- `src/pages/PhaiTra.tsx` - entry page Phải trả, route legacy ledger.
- `src/modules/finance/components/PartnerLedgerPage/PartnerLedgerFilters.tsx` - hiện có `select` + `input type=date`; cần chuẩn hóa theo pattern Tiền mặt.
- `src/modules/finance/components/ArWorkbenchPanel/index.tsx` - invoice tab có search/select/date trong drawer và list filter.
- `src/modules/finance/components/ArWorkbenchPanel/PaymentReceiptsTab.tsx` - drawer phiếu thu có select/date.
- `src/modules/finance/components/ArWorkbenchPanel/CustomerAdvancesTab.tsx` - drawer đặt cọc có select/date.
- `src/modules/finance/components/ArWorkbenchPanel/AdvanceApplicationsTab.tsx` - form cấn trừ có select/date.
- `src/modules/finance/components/VoucherFilterBar/index.tsx` - pattern filter bar chuẩn của Tiền mặt.
- `src/modules/finance/components/CashVoucherDrawer/index.tsx` - pattern modal/drawer chuẩn của Tiền mặt.
- `src/shared/components/SearchInput/index.tsx` - search control dùng chung.
- `src/shared/components/Combobox/index.tsx` - searchable single-select chuẩn.
- `src/shared/components/DrawerModal/index.tsx` - modal/drawer nền tảng + style token.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `ar_documents`, `ar_document_lines`, `payment_vouchers`, `ar_applications`.
  - `business_partners`, `chart_of_accounts`.
- Data nền cần có:
  - Dữ liệu đối tác, tài khoản kế toán, chứng từ AR/AP để render filter options + list.
- Constraint/index/default cần có:
  - Không đổi schema trong task này; chỉ verify các collection phục vụ filter/search/date đã tồn tại để scope giữ ở UI/API wiring.
- Kết quả: `DB_READY`
- Evidence precheck:
  - `/fields/ar_documents` = 200
  - `/fields/ar_document_lines` = 200
  - `/fields/payment_vouchers` = 200
  - `/fields/ar_applications` = 200
  - `/fields/business_partners` = 200
  - `/fields/chart_of_accounts` = 200
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Execution Plan (DB -> API -> UI)

### 1) DB Gate (read-only verification)

1.1 Xác nhận lại map collections/fields đang dùng trong AR/AP filters và modal để tránh assume sai tên field.
1.2 Chốt phạm vi "không đổi schema"; chỉ cho phép UI/API refactor tái sử dụng component.
1.3 Nếu phát hiện field thiếu thực sự trong môi trường staging thì dừng tại Gate 1 và mở DB task riêng.

### 2) API Gate (contract alignment, không đổi nghiệp vụ)

2.1 Rà soát các API contracts đang feed options/filter cho AR/AP (`financeApi.ts`, các hook liên quan) để thống nhất shape option cho `Combobox`/`SearchInput`/date handler.
2.2 Chuẩn hóa mapping option label/value tại `modules/finance/types` hoặc `utils` (không để rải rác trong component).
2.3 Giữ backward compatibility: không đổi endpoint semantics, không đổi payload nghiệp vụ.

### 3) UI Gate (reusable-first theo Tiền mặt)

3.1 PartnerLedger:

- Thay `select` thuần cho status bằng pattern control đồng nhất (ưu tiên `Combobox` nếu phù hợp).
- Thay `input type=date` bằng control date thống nhất với Tiền mặt/modal Tiền mặt (cùng class/token/hành vi).
- Giữ `SearchInput` nhưng đồng bộ spacing, label, reset hành vi theo `VoucherFilterBar`.

  3.2 AR Workbench invoice list + tabs:

- Chuẩn hóa search/filter toolbar theo pattern Tiền mặt.
- Chuẩn hóa select/date controls trong các modal: `SalesInvoiceDrawer`, `PaymentReceiptsTab`, `CustomerAdvancesTab`, `AdvanceApplicationsTab`.
- Đảm bảo modal shell, field grouping, actions theo chuẩn `DrawerModal`/`CashVoucherDrawer`.

  3.3 Design system consistency:

- Đồng bộ typography, spacing, border radius, input height, focus/hover states.
- Không hardcode label text trong shared component; dùng i18n key cho text hiển thị.

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

## Gate Validations

- Gate 1 (DB): tất cả collections bắt buộc tồn tại và truy cập được qua precheck.
- Gate 2 (API): option/filter contracts sau refactor không đổi behavior endpoint, không breaking type.
- Gate 3 (UI):
  - AR/AP toolbar + modal dùng lại component/pattern từ Tiền mặt.
  - UI states (empty/loading/error) còn hoạt động.
  - i18n keys đầy đủ vi/en cho text mới nếu phát sinh.

## Risk + Rollback

- Risk 1: Refactor control gây lệch query params/filter behavior.
  - Mitigation: giữ nguyên filter state contract + snapshot compare trước/sau.
  - Rollback: revert từng commit theo gate (UI commit riêng, API commit riêng).
- Risk 2: Đồng nhất UI làm mất behavior đặc thù của tab AR.
  - Mitigation: giữ domain-specific behavior trong hooks, chỉ chuẩn hóa presentation layer.
  - Rollback: restore component cũ cho tab bị ảnh hưởng, giữ reusable components mới ở nhánh phụ.
- Risk 3: i18n key thiếu gây fallback text lỗi.
  - Mitigation: checklist i18n trong gate validation.
  - Rollback: revert locale patch độc lập.

## Danh sách Evidence cần thu thập khi thực thi

1. DB precheck output (HTTP 200 cho collections bắt buộc).
2. Before/after ảnh hoặc mô tả so sánh UI filter/search/select/date tại:
   - Phải thu: AR Workbench + legacy ledger.
   - Phải trả: legacy ledger.
3. Danh sách file thay đổi thực tế theo gate DB/API/UI.
4. Kết quả `npx tsc --noEmit`.
5. Smoke test thao tác:
   - Search, filter select, chọn ngày, reset filter.
   - Mở/đóng modal liên quan, submit draft cơ bản (nếu có).
6. Ghi nhận compatibility: không đổi flow dữ liệu cũ, không breaking API.

## Validation Evidence

- DB precheck result: `DB_READY` (đã verify read-only).
- `npx tsc --noEmit`: CHƯA CHẠY (PLAN mode).
- Smoke test: CHƯA CHẠY (PLAN mode).

## Lessons Learned

- Chưa phát sinh issue trong pha lập kế hoạch.

## Commit/Push Status

- Web repo: Chưa thực hiện (PLAN mode).
- API repo: Chưa thực hiện (PLAN mode).
- DB/directus staging: Không thay đổi schema/data (PLAN mode).

## Sẵn sàng thực thi

ĐÃ SẴN SÀNG chuyển sang execution sau khi user xác nhận. Hiện tại chưa có thay đổi code/DB/deploy.
