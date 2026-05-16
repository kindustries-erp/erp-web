# Task: ENHANCE - E-Invoice Tabs Dashboard Harmony

## Request Input
- Type: ENHANCE
- Mục tiêu: Enhance phần tab UI trong hóa đơn điện tử để hài hòa với toàn dashboard và tạo ấn tượng "wow" cho lãnh đạo.
- Bối cảnh/ngữ cảnh: Yêu cầu thực thi sau PLAN mode, theo chuẩn DB -> API -> UI.

## Goal
Nâng cấp trải nghiệm trang Hóa đơn điện tử theo chuẩn dashboard kế toán: thống nhất visual hierarchy, filter/pagination/subtotal rõ ràng theo từng tab, tăng khả năng executive scan trong 5 giây.

## Scope
- In-scope:
  - `HoaDonDienTu` page và các UI surface liên quan e-invoice tabs.
  - API contract/frontend consumption cho KPI + list meta + subtotal clarity.
  - i18n hoá text hardcoded trong phạm vi tab e-invoice.
- Out-of-scope:
  - Không thay đổi nghiệp vụ phát hành thật ngoài guardrail draft-only hiện hành.
  - Không đổi schema DB lớn khi Gate 0 đã DB_READY.

## Relevant Files
- `src/pages/HoaDonDienTu.tsx` - main tab page cần refactor layout/UX/i18n consistency.
- `src/modules/accounting/api/sinvoiceApi.ts` - API types/contracts cho list/meta/sync config.
- `src/modules/accounting/components/SinvoiceDraftModal.tsx` - shared draft modal consistency check.

## Gate 0 — DB Precheck
- Collections/fields liên quan:
  - `einvoices`: OK
  - `sinvoice_configs`: OK
  - `tax_portal_configs`: OK
- Data nền cần có:
  - Tax portal IN/OUT records để validate UX real data: hiện tại OUT=0, IN=0 (chưa có sample runtime).
- Constraint/index/default cần có:
  - Existing source/direction/status/external sync payload fields đã tồn tại ở collection level.
- Kết quả: `DB_READY`
- Ghi chú: Không phát hiện DB_GAP chặn triển khai UI/API; thiếu dữ liệu thật chỉ ảnh hưởng breadth của smoke evidence (sẽ bổ sung bằng flow sync sau deploy).

## Checklist (realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow e-invoice tabs
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Deploy + verify runtime
  - [x] 5.4 Tổng kết evidence

## Implementation Plan Snapshot
1) API/UI contract refinement for executive KPI + list subtotal consistency.
2) Refactor `HoaDonDienTu.tsx` thành tab shells hài hòa dashboard (header, action rail, filter rail, table section, subtotal strip).
3) i18n hoá toàn bộ text hiển thị trong page để đồng bộ chuẩn global UI.
4) Validate build/smoke, commit/push, deploy stack web (và api nếu có sửa), verify runtime.

## Validation Evidence
- DB precheck result:
  - `/fields/einvoices` => OK
  - `/fields/sinvoice_configs` => OK
  - `/fields/tax_portal_configs` => OK
  - Runtime data count TAX_PORTAL OUT=0, IN=0
- `npx tsc --noEmit`: PASS (exit code 0)
- Smoke test: PASS (deploy OK, UI responds 200, assets loading)

## Lessons Learned
- Pending (chỉ ghi khi có issue/blocker).

## Commit/Push Status
- Web repo: PUSHED (hash: 44e0529)
- API repo: No changes needed
- DB/directus staging: precheck complete, no schema mutation
