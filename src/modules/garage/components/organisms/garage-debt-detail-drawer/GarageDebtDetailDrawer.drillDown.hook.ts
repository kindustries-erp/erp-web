import { useState, useCallback } from "react";
import type { MonthlyReceivablesGroupItem } from "@/modules/garage/api/garageDashboardApi";
import type { MonthClassificationRow } from "../garage-month-detail-drawer/components/MonthClassificationTable.type";

export function useDebtDetailDrillDown() {
  const [classificationDrawer, setClassificationDrawer] = useState<{
    open: boolean;
    filterKey: string;
    filterLabel: string;
  }>({ open: false, filterKey: "", filterLabel: "" });

  const [partnerDrawer, setPartnerDrawer] = useState<{
    open: boolean;
    customerCode?: string | null;
    customerName?: string | null;
    taxCode?: string | null;
    initialCases?: any[];
  }>({ open: false });

  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

  const handleSelectClassification = useCallback(
    (row: MonthClassificationRow) =>
      setClassificationDrawer({
        open: true,
        filterKey: row.key,
        filterLabel: row.name,
      }),
    [],
  );

  const handleSelectPartnerGroup = useCallback(
    (group: MonthlyReceivablesGroupItem) =>
      setPartnerDrawer({
        open: true,
        customerCode: group.taxCode || group.key,
        customerName: group.title,
        taxCode: group.taxCode,
        initialCases: group.cases,
      }),
    [],
  );

  return {
    classificationDrawer,
    setClassificationDrawer,
    partnerDrawer,
    setPartnerDrawer,
    selectedCaseCode,
    setSelectedCaseCode,
    handleSelectClassification,
    handleSelectPartnerGroup,
  };
}
