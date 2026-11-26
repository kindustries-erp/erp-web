import * as React from "react";
import { Clock, V2Button, V2Icon, V2Text } from "@/v2/shared/components/atoms";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2PopoverDismiss } from "@/v2/shared/hooks/useV2PopoverDismiss";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { cn } from "@/v2/shared/utils/cn";
import { dateTriggerClass } from "../v2-date-picker/V2Calendar";
import { V2DateSheet } from "../v2-date-picker/V2DateSheet";
import { V2TimeColumn } from "./V2TimeColumns";
import {
  buildMinutes,
  formatTime,
  HOURS,
  isAfterMax,
  parseTime,
} from "./V2TimePicker.helper";
import type { V2TimePickerProps } from "./V2TimePicker.type";

/**
 * Chọn giờ 24h theo chuẩn V2 (shadcn Popover + Tailwind): hai cột giờ/phút, desktop mở popover,
 * mobile mở bottom sheet. Chọn giờ giữ panel mở, chọn phút thì đóng.
 */
export const V2TimePicker: React.FC<V2TimePickerProps> = ({
  value,
  onValueChange,
  minuteStep = 5,
  maxTime,
  placeholder,
  disabled = false,
  className,
  triggerClassName,
  "aria-label": ariaLabel,
}) => {
  const { t } = useV2Translation();
  const { isMobile } = useViewport();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  useV2PopoverDismiss({
    open: !isMobile && open,
    onClose: () => setOpen(false),
    containerRef,
    panelSelector: "[data-v2-time-panel]",
  });

  const parts = parseTime(value);
  const hint = placeholder ?? t("v2.form.pickTime", "Chọn giờ");
  const hourLabel = t("v2.form.dateTime.hour", "Giờ");
  const minuteLabel = t("v2.form.dateTime.minute", "Phút");
  const hour = parts?.hour;
  const minute = parts?.minute ?? 0;

  const pickHour = (h: number) => {
    // Phút cũ vượt giờ tối đa thì lùi về phút tối đa hợp lệ của giờ đó.
    const max = parseTime(maxTime);
    const m = max && h === max.hour ? Math.min(minute, max.minute) : minute;
    onValueChange(formatTime({ hour: h, minute: m }));
  };
  const pickMinute = (m: number) => {
    onValueChange(formatTime({ hour: hour ?? 0, minute: m }));
    setOpen(false);
  };

  const trigger = (
    <V2Button
      type="button"
      variant="outline"
      aria-label={ariaLabel ?? hint}
      aria-haspopup="listbox"
      {...(isMobile ? { "aria-expanded": open } : {})}
      disabled={disabled}
      onClick={isMobile ? () => !disabled && setOpen(true) : undefined}
      className={cn(dateTriggerClass, triggerClassName)}
    >
      <V2Icon icon={Clock} size={16} className="shrink-0 opacity-60" />
      <V2Text
        variant="body-sm"
        truncate
        color={parts ? "default" : "muted"}
        className="tabular-nums"
      >
        {parts ? formatTime(parts) : hint}
      </V2Text>
    </V2Button>
  );

  const panel = (
    <div data-v2-time-panel="" className="flex w-full gap-2 sm:w-40">
      <V2TimeColumn
        label={hourLabel}
        values={HOURS}
        selected={hour}
        isDisabled={(h) => isAfterMax(h, 0, maxTime)}
        onPick={pickHour}
      />
      <V2TimeColumn
        label={minuteLabel}
        values={buildMinutes(minuteStep, parts?.minute)}
        selected={parts?.minute}
        isDisabled={(m) => isAfterMax(hour ?? 0, m, maxTime)}
        onPick={pickMinute}
      />
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {isMobile ? (
        <>
          {trigger}
          <V2DateSheet
            open={open}
            onOpenChange={setOpen}
            title={hint}
            icon={<V2Icon icon={Clock} size={16} />}
          >
            {open ? panel : null}
          </V2DateSheet>
        </>
      ) : (
        <V2Popover
          trigger={trigger}
          open={open}
          onOpenChange={setOpen}
          align="start"
          arrow={false}
          glass={false}
          hideCloseButton
          title={hint}
          className="w-auto p-2"
          triggerClassName="w-full"
          content={panel}
        />
      )}
    </div>
  );
};
V2TimePicker.displayName = "V2TimePicker";
