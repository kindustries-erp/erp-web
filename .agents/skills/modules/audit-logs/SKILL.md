---
name: audit-logs
description: Module tri thức Nhật ký hoạt động V2 trong erp-web gồm lõi src/v2/core/audit và module src/v2/modules/audit-logs (route /v2/admin/audit-logs, API /api/v2/audit-logs). Trang chỉ đọc, drawer view mode render thông tin, tách hoàn toàn khỏi audit V1.
---

# Module Tri Thức: Audit Logs V2 - Frontend (`erp-web`)

## 1. Phạm vi

- Route: `/v2/admin/audit-logs` (`V2AdminRouteId.AUDIT_LOGS`), quyền `admin_users:read` (`AuditLogsGuarded`, không đủ quyền thì không gọi API).
- Backend: `/api/v2/audit-logs` (bảng `audit_logs`), gồm `column-options` và `:entityType/:entityId/timeline`. Audit V1 (`/api/v1/audit-logs-core`, bảng `erp_audit_logs`) tách riêng; V2 không import V1 (test `src/shared/utils/noAuditV1V2Mix.test.ts`).
- Trang chỉ đọc: không tạo, sửa, xóa.

## 2. Cấu trúc

```text
src/v2/core/audit/                  # lõi họ audit
├── core.manifest.json
├── audit.config.type.ts            # AuditModuleConfig
├── audit.locale.ts                 # i18n VI/EN v2.audit.*
├── api/                            # AuditApi {list, options}, createAuditKeys, useAuditLogsQuery, dto AuditLogRow
├── domain/rules/auditRules.ts      # isAuditFailed, toSnapshotEntries
├── components/                     # AuditStatusBadge, AuditTable (cột + view overview/all), AuditLogView
├── drawers/AuditLogDrawer.tsx      # chỉ xem, V2DrawerRowList (không ô nhập)
└── hooks/useAuditListController.ts # drawer, view mode, lỗi tải
src/v2/modules/audit-logs/
├── api/auditLogsV2Api.ts           # client /api/v2/audit-logs
├── api/auditLogsAdapter.ts         # V2TableQuery -> query API, ghép AuditApi
├── auditLogs.config.ts             # tableId erp-audit-logs-table, permission admin_users
└── pages/AuditLogsPage(.hook).tsx, AuditLogsGuarded.tsx
```

## 3. Hành vi

- Cột: Thời gian (lọc khoảng ngày `createdAt` -> `date_from/date_to`), Người thực hiện, Module, Hành động, Đối tượng, Mã đối tượng, Trạng thái, Phương thức, Màn hình, Thông điệp. Lọc/tìm theo cột và sort chạy server; lọc theo giá trị dùng `column-options`.
- Bấm email người thực hiện mở `AuditLogDrawer`: nhãn - giá trị, snapshot trước/sau làm phẳng một cấp, khối lỗi chỉ khi trạng thái lỗi.
- Đăng ký trang: `v2PageRegistry.tsx` (marker `v2-module:audit-logs`).
- E2E: `e2e/audit-logs.e2e.mjs` (cần `E2E_PASSWORD`).
