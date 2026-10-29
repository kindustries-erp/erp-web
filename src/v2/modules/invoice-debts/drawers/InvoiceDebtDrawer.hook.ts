import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { invoiceDebtsV2Api } from "../api/invoiceDebtsApi";
import { useSaveInvoiceDebtMutation } from "../api/mutations/useInvoiceDebtMutations";
import { invoiceDebtsKeys } from "../api/queries/invoiceDebtsKeys";
import {
  emptyInvoiceDebtForm,
  type InvoiceDebt,
  type InvoiceDebtFormValue,
} from "../domain/entities/invoiceDebt";
import {
  isInvoiceDebtFormDirty,
  validateInvoiceDebtForm,
} from "../domain/rules/invoiceDebtRules";

export interface InvoiceDebtDrawerState {
  open: boolean;
  recordId: string | null;
  mode: "view" | "edit";
  canUpdate: boolean;
  onClose: () => void;
}

const toForm = (data: InvoiceDebt): InvoiceDebtFormValue => ({
  search: data.search ?? "",
  partnerType: data.partnerType === "INACTIVE" ? "INACTIVE" : "ACTIVE",
});

export function useInvoiceDebtDrawer(state: InvoiceDebtDrawerState) {
  const { t } = useV2Translation();
  const [mode, setMode] = React.useState(state.mode);
  const [form, setForm] =
    React.useState<InvoiceDebtFormValue>(emptyInvoiceDebtForm);
  const [initial, setInitial] =
    React.useState<InvoiceDebtFormValue>(emptyInvoiceDebtForm);
  const [errorField, setErrorField] = React.useState<string | null>(null);
  const creating = !state.recordId;
  const detail = useQuery({
    queryKey: invoiceDebtsKeys.detail(state.recordId ?? "new"),
    queryFn: () => invoiceDebtsV2Api.get(state.recordId!),
    enabled: state.open && Boolean(state.recordId),
  });

  React.useEffect(() => setMode(state.mode), [state.mode, state.open]);
  React.useEffect(() => {
    if (!state.open) return;
    setErrorField(null);
    if (detail.data) {
      const loaded = toForm(detail.data);
      setForm(loaded);
      setInitial(loaded);
    } else if (!state.recordId) {
      const fresh = emptyInvoiceDebtForm();
      setForm(fresh);
      setInitial(fresh);
    }
  }, [state.open, state.recordId, detail.data]);

  React.useEffect(() => {
    if (!detail.error) return;
    const fallback = t(
      "v2.invoiceDebts.form.loadError",
      "Không thể tải dữ liệu",
    );
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(detail.error, fallback),
    });
  }, [detail.error, t]);

  const save = useSaveInvoiceDebtMutation(t, state.onClose);

  const setField = <K extends keyof InvoiceDebtFormValue>(
    key: K,
    value: InvoiceDebtFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const missing = validateInvoiceDebtForm(form);
    if (missing) {
      setErrorField(missing);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.invoiceDebts.form.missingInfo", "Thiếu thông tin"),
        description: t(
          "v2.invoiceDebts.form.required",
          "Trường này là bắt buộc",
        ),
      });
      return;
    }
    setErrorField(null);
    save.mutate({ id: state.recordId, form });
  };

  return {
    form,
    setField,
    mode,
    setMode,
    creating,
    codeEditable: creating,
    viewing: mode === "view" && !creating,
    loading: detail.isFetching,
    saving: save.isPending,
    dirty: isInvoiceDebtFormDirty(form, initial),
    errorField,
    errorMessage: t("v2.invoiceDebts.form.required", "Trường này là bắt buộc"),
    submit,
  };
}
