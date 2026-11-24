import * as React from "react";
import { V2Button, V2Stack } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2DatePicker } from "../v2-date-picker/V2DatePicker";
import { V2TimePicker } from "../v2-time-picker/V2TimePicker";
import {
  joinDateTime,
  minutesBefore,
  splitDateTime,
  toLocalDateTime,
} from "./V2DateTimePicker.helper";
import type { V2DateTimePickerProps } from "./V2DateTimePicker.type";

/**
 * Chọn ngày giờ: ngày bằng `V2DatePicker`, giờ bằng `V2TimePicker` (popover desktop, bottom sheet
 * mobile), kèm nút chọn nhanh "Bây giờ", "15 phút trước"…  `noFuture` chặn cả giờ sau hiện tại trong hôm nay.
 */
export const V2DateTimePicker: React.FC<V2DateTimePickerProps> = ({
  value,
  onValueChange,
  quickMinutesAgo,
  noFuture = false,
  clearable = false,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}) => {
  const { t } = useV2Translation();
  const { date, time } = splitDateTime(value);
  const nowTime = () => splitDateTime(toLocalDateTime(new Date())).time;
  const today = splitDateTime(toLocalDateTime(new Date())).date;
  const dateLabel = t("v2.form.dateTime.date", "Ngày");
  const timeLabel = t("v2.form.dateTime.time", "Giờ");
  const quickLabel = (n: number) =>
    n === 0
      ? t("v2.form.dateTime.now", "Bây giờ")
      : n % 60 === 0
        ? t("v2.form.dateTime.hoursAgo", {
            defaultValue: "{{n}} giờ trước",
            n: n / 60,
          })
        : t("v2.form.dateTime.minutesAgo", {
            defaultValue: "{{n}} phút trước",
            n,
          });

  return (
    <V2Stack gap="xs" className={cn("w-full", className)}>
      <V2Stack className="flex-row gap-2">
        <V2DatePicker
          className="min-w-0 flex-[3]"
          value={date || null}
          onValueChange={(d) =>
            onValueChange(joinDateTime(d ?? "", time, nowTime()))
          }
          maxDate={noFuture ? today : undefined}
          clearable={clearable}
          disabled={disabled}
          aria-label={ariaLabel ? `${ariaLabel} – ${dateLabel}` : dateLabel}
        />
        <V2TimePicker
          className="min-w-0 flex-[2]"
          value={time}
          maxTime={
            noFuture && (date || today) === today ? nowTime() : undefined
          }
          disabled={disabled}
          aria-label={ariaLabel ? `${ariaLabel} – ${timeLabel}` : timeLabel}
          onValueChange={(next) =>
            onValueChange(joinDateTime(date || today, next, next))
          }
        />
      </V2Stack>
      {quickMinutesAgo?.length ? (
        <V2Stack className="flex-row flex-wrap gap-1.5">
          {quickMinutesAgo.map((n) => (
            <V2Button
              key={n}
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 md:min-h-8"
              disabled={disabled}
              onClick={() => onValueChange(minutesBefore(n))}
            >
              {quickLabel(n)}
            </V2Button>
          ))}
        </V2Stack>
      ) : null}
    </V2Stack>
  );
};
V2DateTimePicker.displayName = "V2DateTimePicker";
