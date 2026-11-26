import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table as TableIcon, ShieldCheck, Clock, Kanban } from "lucide-react";
import type { V2TabItemData } from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";
import { GarageCasesTableTab } from "./components/GarageCasesTableTab";
import { DebtPartnerTab } from "../garage-debt-detail-drawer/components/DebtPartnerTab";
import { DebtClassificationTab } from "../garage-debt-detail-drawer/components/DebtClassificationTab";
import { GarageCasesKanbanContainer } from "@/v2/modules/cases-garage";
import type { useGarageCasesDetailDrawer } from "./GarageCasesDetailDrawer.hook";

type DrawerLogic = ReturnType<typeof useGarageCasesDetailDrawer>;

export function useGarageCasesDrawerTabs(logic: DrawerLogic): V2TabItemData[] {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const {
    isReceipt,
    isCheckpoint,
    showProfitMetrics,
    classification,
    checkpointSummary,
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
    cases,
    casesCount,
    vehicleTotal,
    isFunnel,
    initialStatus,
  } = logic;

  return useMemo<V2TabItemData[]>(() => {
    const isFunnelScope = Boolean(isCheckpoint && (classification || isFunnel));
    const mainTab: V2TabItemData = {
      key: "cases",
      label: isCheckpoint
        ? t("cases.tabs.carList", "Danh sách xe")
        : t("debts.detailDrawer.tabRemainingCases", "Phiếu còn công nợ"),
      icon: <Clock className="w-3.5 h-3.5" />,
      badgeCount: casesCount,
      content: (
        <GarageCasesTableTab
          cases={cases}
          initialDebtType={partnerDebtType}
          onOpenCaseDetail={setSelectedCaseCode}
          showProfitMetrics={showProfitMetrics}
          classification={classification}
          funnelCounts={checkpointSummary?.funnelCounts}
          isFunnelScope={isFunnelScope}
          initialCategoryFilter={initialStatus}
          vehicleTotal={vehicleTotal}
        />
      ),
    };

    if (isCheckpoint) {
      const kanbanTab: V2TabItemData = {
        key: "kanban",
        label: t("v2.garageCases.kanban.tabTitle", "Tiến độ công việc"),
        icon: <Kanban className="w-3.5 h-3.5" />,
        content: (
          <GarageCasesKanbanContainer
            cases={cases}
            // Danh sách xe ở đây lấy từ API V1 (chưa lọc theo chi nhánh ERP, Phase 5) nên Kanban V2
            // không gửi chi nhánh, để đọc và ghi cùng phạm vi với các thẻ đang hiện.
            onOpenCaseDetail={setSelectedCaseCode}
          />
        ),
      };

      return [mainTab, kanbanTab];
    }

    return [
      mainTab,
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
    ];
  }, [
    isCheckpoint,
    classification,
    isFunnel,
    initialStatus,
    showProfitMetrics,
    cases,
    casesCount,
    vehicleTotal,
    partnerDebtType,
    setSelectedCaseCode,
    totalPartnerCount,
    safeCategorized,
    setPartnerDebtType,
    effectiveBreakdownTotal,
    handleSelectPartnerGroup,
    isReceipt,
    classificationCount,
    receivableClassificationRows,
    payableClassificationRows,
    totalBilled,
    totalCost,
    handleSelectClassification,
    t,
  ]);
}
