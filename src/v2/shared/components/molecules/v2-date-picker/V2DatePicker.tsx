import * as React from "react";
import {
  CalendarDays,
  X,
  V2Button,
  V2Icon,
  V2Text,
} from "@/v2/shared/components/atoms";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2PopoverDismiss } from "@/v2/shared/hooks/useV2PopoverDismiss";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { cn } from "@/v2/shared/utils/cn";
import { V2Calendar, dateTriggerClass } from "./V2Calendar";
import { V2DateSheet } from "./V2DateSheet";
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
  triggerClassName,
  "aria-label": ariaLabel,
  open: controlledOpen,
  onOpenChange,
}) => {
  const { t } = useV2Translation();
  const { isMobile } = useViewport();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) =>
    onOpenChange ? onOpenChange(next) : setInternalOpen(next);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useV2PopoverDismiss({
    open: !isMobile && open,
    onClose: () => setOpen(false),
    containerRef,
    panelSelector: "[data-v2-date-panel]",
  });
  const selected = parseIsoDate(value);
  const hint = placeholder ?? t("v2.form.pickDate", "Chọn ngày");
  const canClear = clearable && selected !== undefined && !disabled;

  const trigger = (
    <V2Button
      type="button"
      variant="outline"
      aria-label={ariaLabel ?? hint}
      {...(isMobile ? { "aria-expanded": open } : {})}
      disabled={disabled}
      onClick={isMobile ? () => !disabled && setOpen(true) : undefined}
      className={cn(dateTriggerClass, canClear && "pr-8", triggerClassName)}
    >
      <V2Icon icon={CalendarDays} size={16} className="shrink-0 opacity-60" />
      <V2Text variant="body-sm" truncate color={selected ? "default" : "muted"}>
        {selected ? formatDisplayDate(value) : hint}
      </V2Text>
    </V2Button>
  );

  const calendarNode = (
    <div
      data-v2-date-panel=""
      className={cn(isMobile && "flex w-full justify-center")}
    >
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
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {isMobile ? (
        <>
          {trigger}
          <V2DateSheet open={open} onOpenChange={setOpen} title={hint}>
            {calendarNode}
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
          content={calendarNode}
        />
      )}
      {canClear && (
        <V2Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("v2.form.clearDate", "Xóa ngày")}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded p-0 text-muted-fg hover:text-foreground"
          onClick={() => onValueChange(null)}
        >
          <V2Icon icon={X} size={14} />
        </V2Button>
      )}
    </div>
  );
};
V2DatePicker.displayName = "V2DatePicker";
