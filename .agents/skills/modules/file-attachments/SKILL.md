---
name: file-attachments
description: Module web V2 file đính kèm dùng chung - client/hook src/v2/shared/files, organism V2AttachmentsPanel, tab "Tài liệu" ở drawer hóa đơn V2 và trang /v2/file-attachments (Quản lý tài liệu). Đọc khi gắn panel cho owner mới hoặc sửa trang quản lý.
---

# 📎 Module Web Tri Thức: File Attachments (`file-attachments`)

Backend: module skill `file-attachments` của erp-api (hợp đồng, xóa cứng, thêm owner).

## 1. Thành phần
- **Client/hook dùng chung** `src/v2/shared/files/`: `createV2OwnerFilesApi(basePath)` (`list`, `upload(files, category)`, `remove`, `downloadUrl(id, inline)`); `useV2OwnerFilesQuery`, `useV2UploadFilesMutation`, `useV2DeleteFileMutation`; key `v2FilesKeys`. `list` trả `{ items, policy, categories }` lấy từ `extraData` của API, web không hardcode giới hạn.
- **Organism** `src/v2/shared/components/organisms/v2-attachments-panel/` (`V2AttachmentsPanel`, props `api`, `canEdit`, `defaultCategory`): `V2FileUpload` (accept/maxSize/maxFiles từ policy), danh sách, xem trước bằng `V2FilePreviewPanel` (URL ký `inline`), tải về, xóa qua `V2ConfirmModal`; xóa file đang xem trước thì đóng preview. Locale `v2.attachmentsPanel.*`. `formatFileSize(0)` trả "—" (dữ liệu legacy chưa có dung lượng).
- **Tab "Tài liệu" ở hóa đơn**: `finance-invoice/drawers/InvoiceShapeDetailDrawer.tsx` có hai tab `info` và `documents`; `InvoiceAttachmentsTab` gọi `/api/v2/invoices/:id/attachments`, `canEdit` = quyền `invoices.update`; badge = số file (cùng query key với panel nên không gọi thêm). Key locale `v2.financeInvoiceSync.detail.*`.
- **Trang quản lý** `src/v2/modules/file-attachments/` (URL chính `/file-attachments`, slug cũ `/attachments` cùng trỏ về; `/v2/file-attachments` chỉ để demo/test; quyền đọc `attachments`; PageKey `file-attachments`): bảng server-mode; nhóm lọc có sẵn "Tất cả / Đã xóa" (`deleted: "only"`, đổi lọc thì reset chọn và bảng); ở chế độ Đã xóa và có quyền `purge` mới hiện cột chọn và nút "Xóa vĩnh viễn (n)" (modal xác nhận; toast tóm tắt `purged`, `objectKept`, `skipped` kèm lý do trong `usePurgeFlow.ts`); drawer chi tiết chỉ đọc có preview; `RetentionSettingsDrawer` (công tắc mặc định tắt, số ngày 1..3650, chỉ sửa được khi có quyền `attachments.update`).

## 2. Quy tắc
- Nút xóa vĩnh viễn phụ thuộc action `purge` hoặc `*` của `attachments`; ma trận RBAC chưa có cột purge nên hiện chỉ Super Admin.
- Gắn panel cho owner mới: `createV2OwnerFilesApi('/api/v2/<owner>/:id/attachments')` + `V2AttachmentsPanel` trong tab của drawer; không thêm client riêng.
- Module và shared V2 không import V1.

## 3. Kiểm thử
- Vitest: `src/v2/shared/files`, `v2-attachments-panel`, `src/v2/modules/file-attachments`.
- E2E (staging/dev, admin seed qua `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`): `bun run e2e:invoice-attachments` (11 kiểm tra: tab, upload, xem trước, xóa có modal, xóa mềm) và `bun run e2e:file-attachments` (12 kiểm tra: lọc Đã xóa, xóa vĩnh viễn qua modal, cài đặt lưu giữ; tự khôi phục cài đặt). Helper chung `e2e/file-attachments-helpers.mjs`.
