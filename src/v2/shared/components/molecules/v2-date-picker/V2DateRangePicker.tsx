import * as React from "react";
import {
  CalendarDays,
  X,
  V2Button,
  V2Icon,
  V2Text,
} from "@/v2/shared/components/atoms";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { cn } from "@/v2/shared/utils/cn";
import { V2Calendar, dateTriggerClass } from "./V2Calendar";
import {
  buildDisabledMatchers,
  formatDisplayDate,
  parseIsoDate,
  toIsoDate,
} from "./V2DatePicker.helper";
import type { V2DateRangePickerProps } from "./V2DatePicker.type";

export const V2DateRangePicker: React.FC<V2DateRangePickerProps> = ({
  value,
  onValueChange,
  placeholder,
  minDate,
  maxDate,
  clearable = false,
  disabled = false,
  presets,
  className,
  triggerClassName,
  "aria-label": ariaLabel,
}) => {
  const { t } = useV2Translation();
  const { isMobile } = useViewport();
  const [open, setOpen] = React.useState(false);
  const from = parseIsoDate(value.from);
  const to = parseIsoDate(value.to);
  const hint = placeholder ?? t("v2.form.pickDateRange", "Chọn khoảng ngày");
  const hasValue = from !== undefined || to !== undefined;
  const canClear = clearable && hasValue && !disabled;
  const separator = t("v2.form.rangeSeparator", "đến");
  const text = hasValue
    ? `${formatDisplayDate(value.from) || "…"} ${separator} ${formatDisplayDate(value.to) || "…"}`
    : hint;

  const trigger = (
    <V2Button
      type="button"
      variant="outline"
      aria-label={ariaLabel ?? hint}
      disabled={disabled}
      className={cn(dateTriggerClass, canClear && "pr-8", triggerClassName)}
    >
      <V2Icon icon={CalendarDays} size={16} className="shrink-0 opacity-60" />
      <V2Text variant="body-sm" truncate color={hasValue ? "default" : "muted"}>
        {text}
      </V2Text>
    </V2Button>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <V2Popover
        trigger={trigger}
        open={open}
        onOpenChange={setOpen}
        align="start"
        arrow={false}
        glass={false}
        hideCloseButton
        title={hint}
        className="w-auto max-w-none p-2"
        triggerClassName="w-full"
        content={
          <div className="flex gap-3">
            {presets && presets.length > 0 && (
              <ul className="flex w-32 shrink-0 flex-col gap-0.5 border-r border-border/40 pr-2">
                {presets.map((preset) => (
                  <li key={preset.key}>
                    <V2Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs font-normal"
                      onClick={() => {
                        onValueChange(preset.range());
                        setOpen(false);
                      }}
                    >
                      <V2Text variant="body-sm">{preset.label}</V2Text>
                    </V2Button>
                  </li>
                ))}
              </ul>
            )}
            <V2Calendar
              mode="range"
              numberOfMonths={isMobile ? 1 : 2}
              selected={hasValue ? { from, to } : undefined}
              defaultMonth={from}
              disabled={buildDisabledMatchers(minDate, maxDate)}
              onSelect={(range) => {
                onValueChange({
                  from: range?.from ? toIsoDate(range.from) : undefined,
                  to: range?.to ? toIsoDate(range.to) : undefined,
                });
                if (range?.from && range?.to) setOpen(false);
              }}
            />
          </div>
        }
      />
      {canClear && (
        <V2Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("v2.form.clearDate", "Xóa ngày")}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded p-0 text-muted-fg hover:text-foreground"
          onClick={() => onValueChange({})}
        >
          <V2Icon icon={X} size={14} />
        </V2Button>
      )}
    </div>
  );
};
V2DateRangePicker.displayName = "V2DateRangePicker";
