import { employeesV2Api, type EmployeeApi } from "@/v2/core/employees";

/** API client của module employees-management: uỷ quyền cho client `/api/v2/employees` của lõi employees */
export const employeesManagementApi: EmployeeApi = {
  list: employeesV2Api.list,
  options: employeesV2Api.options,
  get: employeesV2Api.get,
  getNationalId: employeesV2Api.getNationalId,
  nextCode: employeesV2Api.nextCode,
  create: employeesV2Api.create,
  update: employeesV2Api.update,
  setStatus: employeesV2Api.setStatus,
  remove: employeesV2Api.remove,
  listBranches: employeesV2Api.listBranches,
};
