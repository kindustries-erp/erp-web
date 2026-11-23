import { auditViewVisibility, createAuditKeys } from "@/v2/core/audit";
import type { AuditModuleConfig } from "@/v2/core/audit";
import { auditLogsAdapter } from "./api/auditLogsAdapter";

/** Cấu hình ghép lõi họ audit cho module audit-logs */
export const auditLogsConfig: AuditModuleConfig = {
  api: auditLogsAdapter,
  keys: createAuditKeys(["v2-audit-logs"]),
  tableId: "erp-audit-logs-table",
  permissionCollection: "admin_users",
  viewVisibility: auditViewVisibility,
};
