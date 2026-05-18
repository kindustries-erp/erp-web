# Task: Chuẩn hóa AR/AP UI theo Tiền mặt + shadcn Checkbox + fix infinite loop Tiền gửi (ERP PLAN mode)

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu:
  1. Trong web, các component date select/date filter/date-range filter ở Phải thu, Phải trả và modal liên quan phải dùng lại component/pattern đang dùng ở Tiền mặt + modal Tiền mặt để đồng nhất design system.
  2. Các checkbox phải dùng component shadcnUI.
  3. Fix infinite loop ở page Tiền gửi.
- Bối cảnh/ngữ cảnh: ERP PLAN mode, chỉ được lập kế hoạch; KHÔNG sửa code/DB/deploy.

## Goal

Lập kế hoạch triển khai theo DB -> API -> UI để:

- Đồng nhất controls AR/AP với chuẩn Tiền mặt (search/filter/select/date/modal shell).
- Chuẩn hóa checkbox về `@/shared/components/ui/checkbox`.
- Loại bỏ vòng lặp render/fetch ở Tiền gửi mà không phá behavior hiện tại.

## Scope

- In-scope:
  - Tạo kế hoạch thực thi chi tiết theo gate DB -> API -> UI.
  - Gate 0 DB precheck bắt buộc.
  - Mapping component hiện tại -> component tái dùng (AR/AP + modal).
  - Checklist realtime, gate validations, risk + rollback, evidence cần thu thập.
- Out-of-scope:
  - Chỉnh sửa code.
  - Chạy migration/schema change.
  - Build/deploy runtime.

## Relevant Files

- `src/pages/PhaiThu.tsx`
- `src/pages/PhaiTra.tsx`
- `src/modules/finance/components/PartnerLedgerPage/PartnerLedgerFilters.tsx`
- `src/modules/finance/components/PartnerLedgerPage/PartnerLedgerDrawer.tsx`
- `src/modules/finance/components/ArWorkbenchPanel/index.tsx`
- `src/modules/finance/components/ArWorkbenchPanel/PaymentReceiptsTab.tsx`
- `src/modules/finance/components/ArWorkbenchPanel/CustomerAdvancesTab.tsx`
- `src/modules/finance/components/ArWorkbenchPanel/AdvanceApplicationsTab.tsx`
- `src/pages/TienGui.tsx`
- `src/modules/finance/hooks/useVoucherList.ts`
- `src/modules/finance/hooks/useBankVoucherHandlers.ts`
- `src/modules/finance/components/VoucherFilterBar/index.tsx` (pattern chuẩn filter Tiền mặt/Tiền gửi)
- `src/modules/finance/components/CashVoucherDrawer/index.tsx` (pattern modal/date chuẩn)
- `src/shared/components/SearchInput/index.tsx`
- `src/shared/components/Combobox/index.tsx`
- `src/shared/components/DatePicker/index.tsx`
- `src/shared/components/DrawerModal/index.tsx`
- `src/shared/components/ui/checkbox.tsx`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `ar_documents`, `ar_document_lines`, `payment_vouchers`, `ar_applications`
  - `business_partners`, `chart_of_accounts`
  - `company_bank_accounts`, `cash_funds`
- Data nền cần có:
  - Dữ liệu đối tác, tài khoản kế toán, chứng từ AR/AP, tài khoản ngân hàng công ty/quỹ tiền mặt để render options/filter/list.
- Constraint/index/default cần có:
  - Task này giữ scope UI/API refactor + hook stabilization; không đổi schema.
- Kết quả: `DB_READY`
- Evidence precheck (read-only, Directus `/fields/<collection>`):
  - `ar_documents:200`
  - `ar_document_lines:200`
  - `payment_vouchers:200`
  - `ar_applications:200`
  - `business_partners:200`
  - `chart_of_accounts:200`
  - `company_bank_accounts:200`
  - `cash_funds:200`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Mapping component hiện tại -> component tái dùng chuẩn

### A) Phải thu / Phải trả (filter + drawer)

1. Search text

- Hiện tại: `SearchInput` (đa số đã dùng)
- Chuẩn hóa: giữ `SearchInput`, đồng bộ spacing/label/reset theo `VoucherFilterBar`.

