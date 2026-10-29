import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { businessPartnersV2Api } from "../api/businessPartnersApi";
import { useSaveBusinessPartnerMutation } from "../api/mutations/useBusinessPartnerMutations";
import { businessPartnerKeys } from "../api/queries/businessPartnerKeys";
import type { BusinessPartner } from "../domain/entities/businessPartner";
import {
  emptyBusinessPartnerForm,
  type BusinessPartnerFormValue,
  type BusinessPartnerType,
} from "../domain/entities/businessPartner";
import {
  canEditBusinessPartnerCode,
  isBusinessPartnerFormDirty,
  validateBusinessPartnerForm,
} from "../domain/rules/businessPartnerRules";

export interface BusinessPartnerDrawerState {
  open: boolean;
  partnerId: string | null;
  mode: "view" | "edit";
  partnerType: BusinessPartnerType;
  canUpdate: boolean;
  onClose: () => void;
  /** Gọi khi tạo mới xong (thay cho đóng), để người mở drawer nhận đối tác vừa tạo */
  onCreated?: (partner: BusinessPartner) => void;
}

const toForm = (
  data: Awaited<ReturnType<typeof businessPartnersV2Api.get>>,
): BusinessPartnerFormValue => ({
  code: data.code ?? "",
  name: data.name ?? "",
  displayName: data.displayName ?? "",
  taxCode: data.taxCode ?? "",
  phone: data.phone ?? "",
  email: data.email ?? "",
  address: data.address ?? "",
  contactName: data.contactName ?? "",
  status: data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  notes: data.notes ?? "",
});

export function useBusinessPartnerDrawer(state: BusinessPartnerDrawerState) {
  const { t } = useV2Translation();
  const [mode, setMode] = React.useState(state.mode);
  const [form, setForm] = React.useState<BusinessPartnerFormValue>(
    emptyBusinessPartnerForm,
  );
  const [initial, setInitial] = React.useState<BusinessPartnerFormValue>(
    emptyBusinessPartnerForm,
  );
  const [nameError, setNameError] = React.useState("");
  const creating = !state.partnerId;
  const detail = useQuery({
    queryKey: businessPartnerKeys.detail(state.partnerId ?? "new"),
    queryFn: () => businessPartnersV2Api.get(state.partnerId!),
    enabled: state.open && Boolean(state.partnerId),
  });

  React.useEffect(() => setMode(state.mode), [state.mode, state.open]);
  React.useEffect(() => {
    if (!state.open) return;
    setNameError("");
    if (detail.data) {
      const loaded = toForm(detail.data);
      setForm(loaded);
      setInitial(loaded);
    } else if (!state.partnerId) {
      const fresh = emptyBusinessPartnerForm();
      setForm(fresh);
      setInitial(fresh);
      void businessPartnersV2Api
        .nextCode(state.partnerType)
        .then(({ nextCode }) => {
          setForm((value) => ({ ...value, code: nextCode }));
          setInitial((value) => ({ ...value, code: nextCode }));
        });
    }
  }, [state.open, state.partnerId, state.partnerType, detail.data]);

  React.useEffect(() => {
    if (!detail.error) return;
    const fallback = t(
      "v2.partners.form.loadError",
      "Không thể tải thông tin đối tác",
    );
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(detail.error, fallback),
    });
  }, [detail.error, t]);

  const save = useSaveBusinessPartnerMutation(t, (saved) => {
    if (!state.partnerId && state.onCreated) state.onCreated(saved);
    else state.onClose();
  });

  const setField = <K extends keyof BusinessPartnerFormValue>(
    key: K,
    value: BusinessPartnerFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const regenerateCode = () => {
    void businessPartnersV2Api
      .nextCode(state.partnerType)
      .then(({ nextCode }) => setField("code", nextCode));
  };

  const submit = () => {
    if (validateBusinessPartnerForm(form)) {
      const message = t(
        "v2.partners.form.requiredName",
        "Tên đối tác là bắt buộc",
      );
      setNameError(message);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.partners.form.missingInfo", "Thiếu thông tin"),
        description: message,
      });
      return;
    }
    setNameError("");
    save.mutate({
      id: state.partnerId,
      partnerType: state.partnerType,
      form,
    });
  };

  return {
    form,
    setField,
    mode,
    setMode,
    creating,
    codeEditable: canEditBusinessPartnerCode(creating),
    viewing: mode === "view" && !creating,
    loading: detail.isFetching,
    saving: save.isPending,
    dirty: isBusinessPartnerFormDirty(form, initial),
    nameError,
    submit,
    regenerateCode,
  };
}
