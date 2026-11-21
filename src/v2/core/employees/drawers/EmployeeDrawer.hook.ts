import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useEmployeeBranchOptionsQuery } from "../api/queries/useEmployeeBranchOptionsQuery";
import { useSaveEmployeeMutation } from "../api/mutations/useEmployeeMutations";
import { emptyEmployeeForm, type EmployeeFormValue } from "../domain/employee";
import {
  isEmployeeFormDirty,
  toEmployeeForm,
  validateEmployeeForm,
} from "../domain/rules/employeeRules";
import type { EmployeeDrawerProps } from "./EmployeeDrawer.type";

export function useEmployeeDrawer(props: EmployeeDrawerProps) {
  const { t } = useV2Translation();
  const { api, keys } = props.config;
  const employeeId = props.recordId ?? null;
  const creating = !employeeId;

  const [mode, setMode] = React.useState(props.mode);
  const [form, setForm] = React.useState<EmployeeFormValue>(emptyEmployeeForm);
  const [initial, setInitial] =
    React.useState<EmployeeFormValue>(emptyEmployeeForm);
  const [error, setError] =
    React.useState<ReturnType<typeof validateEmployeeForm>>(null);

  const detail = useQuery({
    queryKey: keys.detail(employeeId ?? "new"),
    queryFn: () => api.get(employeeId!),
    enabled: props.open && Boolean(employeeId),
  });
  // CCCD đầy đủ chỉ nạp khi sửa (cần quyền cập nhật); xem chi tiết chỉ hiển thị bản che
  const needFullNationalId =
    props.open && Boolean(employeeId) && mode === "edit" && props.canUpdate;
  const nationalId = useQuery({
    queryKey: keys.nationalId(employeeId ?? "new"),
    queryFn: () => api.getNationalId(employeeId!),
    enabled: needFullNationalId,
    staleTime: 0,
    gcTime: 0,
  });
  const nextCode = useQuery({
    queryKey: keys.nextCode(),
    queryFn: () => api.nextCode(),
    enabled: props.open && creating,
    staleTime: 0,
  });
  const branches = useEmployeeBranchOptionsQuery(
    api,
    keys,
    props.open && mode === "edit",
  );

  React.useEffect(() => setMode(props.mode), [props.mode, props.open]);
  React.useEffect(() => {
    if (!props.open) return;
    setError(null);
    if (detail.data) {
      const loaded = toEmployeeForm(detail.data, nationalId.data ?? "");
      setForm(loaded);
      setInitial(loaded);
    } else if (creating) {
      const fresh = {
        ...emptyEmployeeForm(),
        employeeCode: nextCode.data ?? "",
      };
      setForm(fresh);
      setInitial(fresh);
    }
  }, [props.open, creating, detail.data, nationalId.data, nextCode.data]);

  React.useEffect(() => {
    if (!detail.error) return;
    const fallback = t(
      "v2.employees.form.loadError",
      "Không thể tải nhân viên",
    );
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(detail.error, fallback),
    });
  }, [detail.error, t]);

  const save = useSaveEmployeeMutation(t, () => props.onClose(), {
    api,
    keys,
  });

  const setField = React.useCallback(
    <K extends keyof EmployeeFormValue>(
      field: K,
      value: EmployeeFormValue[K],
    ) => {
      setError(null);
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submit = React.useCallback(() => {
    const found = validateEmployeeForm(form);
    if (found) {
      setError(found);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.employees.form.missingInfo", "Thông tin chưa hợp lệ"),
      });
      return;
    }
    save.mutate({ id: employeeId, form });
  }, [form, save, t, employeeId]);

  const branchOptions = React.useMemo(
    () =>
      (branches.data ?? []).map((b) => ({
        value: b.id,
        label: `${b.code} · ${b.name}`,
      })),
    [branches.data],
  );
  const branch = detail.data?.branch;

  return {
    mode,
    setMode,
    form,
    setField,
    error,
    creating,
    viewing: mode === "view" && !creating,
    branchOptions,
    branchLoading: branches.isFetching,
    branchFallbackLabel: branch ? `${branch.code} · ${branch.name}` : undefined,
    nationalIdMasked: detail.data?.nationalIdMasked,
    linkedUserEmail: detail.data?.linkedUser?.email,
    dirty: isEmployeeFormDirty(form, initial),
    loading: detail.isFetching || nationalId.isFetching || nextCode.isFetching,
    saving: save.isPending,
    submit,
  };
}
