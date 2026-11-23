import { useEffect, useMemo, useState } from "react";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { buildMonthClassificationRows } from "../garage-month-detail-drawer/utils/buildMonthClassificationRows";
import { countClassificationKeys } from "./GarageCasesDetailDrawer.helper";

/** Tab thu/chi và loại công nợ, đồng bộ lại khi `activeTab` đổi. */
export function useDrawerDebtTabState(activeTab: "RECEIPT" | "PAYMENT") {
  const toDebtType = (tab: "RECEIPT" | "PAYMENT") =>
    tab === "PAYMENT" ? "payables" : "receivables";
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [partnerDebtType, setPartnerDebtType] = useState<
    "receivables" | "payables"
  >(toDebtType(activeTab));

  useEffect(() => {
    setCurrentTab(activeTab);
    setPartnerDebtType(toDebtType(activeTab));
  }, [activeTab]);

  return { currentTab, partnerDebtType, setPartnerDebtType };
}

/** Dòng phân loại phải thu/phải trả của kỳ và số phân loại khác nhau. */
export function useDrawerClassificationRows(safeItem: GarageTrendItem) {
  const receivableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeItem, "receivables"),
    [safeItem],
  );
  const payableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeItem, "payables"),
    [safeItem],
  );
  const classificationCount = useMemo(
    () =>
      countClassificationKeys(
        receivableClassificationRows,
        payableClassificationRows,
      ),
    [receivableClassificationRows, payableClassificationRows],
  );
  return {
    receivableClassificationRows,
    payableClassificationRows,
    classificationCount,
  };
}
