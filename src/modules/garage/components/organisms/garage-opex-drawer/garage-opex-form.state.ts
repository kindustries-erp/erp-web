import { useState, useCallback } from "react";
import type { CostGroupType } from "./garage-opex-drawer.type";
import { CATEGORY_PRESETS } from "./garage-opex-drawer.constants";
import { extractOpexFormData } from "./garage-opex-drawer.helper";

export function useOpexFormFields(
  currentYear: number,
  currentMonth: number,
  t: (key: string, fallback: string) => string,
) {
  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [costGroup, setCostGroup] = useState<CostGroupType>("OPEX");
  const [categoryKey, setCategoryKey] = useState<string>("NHAN_SU");
  const [categoryName, setCategoryName] = useState<string>("Nhân sự");
  const [amount, setAmount] = useState<string>("0");
  const [ojAmount, setOjAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [untilMonth, setUntilMonth] = useState<number>(12);
  const [untilYear, setUntilYear] = useState<number>(currentYear);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const applyFormData = useCallback(
    (f: ReturnType<typeof extractOpexFormData>) => {
      setPeriodYear(f.periodYear);
      setPeriodMonth(f.periodMonth);
      setCostGroup(f.costGroup);
      setCategoryKey(f.categoryKey);
      setCategoryName(f.categoryName);
      setAmount(f.amount);
      setOjAmount(f.ojAmount);
      setNote(f.note);
      setIsRecurring(f.isRecurring);
      setUntilYear(f.untilYear);
      setUntilMonth(f.untilMonth);
    },
    [],
  );

  const handleCostGroupChange = useCallback(
    (newGroup: string) => {
      setCostGroup(newGroup as CostGroupType);
      const presets = CATEGORY_PRESETS.filter((p) => p.group === newGroup);
      if (presets.length > 0) {
        setCategoryKey(presets[0].key);
        setCategoryName(
          t(`opex.${presets[0].labelKey}`, presets[0].defaultName),
        );
      }
    },
    [t],
  );

  const handleCategoryChange = useCallback(
    (key: string) => {
      setCategoryKey(key);
      const preset = CATEGORY_PRESETS.find((p) => p.key === key);
      if (preset)
        setCategoryName(t(`opex.${preset.labelKey}`, preset.defaultName));
    },
    [t],
  );

  return {
    periodYear,
    setPeriodYear,
    periodMonth,
    setPeriodMonth,
    costGroup,
    setCostGroup,
    categoryKey,
    setCategoryKey,
    categoryName,
    setCategoryName,
    amount,
    setAmount,
    ojAmount,
    setOjAmount,
    note,
    setNote,
    loading,
    setLoading,
    isRecurring,
    setIsRecurring,
    untilMonth,
    setUntilMonth,
    untilYear,
    setUntilYear,
    showConfirmModal,
    setShowConfirmModal,
    applyFormData,
    handleCostGroupChange,
    handleCategoryChange,
  };
}
