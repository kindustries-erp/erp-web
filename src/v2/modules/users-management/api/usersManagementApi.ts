import { usersV2Api, type UserApi } from "@/v2/core/users";

/** API client của module users-management: uỷ quyền cho client `/api/v2/users-management` của lõi users */
export const usersManagementApi: UserApi = {
  list: usersV2Api.list,
  options: usersV2Api.options,
  get: usersV2Api.get,
  create: usersV2Api.create,
  update: usersV2Api.update,
  activate: usersV2Api.activate,
  deactivate: usersV2Api.deactivate,
  resetPassword: usersV2Api.resetPassword,
  timeline: usersV2Api.timeline,
};
