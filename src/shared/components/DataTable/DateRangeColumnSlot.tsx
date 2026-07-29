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
  isBefore,
  parseISO,
} from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, CalendarRange, ChevronRight } from "lucide-react";
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
  | "all"
  | `month-${string}`
  | `quarter-${string}`;

function getPresetRange(
  key: PresetKey,
  year: number,
): {
  from: Date | undefined;
  to: Date | undefined;
} {
  const now = new Date();
  if (key.startsWith("month-")) {
    const m = parseInt(key.split("-")[1], 10) - 1;
    const d = new Date(year, m, 1);
    return { from: startOfMonth(d), to: endOfMonth(d) };
  }
  if (key.startsWith("quarter-")) {
    const q = parseInt(key.split("-")[1], 10) - 1;
    const m = q * 3;
    const d = new Date(year, m, 1);
    return { from: startOfQuarter(d), to: endOfQuarter(d) };
  }

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
    default:
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (pendingFrom) {
      const d = parseISO(pendingFrom);
      if (isValid(d)) setSelectedYear(d.getFullYear());
    }
  }, [pendingFrom]);

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

  const monthPresets = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      key: `month-${i + 1}` as PresetKey,
      label: `Tháng ${i + 1}`,
    }));
  }, []);

  const quarterPresets = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      key: `quarter-${i + 1}` as PresetKey,
      label: `Quý ${i + 1}`,
    }));
  }, []);

  // Sync external changes (e.g. external reset)
  useEffect(() => {
    setPendingFrom(dateFrom);
    setPendingTo(dateTo);
  }, [dateFrom, dateTo]);

  function handlePreset(key: PresetKey) {
    const { from, to } = getPresetRange(key, selectedYear);
    setPendingFrom(toStr(from));
    setPendingTo(toStr(to));
  }

  function handleApply() {
    onChange(pendingFrom, pendingTo);
    if (onClose) onClose();
  }

  const isPendingChanged = pendingFrom !== dateFrom || pendingTo !== dateTo;

  const isInvalidRange = useMemo(() => {
    if (!pendingFrom || !pendingTo) return false;
    const from = parseISO(pendingFrom);
    const to = parseISO(pendingTo);
    if (isValid(from) && isValid(to)) {
      return isBefore(to, from);
    }
    return false;
  }, [pendingFrom, pendingTo]);

  // Determine active preset
  const activePreset = useMemo(() => {
    const allPresets = [...presets, ...monthPresets, ...quarterPresets];
    return allPresets.find((p) => {
      if (p.key === "all") return !pendingFrom && !pendingTo;
      const { from, to } = getPresetRange(p.key, selectedYear);
      return toStr(from) === pendingFrom && toStr(to) === pendingTo;
    });
  }, [
    pendingFrom,
    pendingTo,
    presets,
    monthPresets,
    quarterPresets,
    selectedYear,
  ]);

  const handleYearChange = (newYear: number) => {
    const currentActive = activePreset;
    setSelectedYear(newYear);
    if (
      currentActive &&
      (currentActive.key.startsWith("month-") ||
        currentActive.key.startsWith("quarter-"))
    ) {
      const { from, to } = getPresetRange(currentActive.key, newYear);
      setPendingFrom(toStr(from));
      setPendingTo(toStr(to));
    }
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      arr.push(i);
    }
    return arr;
  }, []);

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
              className="z-[9999] min-w-[160px] rounded-lg p-1 popup-content bg-popover shadow-md border border-border"
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

              <DropdownMenu.Separator className="h-px bg-border my-1 mx-1" />

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex items-center justify-between px-3 py-1.5 text-xs rounded-md cursor-pointer outline-none select-none transition-colors text-foreground hover:bg-muted focus:bg-muted data-[state=open]:bg-muted">
                  {t("common.byYear", "Theo năm")}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="z-[9999] min-w-[120px] rounded-lg p-1 popup-content bg-popover shadow-md border border-border max-h-[250px] overflow-y-auto"
                    sideOffset={8}
                    alignOffset={-4}
                  >
                    {years.map((y) => (
                      <DropdownMenu.Item
                        key={y}
                        onSelect={(e) => {
                          e.preventDefault(); // Keep menu open to allow selecting month afterwards
                          handleYearChange(y);
                        }}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-md cursor-pointer outline-none select-none transition-colors",
                          selectedYear === y
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted focus:bg-muted",
                        )}
                      >
                        Năm {y}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              <DropdownMenu.Separator className="h-px bg-border my-1 mx-1" />

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex items-center justify-between px-3 py-1.5 text-xs rounded-md cursor-pointer outline-none select-none transition-colors text-foreground hover:bg-muted focus:bg-muted data-[state=open]:bg-muted">
                  {t("common.byMonth", "Theo tháng")}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="z-[9999] min-w-[200px] rounded-lg p-2 popup-content bg-popover shadow-md border border-border"
                    sideOffset={8}
                    alignOffset={-4}
                  >
                    <div className="grid grid-cols-3 gap-1">
                      {monthPresets.map((p) => {
                        const isActive = activePreset?.key === p.key;
                        return (
                          <DropdownMenu.Item
                            key={p.key}
                            onSelect={() => handlePreset(p.key)}
                            className={cn(
                              "px-3 py-1.5 text-xs rounded-md cursor-pointer outline-none select-none transition-colors text-center",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-muted focus:bg-muted",
                            )}
                          >
                            {p.label}
                          </DropdownMenu.Item>
                        );
                      })}
                    </div>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex items-center justify-between px-3 py-1.5 text-xs rounded-md cursor-pointer outline-none select-none transition-colors text-foreground hover:bg-muted focus:bg-muted data-[state=open]:bg-muted">
                  {t("common.byQuarter", "Theo quý")}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="z-[9999] min-w-[120px] rounded-lg p-1 popup-content bg-popover shadow-md border border-border"
                    sideOffset={8}
                    alignOffset={-4}
                  >
                    {quarterPresets.map((p) => {
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
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
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
            minDate={pendingFrom}
            defaultMonth={pendingFrom ? parseISO(pendingFrom) : undefined}
          />
        </div>
        {isInvalidRange && (
          <div className="text-[11px] text-destructive leading-tight text-center mt-1">
            {t(
              "common.invalidDateRange",
              "Ngày đến phải lớn hơn hoặc bằng ngày từ",
            )}
          </div>
        )}
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
          disabled={!isPendingChanged || isInvalidRange}
        >
          {t("common.apply", "Áp dụng")}
        </Button>
      </div>
    </div>
  );
}
