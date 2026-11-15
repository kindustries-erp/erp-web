import { useQuery } from "@tanstack/react-query";
import { usersV2Api } from "../usersApi";
import type { UserKeys } from "../userKeys";

/** Danh sách nhân viên để chọn liên kết; chỉ tải khi drawer đang mở */
export function useUserEmployeeOptionsQuery(keys: UserKeys, enabled: boolean) {
  return useQuery({
    queryKey: keys.employeeOptions(),
    queryFn: () => usersV2Api.listEmployees(),
    enabled,
    staleTime: 60_000,
  });
}
