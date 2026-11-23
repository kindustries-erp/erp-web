import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table as TableIcon, ShieldCheck, Clock } from "lucide-react";
import type { V2TabItemData } from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";
import { DebtRemainingCasesTab } from "./components/DebtRemainingCasesTab";
import { DebtPartnerTab } from "./components/DebtPartnerTab";
import { DebtClassificationTab } from "./components/DebtClassificationTab";
import type { useGarageDebtDetailDrawer } from "./GarageDebtDetailDrawer.hook";

type DrawerLogic = ReturnType<typeof useGarageDebtDetailDrawer>;

export function useGarageDebtDrawerTabs(logic: DrawerLogic): V2TabItemData[] {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const {
    isReceipt,
    classificationCount,
    receivableClassificationRows,
    payableClassificationRows,
    totalBilled,
    totalCost,
    handleSelectClassification,
    totalPartnerCount,
    safeCategorized,
    partnerDebtType,
    setPartnerDebtType,
    effectiveBreakdownTotal,
    handleSelectPartnerGroup,
    setSelectedCaseCode,
    unpaidCases,
    unpaidCasesCount,
  } = logic;

  return useMemo<V2TabItemData[]>(
    () => [
      {
        key: "unpaid_cases",
        label: t("debts.detailDrawer.tabRemainingCases", "Phiếu còn công nợ"),
        icon: <Clock className="w-3.5 h-3.5" />,
        badgeCount: unpaidCasesCount,
        content: (
          <DebtRemainingCasesTab
            cases={unpaidCases}
            initialDebtType={partnerDebtType}
            onOpenCaseDetail={setSelectedCaseCode}
          />
        ),
      },
      {
        key: "partner_breakdown",
        label: t(
          "progress.tabs.partnerClassification",
          "Phân loại theo đối tượng",
        ),
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        badgeCount: totalPartnerCount,
        content: (
          <DebtPartnerTab
            safeCategorized={safeCategorized}
            partnerDebtType={partnerDebtType}
            onPartnerDebtTypeChange={setPartnerDebtType}
            effectiveBreakdownTotal={effectiveBreakdownTotal}
            onSelectGroup={handleSelectPartnerGroup}
            onOpenCaseDetail={setSelectedCaseCode}
          />
        ),
      },
      {
        key: "classification",
        label: isReceipt
          ? t("progress.tabs.businessClassification", "Phân loại Nghiệp vụ")
          : t("progress.tabs.costClassification", "Phân loại Chi phí"),
        icon: <TableIcon className="w-3.5 h-3.5" />,
        badgeCount: classificationCount,
        content: (
          <DebtClassificationTab
            receivableRows={receivableClassificationRows}
            payableRows={payableClassificationRows}
            totalBilled={totalBilled}
            totalCost={totalCost}
            onSelectClassification={handleSelectClassification}
          />
        ),
      },
    ],
    [
      isReceipt,
      classificationCount,
      receivableClassificationRows,
      payableClassificationRows,
      totalBilled,
      totalCost,
      handleSelectClassification,
      totalPartnerCount,
      safeCategorized,
      partnerDebtType,
      setPartnerDebtType,
      effectiveBreakdownTotal,
      handleSelectPartnerGroup,
      setSelectedCaseCode,
      unpaidCases,
      unpaidCasesCount,
      t,
    ],
  );
}
