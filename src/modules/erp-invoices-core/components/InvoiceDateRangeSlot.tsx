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
  startOfQuarter,
  endOfQuarter,
} from "date-fns";
import { cn } from "@/shared/utils";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";

interface InvoiceDateRangeSlotProps {
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
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
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
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": {
      const last = subMonths(now, 1);
      return { from: startOfMonth(last), to: endOfMonth(last) };
    }
    case "thisQuarter":
      return { from: startOfQuarter(now), to: endOfQuarter(now) };
    case "thisYear":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "all":
      return { from: undefined, to: undefined };
  }
}

export function InvoiceDateRangeSlot({
  dateFrom,
  dateTo,
  onChange,
  onClose,
}: InvoiceDateRangeSlotProps) {
  const t = useT();
  const [pendingFrom, setPendingFrom] = useState(dateFrom);
  const [pendingTo, setPendingTo] = useState(dateTo);

  const presets = useMemo<{ key: PresetKey; label: string }[]>(
    () => [
      { key: "today", label: t("common.today", "Hôm nay") },
      { key: "thisMonth", label: t("common.thisMonth", "Tháng này") },
      { key: "lastMonth", label: t("common.lastMonth", "Tháng trước") },
      { key: "thisQuarter", label: t("common.thisQuarter", "Quý này") },
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

  return (
    <div className="border-t border-b border-border pt-2 pb-2">
      {/* Quick period buttons — horizontal scroll, thin scrollbar, no wrap */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 pb-2 overflow-x-auto",
          "[&::-webkit-scrollbar]:h-[3px]",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-border",
        )}
      >
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handlePreset(p.key)}
            className={cn(
              "shrink-0 text-[10px] px-2.5 py-0.5 rounded-full border transition-colors whitespace-nowrap",
              p.key === "all" && !pendingFrom && !pendingTo
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted hover:bg-accent hover:text-foreground text-muted-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
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
