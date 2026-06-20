# Task: Fix MO inventory error labels and GI production-order master source

> **Created:** 2026-06-20
> **Lane:** erp-master
> **Repos:** `liouni-erp-api`, `liouni-erp-web`
> **Status:** DONE

## Scope
- API: đổi message lỗi thiếu tồn / thiếu khả dụng từ UUID sang `mã linh kiện — tên linh kiện`.
- Web: chuẩn hóa nguồn danh sách lệnh sản xuất cho form Xuất kho khi `issueType = PRODUCTION` bằng master API thực.

## Result
- API production order validation now formats NVL labels as `sku — itemName` when metadata exists.
- GI production form now consumes a dedicated `productionCoreApi.listMasterOptions()` source instead of ad-hoc mapping from raw list payload.

## Evidence target
- Message lỗi không còn hiện UUID itemId thuần.
- Form GI production load đúng danh sách production orders từ API master.
- Typecheck/lint/test PASS trong phạm vi repo thay đổi.

## Verification
- PASS API: `bun test src/production-core/production-core.service.spec.ts`
- PASS API: `bun run build`
- PASS Web: `bunx tsc --noEmit`
- PASS Web: `bun run lint:check`
- PASS Web: `bunx vitest run`
