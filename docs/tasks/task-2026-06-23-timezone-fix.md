# Task: Improve Date and Time UI Formats (2026-06-23)

## Objective

Display correct UTC+7 time with precise date formatting and tooltips in tracking, vouchers, and inventory views.

## Actions Taken

- `OpeningBalanceTable.tsx`: Integrated `formatGMT7("date")` for `balance_date`.
- `VoucherTable/index.tsx`: Used `formatGMT7` with `datetime` to show accurate hours/minutes.
- `ErpWarehouseTab.tsx`: Refactored `date` cell to use `Tooltip` for full `datetime-sec` while showing dotted `date` overview.
- `TrackedGoodsPage.tsx`: Same implementation of `Tooltip` to hover for `datetime-sec`.
- `stockColumns.tsx`: Same standard applied to `last_transaction_date` in inventory views.

## Next Steps

- Extend `formatGMT7` timezone rules across new pages natively.
