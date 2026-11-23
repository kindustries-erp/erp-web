import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";
import type { RoleFormValue } from "../../domain/entities/role";
import { rolesV2Api } from "../rolesApi";
import { rolesKeys } from "../queries/rolesKeys";

type Translate = (key: string, fallback?: string) => string;

export interface SaveRoleInput {
  id: string | null;
  form: RoleFormValue;
}

/** Tạo mới hoặc cập nhật; thành công làm mới danh sách và chạy `onSaved` */
export function useSaveRoleMutation(t: Translate, onSaved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: SaveRoleInput) =>
      id ? rolesV2Api.update(id, form) : rolesV2Api.create(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.rbacRoles.form.saveSuccess", "Đã lưu thành công"),
      });
      onSaved();
    },
    onError: (error) => {
      // Chứng từ đang tham chiếu đã được modal DOCUMENT_IN_USE giải thích
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.rbacRoles.form.saveError",
        "Không thể lưu dữ liệu",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}

/** Xóa mềm; thành công làm mới danh sách và chạy `onRemoved` */
export function useRemoveRoleMutation(t: Translate, onRemoved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesV2Api.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.rbacRoles.delete.success", "Đã xóa"),
      });
      onRemoved();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t("v2.rbacRoles.delete.error", "Không thể xóa");
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}
