import { DrawerField, V2Combobox } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  WORKSHOP_STATUSES,
  allowedStatuses,
  type WorkshopCaseOrigin,
  type WorkshopCaseStatus,
} from "../../workshop";

export interface GarageWorkshopStatusSelectProps {
  status: WorkshopCaseStatus;
  origin: WorkshopCaseOrigin;
  /** Quyền `garage:update`: không có thì ô bị khóa (chỉ xem). */
  canChangeStatus: boolean;
  onChange: (status: WorkshopCaseStatus) => void;
}

/**
 * Đổi trạng thái xe trong drawer (thay kéo thẻ trên mobile). Trạng thái không đổi được theo nguồn xe bị
 * khóa; trang quyết định có hỏi xác nhận (ví dụ Hủy) trước khi đổi.
 */
export function GarageWorkshopStatusSelect({
  status,
  origin,
  canChangeStatus,
  onChange,
}: GarageWorkshopStatusSelectProps) {
  const { t } = useV2Translation();
  const label = t("v2.garageCases.workshop.statusField", "Trạng thái");
  const allowed = allowedStatuses({ origin, status }, canChangeStatus);
  return (
    <DrawerField
      label={label}
      helperText={
        origin === "KGARA_SYNC" && canChangeStatus
          ? t(
              "v2.garageCases.workshop.add.overrideHint",
              "Chỉ đổi trên ERP, trạng thái ở KGara giữ nguyên.",
            )
          : undefined
      }
    >
      <V2Combobox
        aria-label={label}
        // Mobile: vùng chạm ≥ 44px (trigger mặc định cao 40px).
        className="[&_[role=combobox]]:min-h-11 sm:[&_[role=combobox]]:min-h-8"
        searchable={false}
        disabled={!canChangeStatus}
        value={status}
        onValueChange={(next) =>
          next && next !== status && onChange(next as WorkshopCaseStatus)
        }
        options={WORKSHOP_STATUSES.map((s) => ({
          value: s.key,
          label: t(s.labelKey, s.defaultLabel),
          disabled: !allowed.has(s.key),
        }))}
      />
    </DrawerField>
  );
}
