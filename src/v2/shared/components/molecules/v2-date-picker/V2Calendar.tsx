import * as React from "react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { enUS, vi } from "date-fns/locale";
import { V2Icon } from "@/v2/shared/components/atoms/v2-icon";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import { V2ChevronOrientation } from "./V2DatePicker.type";

export const dateTriggerClass = `flex h-10 sm:h-8 w-full justify-start text-left font-normal items-center gap-2 rounded-md border border-input bg-background px-3 text-base sm:text-sm ${V2_DRAWER_FOCUS_RING_CLASS} disabled:cursor-not-allowed disabled:opacity-50`;

const dayButton =
  "h-10 w-10 sm:h-8 sm:w-8 rounded-md text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Lịch dùng chung cho chọn ngày và chọn khoảng ngày: kiểu dáng theo token V2, ngôn ngữ theo locale đang bật */
export const V2Calendar = (props: DayPickerProps) => {
  const { locale, t } = useV2Translation();
  const classNames = {
    root: "relative text-sm w-full sm:w-auto",
    months: "relative flex flex-col sm:flex-row gap-4 w-full sm:w-auto",
    month:
      "flex flex-col gap-2 w-full max-w-[360px] mx-auto sm:w-auto sm:max-w-none",
    month_caption: "flex h-9 sm:h-8 items-center justify-center font-medium",
    nav: "absolute inset-x-0 top-0 flex h-9 sm:h-8 items-center justify-between",
    button_previous: cn(
      dayButton,
      "z-10 flex items-center justify-center text-foreground hover:bg-muted cursor-pointer",
    ),
    button_next: cn(
      dayButton,
      "z-10 flex items-center justify-center text-foreground hover:bg-muted cursor-pointer",
    ),
    chevron: "inline-block fill-foreground text-foreground",
    month_grid: "w-full border-collapse",
    weekdays: "grid grid-cols-7",
    weekday:
      "text-center text-xs font-normal text-muted-foreground py-1 sm:w-8",
    week: "mt-1 grid grid-cols-7",
    day: "p-0 flex items-center justify-center",
    day_button: dayButton,
    selected:
      "[&>button]:bg-primary [&>button]:text-primary-fg [&>button:hover]:bg-primary",
    range_middle:
      "[&>button]:rounded-none [&>button]:!bg-muted [&>button]:!text-foreground",
    today: "[&>button]:font-bold [&>button]:text-primary",
    outside: "opacity-40",
    disabled: "pointer-events-none opacity-30",
    hidden: "invisible",
  };

  return (
    <DayPicker
      showOutsideDays
      locale={locale === "en" ? enUS : vi}
      classNames={classNames}
      components={{
        Chevron: ({ orientation }: { orientation?: string }) => (
          <V2Icon
            icon={
              orientation === V2ChevronOrientation.RIGHT
                ? ChevronRight
                : ChevronLeft
            }
            size={16}
            className="text-foreground shrink-0"
          />
        ),
      }}
      labels={{
        labelPrevious: () => t("v2.form.prevMonth", "Tháng trước"),
        labelNext: () => t("v2.form.nextMonth", "Tháng sau"),
      }}
      {...props}
    />
  );
};
