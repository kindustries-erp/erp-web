import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useUserEmployeeOptionsQuery } from "../api/queries/useUserEmployeeOptionsQuery";
import { useSaveUserMutation } from "../api/mutations/useUserMutations";
import {
  emptyUserForm,
  type UserFormValue,
  type UserRecord,
} from "../domain/user";
import {
  canEditUserEmail,
  isUserFormDirty,
  validateUserForm,
} from "../domain/rules/userRules";
import type { UserDrawerProps } from "./UserDrawer.type";

const toForm = (data: UserRecord): UserFormValue => ({
  email: data.email ?? "",
  password: "",
  status: data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  employeeId: data.employeeId ?? "",
});

export function useUserDrawer(props: UserDrawerProps) {
  const { t } = useV2Translation();
  const { api, keys } = props.config;
  const userId = props.recordId ?? null;
  const creating = !userId;

  const [mode, setMode] = React.useState(props.mode);
  const [form, setForm] = React.useState<UserFormValue>(emptyUserForm);
  const [initial, setInitial] = React.useState<UserFormValue>(emptyUserForm);
  const [errorKey, setErrorKey] = React.useState<string>("");

  const detail = useQuery({
    queryKey: keys.detail(userId ?? "new"),
    queryFn: () => api.get(userId!),
    enabled: props.open && Boolean(userId),
  });
  const employees = useUserEmployeeOptionsQuery(
    keys,
    props.open && mode === "edit",
  );

  React.useEffect(() => setMode(props.mode), [props.mode, props.open]);
  React.useEffect(() => {
    if (!props.open) return;
    setErrorKey("");
    if (detail.data) {
      const loaded = toForm(detail.data);
      setForm(loaded);
      setInitial(loaded);
    } else if (!userId) {
      const fresh = emptyUserForm();
      setForm(fresh);
      setInitial(fresh);
    }
  }, [props.open, userId, detail.data]);

  React.useEffect(() => {
    if (!detail.error) return;
    const fallback = t("v2.users.form.loadError", "Không thể tải tài khoản");
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(detail.error, fallback),
    });
  }, [detail.error, t]);

  const save = useSaveUserMutation(t, () => props.onClose(), { api, keys });

  const setField = React.useCallback(
    <K extends keyof UserFormValue>(field: K, value: UserFormValue[K]) => {
      setErrorKey("");
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submit = React.useCallback(() => {
    const error = validateUserForm(form, creating);
    if (error) {
      setErrorKey(error);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.users.form.missingInfo", "Thông tin chưa hợp lệ"),
      });
      return;
    }
    save.mutate({ id: userId, form });
  }, [form, creating, save, t, userId]);

  const employeeOptions = React.useMemo(
    () =>
      (employees.data ?? []).map((employee) => ({
        value: employee.id,
        label: `${employee.employeeCode} · ${employee.fullName}`,
      })),
    [employees.data],
  );
  const linked = detail.data?.employee;

  return {
    mode,
    setMode,
    form,
    setField,
    creating,
    viewing: mode === "view" && !creating,
    emailEditable: canEditUserEmail(creating),
    emailError:
      errorKey === "requiredEmail"
        ? t("v2.users.form.requiredEmail", "Email là bắt buộc")
        : errorKey === "invalidEmail"
          ? t("v2.users.form.invalidEmail", "Email không hợp lệ")
          : "",
    passwordError:
      errorKey === "passwordLength"
        ? t("v2.users.form.passwordLength", "Mật khẩu từ 8 đến 72 ký tự")
        : "",
    employeeOptions,
    employeeLoading: employees.isFetching,
    employeeFallbackLabel: linked
      ? `${linked.employeeCode} · ${linked.fullName}`
      : undefined,
    dirty: isUserFormDirty(form, initial),
    loading: detail.isFetching,
    saving: save.isPending,
    submit,
  };
}
