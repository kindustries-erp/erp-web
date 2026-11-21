import React from "react";
import { parseISO } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarRange, Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import type { DateRangeColumnSlotProps } from "./DateRangeColumnSlot.type";
import { useDateRangeColumnSlot } from "./DateRangeColumnSlot.hook";

export function DateRangeColumnSlot(props: DateRangeColumnSlotProps) {
  const {
    t,
    pendingFrom,
    pendingTo,
    quickPresets,
    activePresetKey,
    activePresetLabel,
    monthPeriodOptions,
    selectedMonthPeriod,
    isPendingChanged,
    isInvalidRange,
    handlePresetSelect,
    handleMonthPeriodChange,
    handleDateFromChange,
    handleDateToChange,
    handleApply,
    handleClear,
  } = useDateRangeColumnSlot(props);

  return (
    <div
      className={cn(
        "border-t border-b border-border pt-2 pb-2",
        props.className,
      )}
    >
      {/* Hàng 1: Dropdown Chọn nhanh */}
      <div className="px-3 pb-2 flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
          <CalendarRange className="w-3.5 h-3.5" />
          {t("common.quickSelect", "Chọn nhanh")}
        </label>
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-xs border border-border rounded-md px-2 py-1 bg-muted hover:bg-accent transition-colors"
            >
              <span
                className={cn(
                  "max-w-[100px] truncate",
                  activePresetKey !== "all"
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {activePresetLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-[9999] min-w-[140px] rounded-lg p-1 popup-content bg-popover shadow-md border border-border"
            >
              {quickPresets.map((p) => {
                const isActive = activePresetKey === p.key;
                return (
                  <DropdownMenu.Item
                    key={p.key}
                    onSelect={() => handlePresetSelect(p.key)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md cursor-pointer outline-none select-none transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted focus:bg-muted",
                    )}
                  >
                    {p.label}
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Hàng 2, 3, 4: Kỳ, Từ ngày, Đến ngày (đồng bộ width & căn lề hoàn hảo) */}
      <div className="px-3 pt-1 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground w-16 shrink-0 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {t("common.period", "Kỳ")}
          </label>
          <div className="flex-1 min-w-0">
            <Combobox
              options={monthPeriodOptions}
              value={selectedMonthPeriod}
              onChange={handleMonthPeriodChange}
              placeholder={t("common.selectPeriod", "Chọn kỳ...")}
              allowClear={false}
              className="h-7 text-xs py-0.5 px-2 rounded-md w-full min-w-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground w-16 shrink-0">
            {t("common.dateFrom", "Từ ngày")}
          </label>
          <div className="flex-1 min-w-0">
            <DatePicker
              value={pendingFrom}
              onChange={handleDateFromChange}
              placeholder="dd/mm/yyyy"
              className="w-full text-xs h-7 min-w-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground w-16 shrink-0">
            {t("common.dateTo", "Đến ngày")}
          </label>
          <div className="flex-1 min-w-0">
            <DatePicker
              value={pendingTo}
              onChange={handleDateToChange}
              placeholder="dd/mm/yyyy"
              className="w-full text-xs h-7 min-w-0"
              minDate={pendingFrom}
              defaultMonth={pendingFrom ? parseISO(pendingFrom) : undefined}
            />
          </div>
        </div>

        {isInvalidRange && (
          <div className="text-[11px] text-destructive leading-tight text-center mt-0.5">
            {t(
              "common.invalidDateRange",
              "Ngày đến phải lớn hơn hoặc bằng ngày từ",
            )}
          </div>
        )}
      </div>

      {/* Hàng 5: Footer Actions */}
      <div className="p-2 border-t border-border flex justify-between items-center bg-muted/50 rounded-b-xl mt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent px-2 h-7"
          onClick={handleClear}
        >
          {t("common.clearFilter", "Xóa bộ lọc")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="text-xs h-7 px-3"
          onClick={handleApply}
          disabled={!isPendingChanged || isInvalidRange}
        >
          {t("common.apply", "Áp dụng")}
        </Button>
      </div>
    </div>
  );
}
