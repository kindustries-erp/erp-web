import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { garageApi } from "@/modules/garage/api/garageApi";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { filterClientItems } from "@/shared/components/DataTable";
import type { GaragePartnerMonthDetailDrawerProps } from "./GaragePartnerMonthDetailDrawer.type";
import {
  parseMonth,
  calculatePartnerMonthMetrics,
  calculatePartnerClassificationRows,
} from "./GaragePartnerMonthDetailDrawer.helper";

export function useGaragePartnerMonthDetailDrawerLogic({
  open,
  month,
  customerCode,
  branchId,
  initialDebtType = "receivables",
  initialCases,
}: GaragePartnerMonthDetailDrawerProps) {
  const [debtType, setDebtType] = useState<"receivables" | "payables">(
    initialDebtType,
  );
  useEffect(() => {
    if (initialDebtType) setDebtType(initialDebtType);
  }, [initialDebtType]);

  const [activeSubTab, setActiveSubTab] = useState<"cases" | "classification">(
    "cases",
  );

  const { monthKey, monthLabel, dateFrom, dateTo } = useMemo(
    () => parseMonth(month),
    [month],
  );

  const tableHook = useTableColumnState(
    `garage-partner-month-${customerCode || "all"}-${monthKey}`,
  );

  const {
    data: fetchedCases = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "garage-cases-by-partner-month",
      branchId,
      customerCode,
      monthKey,
    ],
    queryFn: async () => {
      if (!customerCode) return [];
      return garageApi.getCasesByCustomer(branchId || "", customerCode);
    },
    enabled: open && !initialCases && Boolean(customerCode),
  });

  const monthCases = useMemo(() => {
    const source =
      initialCases && initialCases.length > 0 ? initialCases : fetchedCases;

    return source.filter((c: any) => {
      const isCompleted =
        c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec);
      if (!isCompleted) return false;
      const dateStr = String(c.ngayHoanThanhCongViec || c.ngayPhatSinh || "");
      return dateStr.startsWith(monthKey);
    });
  }, [initialCases, fetchedCases, monthKey]);

  const filteredCases = useMemo(() => {
    return filterClientItems(monthCases, tableHook, {
      dateField: "ngayHoanThanhCongViec",
    });
  }, [monthCases, tableHook]);

  const metrics = useMemo(
    () => calculatePartnerMonthMetrics(monthCases, debtType),
    [monthCases, debtType],
  );

  const classificationRows = useMemo(
    () =>
      calculatePartnerClassificationRows(
        monthCases,
        debtType,
        metrics.totalBilled,
      ),
    [monthCases, debtType, metrics.totalBilled],
  );

  const handleDebtTypeChange = useCallback(
    (newType: "receivables" | "payables") => {
      setDebtType(newType);
    },
    [],
  );

  return {
    debtType,
    handleDebtTypeChange,
    activeSubTab,
    setActiveSubTab,
    monthKey,
    monthLabel,
    dateFrom,
    dateTo,
    tableHook,
    monthCases,
    filteredCases,
    metrics,
    classificationRows,
    isLoading: !initialCases && isLoading,
    refetch,
  };
}
