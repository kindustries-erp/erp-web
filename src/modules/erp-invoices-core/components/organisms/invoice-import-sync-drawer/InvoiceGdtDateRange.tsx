import {
  format,
  isValid,
  addDays,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInDays,
} from "date-fns";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import type { getPastMonthPresets } from "@/shared/utils/datePresets";

type PresetOptions = ReturnType<typeof getPastMonthPresets>;

export interface InvoiceGdtDateRangeProps {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (val: string) => void;
  setDateTo: (val: string) => void;
  presetOptions: PresetOptions;
  selectedPreset: string;
  setSelectedPreset: (val: string) => void;
}

const MAX_RANGE_DAYS = 30;

export function InvoiceGdtDateRange({
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  presetOptions,
  selectedPreset,
  setSelectedPreset,
}: InvoiceGdtDateRangeProps) {
  const dFrom = dateFrom ? parseISO(dateFrom) : null;
  const dateToMax =
    dFrom && isValid(dFrom)
      ? format(addDays(dFrom, MAX_RANGE_DAYS), "yyyy-MM-dd")
      : undefined;

  const handlePresetChange = (val: string) => {
    setSelectedPreset(val);
    if (!val) return;
    if (val.startsWith("month-")) {
      const parts = val.split("-");
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const d = new Date(y, m, 1);
      setDateFrom(format(startOfMonth(d), "yyyy-MM-dd"));
      setDateTo(format(endOfMonth(d), "yyyy-MM-dd"));
    }
  };

  const handleDateFromChange = (val: string) => {
    setDateFrom(val);
    setSelectedPreset("");
    if (!val) return;
    const newDFrom = parseISO(val);
    if (!isValid(newDFrom)) return;
    if (!dateTo) {
      setDateTo(format(addDays(newDFrom, MAX_RANGE_DAYS), "yyyy-MM-dd"));
      return;
    }
    const currDTo = parseISO(dateTo);
    if (!isValid(currDTo)) return;
    const diff = differenceInDays(currDTo, newDFrom);
    if (diff < 0 || diff > MAX_RANGE_DAYS) {
      setDateTo(format(addDays(newDFrom, MAX_RANGE_DAYS), "yyyy-MM-dd"));
    }
  };

  const handleDateToChange = (val: string) => {
    setDateTo(val);
    setSelectedPreset("");
  };

  return (
    <div className="flex items-center gap-3">
      <V2Combobox
        options={presetOptions}
        value={selectedPreset || null}
        onValueChange={(v) => handlePresetChange(v ?? "")}
        placeholder="Chọn nhanh kỳ..."
        className="flex-1"
      />
      <V2DatePicker
        value={dateFrom || null}
        onValueChange={(v) => handleDateFromChange(v ?? "")}
        placeholder="Từ ngày"
        className="flex-1"
      />
      <V2DatePicker
        value={dateTo || null}
        onValueChange={(v) => handleDateToChange(v ?? "")}
        placeholder="Đến ngày"
        className="flex-1"
        minDate={dateFrom || undefined}
        maxDate={dateToMax}
      />
    </div>
  );
}
