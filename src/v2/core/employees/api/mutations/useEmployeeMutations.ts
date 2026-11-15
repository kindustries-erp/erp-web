import { useMutation, useQueryClient } from "@tanstack/react-query";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { EmployeeFormValue, EmployeeRecord } from "../../domain/employee";
import type { EmployeeApi } from "../employeeApi.type";
import type { EmployeeKeys } from "../employeeKeys";

type Translate = (key: string, fallback?: string) => string;

export interface EmployeeMutationConfig {
  api: EmployeeApi;
  keys: EmployeeKeys;
}

const toastError = (title: string, error: unknown, fallback: string) =>
  useV2ToastStore.getState().showToast({
    variant: "destructive",
    title,
    description: extractV2ApiError(error, fallback),
  });

const toastOk = (title: string) =>
  useV2ToastStore.getState().showToast({ variant: "success", title });

/** Tạo mới hoặc cập nhật; thành công làm mới danh sách và gọi `onSaved` */
export function useSaveEmployeeMutation(
  t: Translate,
  onSaved: (saved: EmployeeRecord) => void,
  { api, keys }: EmployeeMutationConfig,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      form,
    }: {
      id: string | null;
      form: EmployeeFormValue;
    }) => (id ? api.update(id, form) : api.create(form)),
    onSuccess: async (saved, { id }) => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
      toastOk(
        id
          ? t("v2.employees.form.updateSuccess", "Đã cập nhật nhân viên")
          : t("v2.employees.form.createSuccess", "Đã tạo nhân viên"),
      );
      onSaved(saved);
    },
    onError: (error, { id }) =>
      toastError(
        id
          ? t("v2.employees.form.updateError", "Cập nhật thất bại")
          : t("v2.employees.form.createError", "Tạo mới thất bại"),
        error,
        t("v2.employees.form.saveError", "Không thể lưu nhân viên"),
      ),
  });
}

/** Đổi trạng thái đang làm / nghỉ việc */
export function useToggleEmployeeStatusMutation(
  t: Translate,
  onDone: () => void,
  { api, keys }: EmployeeMutationConfig,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.setStatus(id, active ? "ACTIVE" : "INACTIVE"),
    onSuccess: async (_saved, { active }) => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
      toastOk(
        active
          ? t("v2.employees.status.activated", "Đã chuyển sang đang làm")
          : t("v2.employees.status.deactivated", "Đã chuyển sang nghỉ việc"),
      );
      onDone();
    },
    onError: (error) => {
      const msg = t("v2.employees.status.error", "Không đổi được trạng thái");
      toastError(msg, error, msg);
    },
  });
}

/** Xóa mềm; backend chặn khi còn liên kết tài khoản */
export function useDeleteEmployeeMutation(
  t: Translate,
  onDone: () => void,
  { api, keys }: EmployeeMutationConfig,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
      toastOk(t("v2.employees.delete.success", "Đã xóa nhân viên"));
      onDone();
    },
    onError: (error) => {
      const msg = t("v2.employees.delete.error", "Không xóa được nhân viên");
      toastError(msg, error, msg);
    },
  });
}
