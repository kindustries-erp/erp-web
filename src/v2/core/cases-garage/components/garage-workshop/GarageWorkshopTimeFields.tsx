import { DrawerField, V2DateTimePicker } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface GarageWorkshopTimeFieldsProps {
  /** `yyyy-MM-ddTHH:mm` theo giờ máy; rỗng là thời điểm lưu. */
  startedAt: string;
  endedAt: string;
  /** Hiện ô giờ kết thúc (chỉ khi sửa công đoạn đã đóng). */
  showEnd: boolean;
  showHint: boolean;
  onChange: (patch: { startedAt?: string; endedAt?: string }) => void;
}

/** Nút chọn nhanh: bây giờ, 15 phút, 30 phút, 1 giờ trước. */
const QUICK = [0, 15, 30, 60];

/** Giờ bắt đầu (và kết thúc) sửa tay bằng `V2DateTimePicker`, không cho chọn ngày tương lai. */
export function GarageWorkshopTimeFields({
  startedAt,
  endedAt,
  showEnd,
  showHint,
  onChange,
}: GarageWorkshopTimeFieldsProps) {
  const { t } = useV2Translation();
  const startLabel = t("v2.garageCases.workshop.form.startedAt", "Bắt đầu lúc");
  const endLabel = t("v2.garageCases.workshop.form.endedAt", "Kết thúc lúc");
  return (
    <>
      <DrawerField
        label={startLabel}
        helperText={
          showHint
            ? t(
                "v2.garageCases.workshop.form.startedAtHint",
                "Bỏ trống là thời điểm lưu",
              )
            : undefined
        }
      >
        <V2DateTimePicker
          aria-label={startLabel}
          value={startedAt}
          onValueChange={(v) => onChange({ startedAt: v })}
          quickMinutesAgo={QUICK}
          noFuture
          clearable
        />
      </DrawerField>
      {showEnd ? (
        <DrawerField label={endLabel}>
          <V2DateTimePicker
            aria-label={endLabel}
            value={endedAt}
            onValueChange={(v) => onChange({ endedAt: v })}
            quickMinutesAgo={[0]}
            noFuture
          />
        </DrawerField>
      ) : null}
    </>
  );
}