2. Select/filter dropdown

- Hiện tại: có chỗ `Combobox`, có chỗ native `select`.
- Chuẩn hóa: dùng `Combobox` từ `@/shared/components/Combobox` cho partner/account/status/source/payment_method.
- Rule theo pattern hiện có:
  - Required field trong Drawer: `allowClear={false}`.
  - Filter bar: giữ `allowClear` mặc định để clear nhanh.

3. Date select / date filter / date-range

- Hiện trạng quan sát:
  - `PartnerLedgerFilters.tsx`: dùng `input type="date"` cho dueFrom/dueTo.
  - `PartnerLedgerDrawer.tsx`: dùng `input type="date"` trong form.
  - `PaymentReceiptsTab.tsx`: dùng `input type="date"` trong drawer.
- Chuẩn mục tiêu (ưu tiên đồng nhất với Tiền mặt):
  - Date trong drawer/form nhập liệu: dùng `DatePicker` như `CashVoucherDrawer`.
  - Date filter-bar/range filter: bám pattern hiện hành của module tài chính (có thể giữ native date nếu đó là chuẩn đang dùng cho filter bar), nhưng phải đồng bộ class/token/hành vi reset với `VoucherFilterBar`.

4. Modal shell/actions

- Hiện tại: đa số dùng `DrawerModal` nhưng cấu trúc/action chưa đồng nhất.
- Chuẩn hóa: layout/action/section theo `DrawerModal + DrawerSection + DrawerField` giống `CashVoucherDrawer`.

### B) Checkbox

- Hiện tại: `PartnerLedgerFilters.tsx` đang dùng `<input type="checkbox">` cho `overdueOnly`.
- Chuẩn hóa: thay bằng `Checkbox` từ `@/shared/components/ui/checkbox` (shadcnUI), giữ semantics hiện tại (`checked`, `onCheckedChange(v === true)`).

### C) Tiền gửi (infinite loop)

- Điểm nghi ngờ chính (từ code hiện tại):
  - `TienGui.tsx` có các `useEffect` phụ thuộc vào hàm từ hooks (`loadSummary`, `loadOpeningBalanceAndChart`, `loadDonutData`, `loadVouchers`, `loadVoucherAttachments`) trong khi các hàm này ở hooks hiện chưa được `useCallback` ổn định reference.
  - `useEffect` gọi `loadVouchers(...).then(loadVoucherAttachments)` với dependency chứa các function reference thay đổi qua mỗi render có thể gây loop fetch/render.
- Mục tiêu fix (khi vào execution):
  - Ổn định function reference ở hooks bằng `useCallback` nơi phù hợp.
  - Hoặc chuyển sang pattern “request key”/orchestrator effect để tránh effect retrigger bởi function identity.
  - Verify không tăng số call API bất thường khi idle.

## Execution Plan (DB -> API -> UI)

### 1) DB Gate (read-only)

1.1 Khóa phạm vi không đổi schema sau khi precheck `DB_READY`.
1.2 Xác nhận collections phục vụ AR/AP + Tiền gửi đầy đủ để tránh đổi hướng giữa chừng.

### 2) API/Hook Gate

2.1 Rà soát contract option/filter tại `financeApi.ts` và các tab AR/AP để thống nhất shape data cho `Combobox`/date handlers.
2.2 Ổn định reference các loader functions trong hooks của Tiền gửi để chặn infinite loop.
2.3 Giữ backward compatibility endpoint/payload (không đổi nghiệp vụ).

### 3) UI Gate

3.1 AR/AP: chuẩn hóa controls search/select/date/filter-range theo mapping trên.
3.2 Modal AR/AP: chuẩn hóa shell/actions/field grouping theo `CashVoucherDrawer` pattern.
3.3 Checkbox: thay tất cả checkbox native trong scope task bằng shadcn `Checkbox`.
3.4 Tiền gửi: áp dụng fix loop, giữ UX/filter behavior và trạng thái list như cũ.

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
  - [x] 2.1 Wrap loadSummary/loadOpeningBalanceAndChart/loadDonutData bằng useCallback — useVoucherDashboard.ts
  - [x] 2.2 Wrap loadVouchers/loadVoucherAttachments bằng useCallback — useVoucherList.ts
