import { useEmployeeListController } from "@/v2/core/employees";
import { employeesManagementConfig } from "../employeesManagement.config";

/** Trạng thái màn Quản lý nhân viên: toàn bộ logic nằm ở lõi employees, module chỉ truyền cấu hình */
export function useEmployeesManagementPage() {
  return useEmployeeListController(employeesManagementConfig);
}

export type EmployeesManagementPageState = ReturnType<
  typeof useEmployeesManagementPage
>;
