# Task: GDT Portal Auto Re-login UI & Client Update

## Mục tiêu

- Cập nhật client API `getPortalConfig` nhận `hasPassword: boolean` thay vì mật khẩu plain text.
- Cập nhật hook `usePortalSync`:
  - Thêm state `hasPassword`, `needsRelogin`, `username`.
  - Bắt lỗi token hết hạn và re-login thất bại để kích hoạt `needsRelogin`.
- Cập nhật `InvoiceImportSyncDrawer`:
  - Cho phép đồng bộ và tải lại XML khi đã có mật khẩu lưu trong DB (`hasPassword === true`).
  - Tự động mở form đăng nhập khi `needsRelogin === true`.
- Cập nhật `GdtPortalAuthForm`:
  - Ghi nhận trạng thái `hasSavedPassword`.

## Trạng thái thực hiện (Checklist)

- [x] Cập nhật `erpInvoicesCoreApi.ts`
- [x] Cập nhật `usePortalSync.ts`
- [x] Cập nhật `GdtPortalAuthForm.tsx`
- [x] Cập nhật `InvoiceImportSyncDrawer.tsx`
- [x] Chạy unit test & QC (218/218 tests pass, check:ci pass, build pass)
