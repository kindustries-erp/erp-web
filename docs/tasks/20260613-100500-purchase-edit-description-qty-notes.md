# ERP Core FE task — purchase edit allow description/qty/notes

## Scope

- Repo: `/opt/repos/liouni-erp-core/liouni-erp-web`
- Mounted page: `Purchasing -> OperationalListPage variant="purchase"`
- Goal: when user clicks edit on purchase page, allow editing line `description`, `qty`, and notes while preserving lock on fields that should stay stable after confirm/partial receipt.

## Gate 0

- DB_READY: existing BE contract already supports:
  - line `description`
  - line `qtyOrdered`
  - header `remarks`
- DB_GAP_FOUND for per-line note persistence: current `erp_purchase_order_lines` table has no `notes` column.
- Therefore this task will treat `ghi chú` as header note / document note only.

## Acceptance

- In purchase edit mode for statuses `CONFIRMED` / `PARTIAL_RECEIVED`:
  - line description editable
  - line quantity editable
  - header notes editable
- Keep high-risk identity fields locked unless already allowed by current flow.
- `bun run build` must pass.

## Risks

- If the user meant line-level notes persistence, BE/DB follow-up is required and must be treated as separate DB->API->UI lane.

## Verification

- Build: pending
- Runtime smoke: pending