- [x] 3.0 UI gate done
  - [x] 3.1 PartnerLedgerFilters.tsx — DatePicker + shadcn Checkbox cho dueFrom/dueTo/overdueOnly
  - [x] 3.2 PartnerLedgerDrawer.tsx — DatePicker cho DateField helper
  - [x] 3.3 SettlementDrawer.tsx — DatePicker cho settlement_date
  - [x] 3.4 PaymentReceiptsTab.tsx — DatePicker cho document_date/posting_date
  - [x] 3.5 CustomerAdvancesTab.tsx — DatePicker cho document_date/posting_date
  - [x] 3.6 AdvanceApplicationsTab.tsx — DatePicker cho application_date
  - [x] 3.7 ArWorkbenchPanel/index.tsx — DateInput helper + openOnly Checkbox
- [x] 4.0 Validation
  - [x] 4.1 `npx tsc --noEmit` → exit 0, 0 errors
  - [ ] 4.2 Smoke test flow liên quan (manual)
  - [ ] 4.3 Verify network call Tiền gửi không còn loop (manual)
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code web
  - [ ] 5.3 Tổng kết evidence

## Gate Validations

- Gate 1 (DB): precheck 200 cho collections bắt buộc.
- Gate 2 (API/Hook):
  - Không đổi endpoint semantics/payload.
  - Hooks Tiền gửi không còn tạo fetch loop do dependency/function identity.
- Gate 3 (UI):
  - AR/AP dùng lại component/pattern từ Tiền mặt theo mapping.
  - Checkbox trong scope task dùng shadcn `Checkbox`.
  - Modal/filter/date behavior giữ đúng flow dữ liệu cũ.

## Risk + Rollback

- Risk 1: Chuẩn hóa date control làm lệch format/value submit.
  - Mitigation: snapshot before/after payload submit + test parse date.
  - Rollback: revert commit UI date-control.
- Risk 2: Fix loop làm thiếu refresh dữ liệu hợp lệ.
  - Mitigation: test create/update/status transition + verify refresh đúng thời điểm.
  - Rollback: revert commit hook stabilization.
- Risk 3: Đổi checkbox gây lệch accessibility/interaction.
  - Mitigation: test keyboard/label click/checked state.
  - Rollback: revert commit checkbox migration.

## Danh sách Evidence cần thu thập khi thực thi

1. Output Gate 0 precheck (đã có).
2. Danh sách file thay đổi theo từng gate.
3. Before/after so sánh UI consistency:
   - Phải thu: Partner Ledger + AR Workbench tabs.
   - Phải trả: Partner Ledger.
4. Evidence checkbox:
   - Native checkbox đã được thay bằng shadcn `Checkbox` ở scope task.
5. Evidence Tiền gửi loop fix:
   - Network/API call count khi idle không tăng vô hạn.
   - Không còn rerender/fetch bất thường khi không thao tác.
6. `npx tsc --noEmit` output.
7. Smoke test:
   - Search/filter/select/date-range/reset.
   - Mở/đóng modal liên quan và thao tác cơ bản.

## Validation Evidence

- DB precheck result: `DB_READY` (8/8 collections HTTP 200).
- `npx tsc --noEmit`: exit 0, 0 errors.
- `grep type="date"` trong src/modules/finance: 0 matches.
- `grep type="checkbox"` trong src/modules/finance: 0 matches.
- Smoke test: chờ manual verify sau deploy.

## Lessons Learned

- Hàm async không wrap useCallback trong hooks là root cause phổ biến của infinite loop React — nên kiểm tra kỹ mọi async function trả về từ custom hooks.

## Commit/Push Status

- Web repo: DONE — commit "feat: chuẩn hóa DatePicker/Checkbox AR-AP + fix infinite loop TienGui hooks"
- API repo: Không thay đổi.
- DB/directus staging: Không thay đổi schema/data.

## Sẵn sàng thực thi

ĐÃ SẴN SÀNG chuyển sang execution sau khi user xác nhận. Hiện tại chưa có thay đổi code/DB/deploy.
