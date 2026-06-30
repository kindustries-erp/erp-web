# Task: Fix N+1 tag requests on Purchase Order list page

**Date**: 2026-06-30  
**Branch**: erp-master  
**Scope**: UI only (Web repo)

## Problem

When navigating to `/purchasing`, the API `/api/v1/sys-tags/entity-tags/list?entityType=erp_purchase_order` is called N times (once per row), causing excessive network requests. The batch API (`/entity-tags/batch`) exists but is not fully effective because:

1. `batchQueries` array is recreated on every render, causing `useBatchEntityTags`'s query key to change constantly → repeated batch calls.
2. `EntityTagSelector` per row renders before the batch API completes → each one fires its own individual request (cache miss race condition).

## Fix

### File 1: `PurchaseOrderListPage.tsx`
- Import `useMemo` from `"react"`.
- Wrap `batchQueries` in `useMemo(() => ..., [items])` to stabilize the reference.
- Pass `batchLoading` as `isTagsLoading` prop to `usePurchaseColumns`.

### File 2: `purchaseColumns.tsx`
- Add `isTagsLoading?: boolean` to `UsePurchaseColumnsOptions`.
- Add `isTagsLoading` to `useMemo` dependency array.
- In the `tags` column cell: render a skeleton when `isTagsLoading`, otherwise render `EntityTagSelector`.

## Verification
- [ ] Only 1 POST to `/entity-tags/batch` on page load.
- [ ] No individual `/entity-tags/list` requests fired on page load.
- [ ] Tag display correct after batch resolves.
- [ ] Tag update per row still works.
- [ ] `bun build` passes.
