import {
  createEmployeeKeys,
  EMPLOYEE_VIEW_VISIBILITY,
} from "@/v2/core/employees";
import type { EmployeeModuleConfig } from "@/v2/core/employees";
import { employeesManagementApi } from "./api/employeesManagementApi";

/** Cấu hình ghép lõi họ employees cho module employees-management: API, khóa cache, bảng và quyền riêng */
export const employeesManagementConfig: EmployeeModuleConfig = {
  api: employeesManagementApi,
  keys: createEmployeeKeys(["v2-employees-management"]),
  tableId: "erp-employees-management-table",
  permissionCollection: "employees",
  viewVisibility: EMPLOYEE_VIEW_VISIBILITY,
};
