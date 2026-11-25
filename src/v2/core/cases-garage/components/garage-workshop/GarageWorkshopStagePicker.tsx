import { DrawerField, V2Combobox } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  WORKSHOP_STAGE_DEFAULT_LABELS,
  workshopStageLabelKey,
} from "../../workshop";

export interface GarageWorkshopStagePickerProps {
  stages: readonly string[];
  value: string;
  onChange: (code: string) => void;
}

/** Chọn một status nhỏ (công đoạn) bằng `V2Combobox` dạng select; mobile mở bottom sheet. */
export function GarageWorkshopStagePicker({
  stages,
  value,
  onChange,
}: GarageWorkshopStagePickerProps) {
  const { t } = useV2Translation();
  const label = t("v2.garageCases.workshop.form.stage", "Công đoạn");
  return (
    <DrawerField label={label} required>
      <V2Combobox
        aria-label={label}
        // Mobile: vùng chạm ≥ 44px (trigger mặc định cao 40px).
        className="[&_[role=combobox]]:min-h-11 sm:[&_[role=combobox]]:min-h-8"
        searchable={false}
        placeholder={t(
          "v2.garageCases.workshop.form.stagePlaceholder",
          "Chọn công đoạn",
        )}
        value={value || null}
        onValueChange={(code) => code && onChange(code)}
        options={stages.map((code) => ({
          value: code,
          label: t(
            workshopStageLabelKey(code),
            WORKSHOP_STAGE_DEFAULT_LABELS[code] ?? code,
          ),
        }))}
      />
    </DrawerField>
  );
}
