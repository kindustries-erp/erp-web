import type { EmployeeApi } from "./api/employeeApi.type";
import type { EmployeeKeys } from "./api/employeeKeys";

/** Cấu hình để một module ghép lõi họ employees: API, khóa cache, bảng và quyền */
export interface EmployeeModuleConfig {
  api: EmployeeApi;
  keys: EmployeeKeys;
  /** Id bảng để lưu cấu hình cột của người dùng */
  tableId: string;
  /** Tên collection để kiểm tra quyền (employees) */
  permissionCollection: string;
  /** Cột hiển thị theo từng chế độ xem hệ thống */
  viewVisibility: Record<string, Record<string, boolean>>;
}
