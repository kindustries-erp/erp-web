import { createUserKeys, userViewVisibility } from "@/v2/core/users";
import type { UserModuleConfig } from "@/v2/core/users";
import { usersManagementApi } from "./api/usersManagementApi";

/** Cấu hình ghép lõi họ users cho module users-management: API, khóa cache, bảng và quyền riêng */
export const usersManagementConfig: UserModuleConfig = {
  api: usersManagementApi,
  keys: createUserKeys(["v2-users-management"]),
  tableId: "erp-users-management-table",
  permissionCollection: "admin_users",
  requiredFields: [],
  viewVisibility: userViewVisibility,
};
