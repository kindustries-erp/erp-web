# Task Artifact: HĐDT Portal Import for ERP Invoice Page

Date: 2026-06-24
Repository: `liouni-erp-web`
Branch: `erp-master`

## Goal

Add a new `HĐDT Portal` tab to the ERP Invoice page to fetch invoices from the portal API, preview them, select which invoices to import, and import the selected items into ERP.

## Scope Implemented

- Added a third tab: `HĐDT Portal`
- Added portal import UI with:
  - Bearer token input
  - date range inputs
  - invoice type selector (`purchase` / `sale`)
  - fetch list action
  - preview table with selectable rows
  - import action
  - success banner and toast message
- Added API methods for portal fetch/import
- Added hook to manage portal import state
- Updated Vietnamese locale strings

## API Endpoints

- `POST /api/v1/erp-invoices/portal/fetch`
- `POST /api/v1/erp-invoices/portal/import`

## Notes

- Uses existing `axiosInstance`
- Uses existing UI primitives from shared components
- No new packages were added
- After successful import, the page switches back to the target direction tab and reloads the invoice list

## Verification

- TypeScript check planned with:
  - `cd /opt/repos/liouni-erp-core/liouni-erp-web && bunx tsc --noEmit`
