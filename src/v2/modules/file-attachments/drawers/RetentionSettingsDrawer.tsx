import { V2Input } from "@/v2/shared/components/atoms/v2-input";
import { V2Switch } from "@/v2/shared/components/atoms/v2-switch";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useRetentionSettings } from "./RetentionSettingsDrawer.hook";

/** Cài đặt lưu giữ: bật/tắt tự động dọn và số ngày giữ file đã xóa mềm */
export function RetentionSettingsDrawer({ onClose }: { onClose: () => void }) {
  const { t } = useV2Translation();
  const s = useRetentionSettings(t, onClose);
  const title = t("v2.fileAttachments.settings.title", "Cài đặt lưu giữ");

  return (
    <V2StandardDrawer
      id="fileAttachment-retention-settings"
      open
      mode={s.canUpdate ? "edit" : "view"}
      onClose={onClose}
      title={title}
      layout="1-column"
      size="md"
      loading={s.loading}
      actions={
        s.canUpdate
          ? [
              {
                label: t("v2.common.cancel", "Hủy"),
                onClick: onClose,
                variant: "outline",
                disabled: s.saving,
              },
              {
                label: t("v2.common.save", "Lưu"),
                onClick: s.submit,
                primary: true,
                loading: s.saving,
                disabled: s.saving || !s.valid,
              },
            ]
          : [
              {
                label: t("v2.common.close", "Đóng"),
                onClick: onClose,
                variant: "outline",
              },
            ]
      }
    >
      <div className="flex flex-col gap-4">
        <V2Switch
          checked={s.enabled}
          disabled={!s.canUpdate}
          onCheckedChange={s.setEnabled}
          label={t(
            "v2.fileAttachments.settings.autoPurge",
            "Tự động xóa vĩnh viễn tệp đã xóa mềm",
          )}
        />
        <p className="text-xs text-muted-foreground">
          {t("v2.fileAttachments.settings.autoPurgeHint", "Mặc định tắt.")}
        </p>
        <label className="flex flex-col gap-1 text-sm">
          {t(
            "v2.fileAttachments.settings.retentionDays",
            "Số ngày giữ trước khi xóa",
          )}
          <V2Input
            inputMode="numeric"
            value={s.days}
            disabled={!s.canUpdate}
            onChange={(e) => s.setDays(e.target.value)}
            error={
              s.valid
                ? undefined
                : t(
                    "v2.fileAttachments.settings.retentionInvalid",
                    "Nhập số nguyên từ 1 đến 3650",
                  )
            }
          />
        </label>
      </div>
    </V2StandardDrawer>
  );
}
