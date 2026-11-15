import type { UserApi } from "./api/userApi.type";
import type { UserKeys } from "./api/userKeys";

/** Cấu hình để một module ghép lõi họ users: API, khóa cache, bảng, quyền và trường bắt buộc */
export interface UserModuleConfig {
  api: UserApi;
  keys: UserKeys;
  /** Id bảng để lưu cấu hình cột của người dùng */
  tableId: string;
  /** Tên collection để kiểm tra quyền (admin_users) */
  permissionCollection: string;
  /** Trường bắt buộc, theo thứ tự hiển thị trên form */
  requiredFields: readonly string[];
  /** Cột hiển thị theo từng chế độ xem hệ thống */
  viewVisibility: Record<string, Record<string, boolean>>;
}
