import type { AuditApi } from "./api/auditApi.type";
import type { AuditKeys } from "./api/auditKeys";

/** Cấu hình để một module ghép lõi họ audit */
export interface AuditModuleConfig {
  api: AuditApi;
  keys: AuditKeys;
  /** Id bảng để lưu cấu hình cột của người dùng */
  tableId: string;
  /** Collection để kiểm tra quyền xem nhật ký */
  permissionCollection: string;
  viewVisibility: Record<string, Record<string, boolean>>;
}
