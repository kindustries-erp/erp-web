import { useQuery } from "@tanstack/react-query";
import type { EmployeeApi } from "../employeeApi.type";
import type { EmployeeKeys } from "../employeeKeys";

/** Danh sách chi nhánh cho ô chọn; chỉ tải khi cần (bộ lọc hoặc drawer đang sửa) */
export function useEmployeeBranchOptionsQuery(
  api: EmployeeApi,
  keys: EmployeeKeys,
  enabled = true,
) {
  return useQuery({
    queryKey: keys.branches(),
    queryFn: () => api.listBranches(),
    enabled,
    staleTime: 5 * 60_000,
  });
}
