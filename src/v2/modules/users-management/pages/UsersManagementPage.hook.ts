import { useUserListController } from "@/v2/core/users";
import { usersManagementConfig } from "../usersManagement.config";

/** Trạng thái màn Quản lý tài khoản: toàn bộ logic nằm ở lõi users, module chỉ truyền cấu hình */
export function useUsersManagementPage() {
  return useUserListController(usersManagementConfig);
}

export type UsersManagementPageState = ReturnType<
  typeof useUsersManagementPage
>;
