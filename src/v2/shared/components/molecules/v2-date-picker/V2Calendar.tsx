import * as React from "react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";
import { enUS, vi } from "date-fns/locale";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";

export const dateTriggerClass =
  "flex h-8 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const dayButton =
  "h-8 w-8 rounded-md text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Lịch dùng chung cho chọn ngày và chọn khoảng ngày: kiểu dáng theo token V2, ngôn ngữ theo locale đang bật */
export const V2Calendar = (props: DayPickerProps) => {
  const { locale, t } = useV2Translation();
  const classNames = {
    root: "relative text-sm",
    months: "relative flex gap-4",
    month: "flex flex-col gap-2",
    month_caption: "flex h-8 items-center justify-center font-medium",
    nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
    button_previous: cn(dayButton, "z-10 flex items-center justify-center"),
    button_next: cn(dayButton, "z-10 flex items-center justify-center"),
    month_grid: "border-collapse",
    weekdays: "flex",
    weekday: "w-8 text-center text-xs font-normal text-muted-foreground",
    week: "mt-1 flex",
    day: "p-0 text-center",
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
      labels={{
        labelPrevious: () => t("v2.form.prevMonth", "Tháng trước"),
        labelNext: () => t("v2.form.nextMonth", "Tháng sau"),
      }}
      {...props}
    />
  );
};
