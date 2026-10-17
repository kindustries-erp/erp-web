import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/core/config/uiStore";
import { extractApiError } from "@/shared/utils/apiError";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { businessPartnerKeys } from "../api/useBusinessPartnersQuery";
import { businessPartnersV2Api } from "../api/businessPartnersApi";
import {
  emptyBusinessPartnerForm,
  type BusinessPartnerFormValue,
  type BusinessPartnerType,
} from "../domain/entities/businessPartner";

export interface BusinessPartnerDrawerState {
  open: boolean;
  partnerId: string | null;
  mode: "view" | "edit";
  partnerType: BusinessPartnerType;
  canUpdate: boolean;
  onClose: () => void;
}

const toForm = (
  data: Awaited<ReturnType<typeof businessPartnersV2Api.get>>,
) => ({
  code: data.code ?? "",
  name: data.name ?? "",
  displayName: data.displayName ?? "",
  taxCode: data.taxCode ?? "",
  phone: data.phone ?? "",
  email: data.email ?? "",
  address: data.address ?? "",
  contactName: data.contactName ?? "",
  status:
    data.status === "INACTIVE" ? ("INACTIVE" as const) : ("ACTIVE" as const),
  notes: data.notes ?? "",
});

export function useBusinessPartnerDrawer(state: BusinessPartnerDrawerState) {
  const { t } = useV2Translation();
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();
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
    showToast({
      variant: "destructive",
      title: t("v2.partners.form.loadError", "Không thể tải thông tin đối tác"),
      description: extractApiError(detail.error),
    });
  }, [detail.error, showToast, t]);

  const save = useMutation({
    mutationFn: () =>
      state.partnerId
        ? businessPartnersV2Api.update(state.partnerId, state.partnerType, form)
        : businessPartnersV2Api.create(state.partnerType, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: businessPartnerKeys.all,
      });
      showToast({
        variant: "success",
        title: t("v2.partners.form.saveSuccess", "Đã lưu đối tác thành công"),
      });
      state.onClose();
    },
    onError: (error) =>
      showToast({
        variant: "destructive",
        title: t(
          "v2.partners.form.saveError",
          "Không thể lưu thông tin đối tác",
        ),
        description: extractApiError(error),
      }),
  });

  const submit = () => {
    if (!form.name.trim()) {
      setNameError(
        t("v2.partners.form.requiredName", "Tên đối tác là bắt buộc"),
      );
      return;
    }
    setNameError("");
    save.mutate();
  };
  const setField = <K extends keyof BusinessPartnerFormValue>(
    key: K,
    value: BusinessPartnerFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  return {
    form,
    setField,
    mode,
    setMode,
    creating,
    viewing: mode === "view" && !creating,
    loading: detail.isFetching,
    saving: save.isPending,
    dirty: JSON.stringify(form) !== JSON.stringify(initial),
    nameError,
    submit,
  };
}
