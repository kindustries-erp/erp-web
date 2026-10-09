import * as React from "react";
import { CalendarDays, X } from "lucide-react";
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
    <button
      type="button"
      aria-label={ariaLabel ?? hint}
      disabled={disabled}
      className={cn(dateTriggerClass, canClear && "pr-8")}
    >
      <CalendarDays aria-hidden className="h-4 w-4 shrink-0 opacity-60" />
      <span className={cn("truncate", !hasValue && "text-muted-foreground")}>
        {text}
      </span>
    </button>
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
              <ul className="flex w-32 shrink-0 flex-col gap-0.5 border-r border-border pr-2">
                {presets.map((preset) => (
                  <li key={preset.key}>
                    <button
                      type="button"
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        onValueChange(preset.range());
                        setOpen(false);
                      }}
                    >
                      {preset.label}
                    </button>
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
        <button
          type="button"
          aria-label={t("v2.form.clearDate", "Xóa ngày")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => onValueChange({})}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
V2DateRangePicker.displayName = "V2DateRangePicker";
