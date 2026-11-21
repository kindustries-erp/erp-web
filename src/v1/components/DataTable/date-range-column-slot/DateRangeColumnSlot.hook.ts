import { useState, useEffect, useMemo, useCallback } from "react";
import { useT } from "@/core/i18n";
import { isValid, isBefore, parseISO } from "date-fns";
import type {
  DateRangeColumnSlotProps,
  PeriodPresetKey,
} from "./DateRangeColumnSlot.type";
import {
  buildQuickPresetOptions,
  buildMonthPeriodOptions,
  getRangeForPreset,
  getRangeForMonthPeriod,
  detectPresetFromRange,
  detectMonthPeriodFromRange,
} from "./DateRangeColumnSlot.helper";

export function useDateRangeColumnSlot({
  dateFrom,
  dateTo,
  onChange,
  onClose,
}: DateRangeColumnSlotProps) {
  const t = useT();

  const [pendingFrom, setPendingFrom] = useState(dateFrom || "");
  const [pendingTo, setPendingTo] = useState(dateTo || "");

  // Options
  const quickPresets = useMemo(() => buildQuickPresetOptions(t), [t]);
  const monthPeriodOptions = useMemo(() => buildMonthPeriodOptions(t), [t]);

  // Derived active states
  const activePresetKey = useMemo<PeriodPresetKey>(
    () => detectPresetFromRange(pendingFrom, pendingTo),
    [pendingFrom, pendingTo],
  );

  const activePresetLabel = useMemo(() => {
    const found = quickPresets.find((p) => p.key === activePresetKey);
    return found ? found.label : t("common.custom", "Tùy chỉnh");
  }, [activePresetKey, quickPresets, t]);

  const selectedMonthPeriod = useMemo(
    () => detectMonthPeriodFromRange(pendingFrom, pendingTo),
    [pendingFrom, pendingTo],
  );

  // Sync with incoming props
  useEffect(() => {
    setPendingFrom(dateFrom || "");
    setPendingTo(dateTo || "");
  }, [dateFrom, dateTo]);

  // Handlers
  const handlePresetSelect = useCallback((key: PeriodPresetKey) => {
    if (key === "all") {
      setPendingFrom("");
      setPendingTo("");
      return;
    }
    const range = getRangeForPreset(key);
    setPendingFrom(range.from);
    setPendingTo(range.to);
  }, []);

  const handleMonthPeriodChange = useCallback((periodKey?: string) => {
    const key = periodKey || "all";
    if (key === "all") {
      setPendingFrom("");
      setPendingTo("");
      return;
    }
    if (key === "custom") return;
    const range = getRangeForMonthPeriod(key);
    setPendingFrom(range.from);
    setPendingTo(range.to);
  }, []);

  const handleDateFromChange = useCallback((val: string) => {
    setPendingFrom(val);
  }, []);

  const handleDateToChange = useCallback((val: string) => {
    setPendingTo(val);
  }, []);

  // Validation
  const isInvalidRange = useMemo(() => {
    if (!pendingFrom || !pendingTo) return false;
    const from = parseISO(pendingFrom);
    const to = parseISO(pendingTo);
    if (isValid(from) && isValid(to)) {
      return isBefore(to, from);
    }
    return false;
  }, [pendingFrom, pendingTo]);

  const isPendingChanged =
    pendingFrom !== (dateFrom || "") || pendingTo !== (dateTo || "");

  const handleApply = useCallback(() => {
    onChange(pendingFrom, pendingTo);
    if (onClose) onClose();
  }, [onChange, pendingFrom, pendingTo, onClose]);

  const handleClear = useCallback(() => {
    setPendingFrom("");
    setPendingTo("");
    onChange("", "");
    if (onClose) onClose();
  }, [onChange, onClose]);

  return {
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
  };
}
