# Task Template

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu: Gỡ toàn bộ flow Đặt cọc/Customer Advance và mọi reference UI/type với `CUSTOMER_ADVANCE_RECEIPT`, `customer-advances`, `advance-applications`, `ar_advance_*` khỏi ERP Web.
- Bối cảnh/ngữ cảnh: User đổi scope từ drop 4 field sang hard-remove toàn bộ flow đặt cọc; repo web còn enum/type/helper/legacy block trong `financeApi.ts`, handlers và form types.

## Goal

Đảm bảo ERP Web không còn type/runtime dependency vào 4 field `ar_advance_*`, build pass, smoke flow payment vouchers PASS sau deploy.

## Scope

- In-scope:
  - Gỡ type/reference `ar_advance_*` trong web repo
  - Build/smoke route payment vouchers
  - Deploy web staging
- Out-of-scope:
  - Redesign UX đặt cọc/advance mới
  - Refactor module ngoài payment vouchers

## Relevant Files

- `src/modules/finance/api/financeApi.ts` - chứa reference field `ar_advance_*`
- `docs/tasks/20260524-065232-remove-payment-voucher-ar-advance-fields.md` - evidence task

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: `payment_vouchers.ar_advance_*`
- Data nền cần có: DB/runtime đã cleanup xong 4 field
- Constraint/index/default cần có: UI type/contract không còn phụ thuộc 4 field
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `../../directus-staging/ops/tasks/20260524-065232-drop-payment-voucher-ar-advance-fields.md`

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

## Validation Evidence

- DB precheck result:
  - Backup: `/opt/backups/directus-staging/20260524071223-remove-customer-advance/directus-staging-before-change.sql`
  - DB/Directus không còn `ar_advance_*`
- `npm run build`:
  - PASS tại `/opt/repos/liouni-erp/liouni-erp-web`
- Smoke test:
  - `curl https://dev.erp.liouni.com/` => `200`
  - live bundle: `/usr/share/nginx/html/assets/index-D0F5Voom.js`
  - grep live bundle với `CUSTOMER_ADVANCE_RECEIPT|customer-advances|advance-applications|ar_advance_` => `0 matches`

## Lessons Learned

- Cleanup `financeApi.ts` phải cẩn thận với legacy block/comment lồng nhau; build TS bắt được duplicate identifier và dangling legacy types ngay.

## Commit/Push Status

- Web repo: pending commit/push in this task close-out
- API repo: tracked in sibling api task
- DB/directus staging: apply+verify+document complete; no schema mutation needed beyond cleanup verification
