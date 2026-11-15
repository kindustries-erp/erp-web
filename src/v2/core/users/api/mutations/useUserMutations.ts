import { useMutation, useQueryClient } from "@tanstack/react-query";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { UserFormValue, UserRecord } from "../../domain/user";
import type { UserApi } from "../userApi.type";
import type { UserKeys } from "../userKeys";

type Translate = (key: string, fallback?: string) => string;

export interface UserMutationConfig {
  api: UserApi;
  keys: UserKeys;
}

const toastError = (title: string, error: unknown, fallback: string) =>
  useV2ToastStore.getState().showToast({
    variant: "destructive",
    title,
    description: extractV2ApiError(error, fallback),
  });

/** Tạo mới hoặc cập nhật; thành công làm mới danh sách và gọi `onSaved` */
export function useSaveUserMutation(
  t: Translate,
  onSaved: (saved: UserRecord) => void,
  { api, keys }: UserMutationConfig,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string | null; form: UserFormValue }) =>
      id ? api.update(id, form) : api.create(form),
    onSuccess: async (saved, { id }) => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: id
          ? t("v2.users.form.updateSuccess", "Đã cập nhật tài khoản")
          : t("v2.users.form.createSuccess", "Đã tạo tài khoản"),
      });
      onSaved(saved);
    },
    onError: (error, { id }) =>
      toastError(
        id
          ? t("v2.users.form.updateError", "Cập nhật thất bại")
          : t("v2.users.form.createError", "Tạo mới thất bại"),
        error,
        t("v2.users.form.saveError", "Không thể lưu tài khoản"),
      ),
  });
}

/** Kích hoạt hoặc ngưng hoạt động tài khoản */
export function useToggleUserStatusMutation(
  t: Translate,
  onDone: () => void,
  { api, keys }: UserMutationConfig,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? api.activate(id) : api.deactivate(id),
    onSuccess: async (_saved, { active }) => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: active
          ? t("v2.users.status.activated", "Đã kích hoạt tài khoản")
          : t("v2.users.status.deactivated", "Đã ngưng hoạt động tài khoản"),
      });
      onDone();
    },
    onError: (error) =>
      toastError(
        t("v2.users.status.error", "Không đổi được trạng thái"),
        error,
        t("v2.users.status.error", "Không đổi được trạng thái"),
      ),
  });
}

/** Đặt lại mật khẩu (thu hồi phiên đăng nhập hiện có ở backend) */
export function useResetUserPasswordMutation(
  t: Translate,
  onDone: () => void,
  { api, keys }: UserMutationConfig,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.resetPassword(id, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.users.reset.success", "Đã đặt lại mật khẩu"),
      });
      onDone();
    },
    onError: (error) =>
      toastError(
        t("v2.users.reset.error", "Không đặt lại được mật khẩu"),
        error,
        t("v2.users.reset.error", "Không đặt lại được mật khẩu"),
      ),
  });
}
