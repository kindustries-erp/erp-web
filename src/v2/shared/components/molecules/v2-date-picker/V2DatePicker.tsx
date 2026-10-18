import * as React from "react";
import { CalendarDays, X } from "lucide-react";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2Calendar, dateTriggerClass } from "./V2Calendar";
import {
  buildDisabledMatchers,
  formatDisplayDate,
  parseIsoDate,
  toIsoDate,
} from "./V2DatePicker.helper";
import type { V2DatePickerProps } from "./V2DatePicker.type";

export const V2DatePicker: React.FC<V2DatePickerProps> = ({
  value,
  onValueChange,
  placeholder,
  minDate,
  maxDate,
  clearable = false,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);
  const selected = parseIsoDate(value);
  const hint = placeholder ?? t("v2.form.pickDate", "Chọn ngày");
  const canClear = clearable && selected !== undefined && !disabled;

  const trigger = (
    <button
      type="button"
      aria-label={ariaLabel ?? hint}
      disabled={disabled}
      className={cn(dateTriggerClass, canClear && "pr-8")}
    >
      <CalendarDays aria-hidden className="h-4 w-4 shrink-0 opacity-60" />
      <span className={cn("truncate", !selected && "text-muted-foreground")}>
        {selected ? formatDisplayDate(value) : hint}
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
        className="w-auto p-2"
        triggerClassName="w-full"
        content={
          <V2Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            disabled={buildDisabledMatchers(minDate, maxDate)}
            onSelect={(date) => {
              onValueChange(date ? toIsoDate(date) : null);
              setOpen(false);
            }}
          />
        }
      />
      {canClear && (
        <button
          type="button"
          aria-label={t("v2.form.clearDate", "Xóa ngày")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => onValueChange(null)}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
V2DatePicker.displayName = "V2DatePicker";
