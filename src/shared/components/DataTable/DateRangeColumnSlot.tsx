import { useState, useEffect, useMemo } from "react";
import { useT } from "@/core/i18n";
import {
  format,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subDays,
  subQuarters,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, CalendarRange } from "lucide-react";
import { cn } from "@/shared/utils";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";

interface DateRangeColumnSlotProps {
  dateFrom: string; // "yyyy-MM-dd" or ""
  dateTo: string; // "yyyy-MM-dd" or ""
  onChange: (from: string, to: string) => void;
  onClose?: () => void;
}

function toStr(d: Date | undefined): string {
  if (!d || !isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

type PresetKey =
  | "today"
  | "yesterday"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "all";

function getPresetRange(key: PresetKey): {
  from: Date | undefined;
  to: Date | undefined;
} {
  const now = new Date();
  switch (key) {
    case "today":
      return { from: now, to: now };
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return { from: yesterday, to: yesterday };
    }
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": {
      const last = subMonths(now, 1);
      return { from: startOfMonth(last), to: endOfMonth(last) };
    }
    case "thisQuarter":
      return { from: startOfQuarter(now), to: endOfQuarter(now) };
    case "lastQuarter": {
      const last = subQuarters(now, 1);
      return { from: startOfQuarter(last), to: endOfQuarter(last) };
    }
    case "thisYear":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "all":
      return { from: undefined, to: undefined };
  }
}

export function DateRangeColumnSlot({
  dateFrom,
  dateTo,
  onChange,
  onClose,
}: DateRangeColumnSlotProps) {
  const t = useT();
  const [pendingFrom, setPendingFrom] = useState(dateFrom);
  const [pendingTo, setPendingTo] = useState(dateTo);

  const presets = useMemo<{ key: PresetKey; label: string }[]>(
    () => [
      { key: "today", label: t("common.today", "Hôm nay") },
      { key: "yesterday", label: t("common.yesterday", "Hôm qua") },
      { key: "thisMonth", label: t("common.thisMonth", "Tháng này") },
      { key: "lastMonth", label: t("common.lastMonth", "Tháng trước") },
      { key: "thisQuarter", label: t("common.thisQuarter", "Quý này") },
      { key: "lastQuarter", label: t("common.lastQuarter", "Quý trước") },
      { key: "thisYear", label: t("common.thisYear", "Năm nay") },
      { key: "all", label: t("common.all", "Tất cả") },
    ],
    [t],
  );

  // Sync external changes (e.g. external reset)
  useEffect(() => {
    setPendingFrom(dateFrom);
    setPendingTo(dateTo);
  }, [dateFrom, dateTo]);

  function handlePreset(key: PresetKey) {
    const { from, to } = getPresetRange(key);
    setPendingFrom(toStr(from));
    setPendingTo(toStr(to));
  }

  function handleApply() {
    onChange(pendingFrom, pendingTo);
    if (onClose) onClose();
  }

  const isPendingChanged = pendingFrom !== dateFrom || pendingTo !== dateTo;

  // Determine active preset
  const activePreset = useMemo(() => {
    return presets.find((p) => {
      if (p.key === "all") return !pendingFrom && !pendingTo;
      const { from, to } = getPresetRange(p.key);
      return toStr(from) === pendingFrom && toStr(to) === pendingTo;
    });
  }, [pendingFrom, pendingTo, presets]);

  return (
    <div className="border-t border-b border-border pt-2 pb-2">
      <div className="px-3 pb-2 flex justify-between items-center">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
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
                  activePreset && activePreset.key !== "all"
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {activePreset
                  ? activePreset.label
                  : t("common.custom", "Tùy chỉnh")}
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
              {presets.map((p) => {
                const isActive = activePreset?.key === p.key;
                return (
                  <DropdownMenu.Item
                    key={p.key}
                    onSelect={() => handlePreset(p.key)}
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

      {/* Date inputs row - stacked to prevent lateral overflow */}
      <div className="px-3 pt-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground w-16 shrink-0">
            {t("common.dateFrom", "Từ ngày")}
          </label>
          <DatePicker
            value={pendingFrom}
            onChange={(val) => setPendingFrom(val)}
            placeholder="dd/mm/yyyy"
            className="flex-1 text-xs h-8"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground w-16 shrink-0">
            {t("common.dateTo", "Đến ngày")}
          </label>
          <DatePicker
            value={pendingTo}
            onChange={(val) => setPendingTo(val)}
            placeholder="dd/mm/yyyy"
            className="flex-1 text-xs h-8"
          />
        </div>
      </div>

      <div className="p-2 border-t border-border flex justify-between items-center bg-muted/50 rounded-b-xl mt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent px-2 h-7"
          onClick={() => {
            setPendingFrom("");
            setPendingTo("");
            onChange("", "");
            if (onClose) onClose();
          }}
        >
          {t("common.clearFilter", "Xóa bộ lọc")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="text-xs h-7 px-3"
          onClick={handleApply}
          disabled={!isPendingChanged}
        >
          {t("common.apply", "Áp dụng")}
        </Button>
      </div>
    </div>
  );
}
