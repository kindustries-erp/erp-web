# Task: MO draft resave, alternative-material UI, and inline GI modal

> **Created:** 2026-06-20
> **Lane:** erp-master
> **Repo:** `liouni-erp-web`
> **Status:** DONE

## Scope
- Allow draft MO in edit mode to save draft again.
- Keep alternative material selection visible after reopening draft/edit modal.
- Show alternative-material column for all BOM rows and use effective inventory balance.
- Open inline goods-issue modal from MO drawer instead of navigating away.

## Result
- Draft edit mode keeps `Lưu Nháp` action and sends `PATCH` update payload.
- BOM table exposes `NVL thay thế` for every row and available quantity follows selected effective item.
- Reopen edit hydrates full BOM plus saved alternative-item overlay.
- `Xuất kho nguyên vật liệu` opens `GiFormDrawer` inline with prefilled production lines.

## Evidence target
- Draft MO can be reopened, edited, and saved again as draft.
- Reopen draft preserves alternative material selection per BOM row.
- BOM detail remains complete on reopen/edit, not only rows with alternatives.
- Clicking export material opens GI modal with detail table prefilled from MO lines.

## Verification
- PASS: `bunx tsc --noEmit`
- PASS: `bun run lint:check`
