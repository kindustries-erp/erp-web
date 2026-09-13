# Task: Enhance GDT Portal Login Mechanism with Captcha (UI)

## Status

- Completed

## Scope

- erp-web: Add API methods `getPortalCaptcha`, `loginPortal` to `erpInvoicesCoreApi.ts`
- erp-web: Create `GdtPortalAuthForm.tsx` component with username, password, captcha base64 display, refresh, and submit
- erp-web: Update `InvoiceSettingsForm.tsx` to use the new authentication form
- erp-web: Update `InvoiceImportSyncDrawer.tsx` to allow quick re-authentication
- erp-web: Unit tests for `GdtPortalAuthForm.test.tsx`

## Checklist

- [x] API Client: Add endpoints in `erpInvoicesCoreApi.ts`
- [x] UI: Create `GdtPortalAuthForm.tsx`
- [x] UI: Integrate into `InvoiceSettingsForm.tsx`
- [x] UI: Integrate into `InvoiceImportSyncDrawer.tsx`
- [x] Tests: Add component test (`GdtPortalAuthForm.test.tsx` - 2 passed)
- [x] Verification: `bun run build`, `bun run check:ci`, `bun run test` (46 test files passed, 215 tests passed)
