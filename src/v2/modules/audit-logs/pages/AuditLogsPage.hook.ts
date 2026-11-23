import { useAuditListController } from "@/v2/core/audit";
import { auditLogsConfig } from "../auditLogs.config";

/** Trạng thái màn Nhật ký hoạt động: logic nằm ở lõi audit, module chỉ truyền cấu hình */
export function useAuditLogsPage() {
  return useAuditListController(auditLogsConfig);
}
