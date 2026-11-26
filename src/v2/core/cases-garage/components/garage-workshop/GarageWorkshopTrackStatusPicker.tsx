import { DrawerField, V2RadioCardGroup } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { WORKSHOP_STATUSES, type WorkshopCaseStatus } from "../../workshop";

export interface GarageWorkshopTrackStatusPickerProps {
  value: WorkshopCaseStatus;
  onChange: (status: WorkshopCaseStatus) => void;
  /** Trạng thái chọn được (theo quyền và nguồn xe). */
  allowed: ReadonlySet<WorkshopCaseStatus>;
  /** Trạng thái hiện tại của xe có sẵn; xe mới để trống. */
  current?: WorkshopCaseStatus;
  helperText?: string;
}

/** Chọn trạng thái xe khi đưa vào bảng; trạng thái không được phép bị khóa. */
export function GarageWorkshopTrackStatusPicker({
  value,
  onChange,
  allowed,
  current,
  helperText,
}: GarageWorkshopTrackStatusPickerProps) {
  const { t } = useV2Translation();
  const label = t("v2.garageCases.workshop.add.status", "Trạng thái trên bảng");
  return (
    <DrawerField label={label} helperText={helperText}>
      <V2RadioCardGroup
        name="workshop-track-status"
        ariaLabel={label}
        className="grid grid-cols-2 [&>div]:min-h-11"
        value={value}
        onValueChange={onChange}
        options={WORKSHOP_STATUSES.map((s) => ({
          value: s.key,
          label: t(s.labelKey, s.defaultLabel),
          description:
            s.key === current
              ? t("v2.garageCases.workshop.add.current", "Hiện tại")
              : undefined,
          disabled: !allowed.has(s.key),
        }))}
      />
    </DrawerField>
  );
}
