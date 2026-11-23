import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { businessPartnersV2Api } from "../api/businessPartnersApi";
import { useSaveBusinessPartnerMutation } from "../api/mutations/useBusinessPartnerMutations";
import { businessPartnerKeys } from "../api/queries/businessPartnerKeys";
import {
  emptyBusinessPartnerForm,
  type BusinessPartnerFormValue,
} from "../domain/entities/businessPartner";
import {
  canEditBusinessPartnerCode,
  isBusinessPartnerFormDirty,
  validateBusinessPartnerForm,
} from "../domain/rules/businessPartnerRules";
import type { BusinessPartnerDrawerProps } from "./BusinessPartnerDrawer.type";

export type BusinessPartnerDrawerState = BusinessPartnerDrawerProps;

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

export function useBusinessPartnerDrawer(props: BusinessPartnerDrawerProps) {
  const { t } = useV2Translation();
  const partnerId =
    props.recordId !== undefined ? props.recordId : (props.partnerId ?? null);
  const partnerType =
    props.partnerType ?? props.config?.partnerType ?? "CUSTOMER";
  const api = props.config?.api;
  const keys = props.config?.keys ?? businessPartnerKeys;

  const [mode, setMode] = React.useState(props.mode);
  const [form, setForm] = React.useState<BusinessPartnerFormValue>(
    emptyBusinessPartnerForm,
  );
  const [initial, setInitial] = React.useState<BusinessPartnerFormValue>(
    emptyBusinessPartnerForm,
  );
  const [nameError, setNameError] = React.useState("");
  const creating = !partnerId;

  const detail = useQuery({
    queryKey: keys.detail(partnerId ?? "new"),
    queryFn: () =>
      api ? api.get(partnerId!) : businessPartnersV2Api.get(partnerId!),
    enabled: props.open && Boolean(partnerId),
  });

  React.useEffect(() => setMode(props.mode), [props.mode, props.open]);
  React.useEffect(() => {
    if (!props.open) return;
    setNameError("");
    if (detail.data) {
      const loaded = toForm(detail.data);
      setForm(loaded);
      setInitial(loaded);
    } else if (!partnerId) {
      const fresh = emptyBusinessPartnerForm();
      setForm(fresh);
      setInitial(fresh);
      const fetchNext = api?.nextCode
        ? api.nextCode()
        : businessPartnersV2Api.nextCode(partnerType);
      void fetchNext.then(({ nextCode }) => {
        setForm((value) => ({ ...value, code: nextCode }));
        setInitial((value) => ({ ...value, code: nextCode }));
      });
    }
  }, [props.open, partnerId, partnerType, detail.data, api]);

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

  const save = useSaveBusinessPartnerMutation(
    t,
    (saved) => {
      if (!partnerId && props.onCreated) props.onCreated(saved);
      else props.onClose();
    },
    { api, keys },
  );

  const setField = React.useCallback(
    <K extends keyof BusinessPartnerFormValue>(
      field: K,
      value: BusinessPartnerFormValue[K],
    ) => {
      if (field === "name") setNameError("");
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const regenerateCode = React.useCallback(() => {
    const fetchNext = api?.nextCode
      ? api.nextCode()
      : businessPartnersV2Api.nextCode(partnerType);
    void fetchNext.then(({ nextCode }) => {
      setField("code", nextCode);
    });
  }, [api, partnerType, setField]);

  const submit = React.useCallback(() => {
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
    save.mutate({ id: partnerId, partnerType, form });
  }, [form, partnerId, partnerType, save, t]);

  return {
    mode,
    setMode,
    form,
    setField,
    regenerateCode,
    nameError,
    creating,
    viewing: mode === "view" && !creating,
    codeEditable: canEditBusinessPartnerCode(creating),
    dirty: isBusinessPartnerFormDirty(form, initial),
    loading: detail.isFetching,
    saving: save.isPending,
    submit,
  };
}
