import * as React from "react";
import { useFileAttachmentSettingsQuery } from "../api/queries/useFileAttachmentSettingsQuery";
import { useUpdateFileAttachmentSettingsMutation } from "../api/mutations/useFileAttachmentMutations";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";

export const MAX_RETENTION_DAYS = 3650;

/** Số ngày hợp lệ: nguyên, 1..3650 (khớp validate của API) */
export const parseRetentionDays = (raw: string): number | null => {
  if (!/^\d+$/.test(raw.trim())) return null;
  const n = Number(raw);
  return n >= 1 && n <= MAX_RETENTION_DAYS ? n : null;
};

export function useRetentionSettings(
  t: (key: string, fallback?: string) => string,
  onClose: () => void,
) {
  const canUpdate = useV2HasPermission({
    collection: "attachments",
    action: "update",
  });
  const query = useFileAttachmentSettingsQuery();
  const mutation = useUpdateFileAttachmentSettingsMutation();
  const [enabled, setEnabled] = React.useState(false);
  const [days, setDays] = React.useState("30");

  React.useEffect(() => {
    if (query.data) {
      setEnabled(query.data.autoPurgeEnabled);
      setDays(String(query.data.retentionDays));
    }
  }, [query.data]);

  const parsed = parseRetentionDays(days);
  const toast = useV2ToastStore.getState().showToast;

  const submit = () => {
    if (parsed === null) return;
    mutation.mutate(
      { autoPurgeEnabled: enabled, retentionDays: parsed },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            title: t("v2.fileAttachments.settings.saved", "Đã lưu cài đặt"),
          });
          onClose();
        },
        onError: (error) => {
          const fallback = t(
            "v2.fileAttachments.settings.saveError",
            "Không thể lưu cài đặt",
          );
          toast({
            variant: "destructive",
            title: fallback,
            description: extractV2ApiError(error, fallback),
          });
        },
      },
    );
  };

  return {
    canUpdate,
    loading: query.isLoading,
    enabled,
    setEnabled,
    days,
    setDays,
    valid: parsed !== null,
    saving: mutation.isPending,
    submit,
  };
}
