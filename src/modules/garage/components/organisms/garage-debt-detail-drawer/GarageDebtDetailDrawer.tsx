import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { Table as TableIcon, ShieldCheck, Clock } from "lucide-react";
import { GarageMonthClassificationCasesDrawer } from "../../GarageMonthClassificationCasesDrawer";
import { GaragePartnerMonthDetailDrawer } from "../garage-partner-month-detail-drawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import { DebtClassificationTab } from "./components/DebtClassificationTab";
import { DebtPartnerTab } from "./components/DebtPartnerTab";
import { DebtRemainingCasesTab } from "./components/DebtRemainingCasesTab";
import { DebtRightPanel } from "./components/DebtRightPanel";
import { DebtRateBadge } from "./components/DebtRateBadge";
import { useGarageDebtDetailDrawer } from "./GarageDebtDetailDrawer.hook";
import type { GarageDebtDetailDrawerProps } from "./GarageDebtDetailDrawer.type";

/**
 * Drawer chi tiết công nợ dùng chung cho tháng (xu hướng) và mốc tuổi nợ (thẻ).
 * Gồm 3 tabs: Phân loại nghiệp vụ, Phân loại theo đối tượng, và Phiếu còn công nợ.
 */
export const GarageDebtDetailDrawer: React.FC<GarageDebtDetailDrawerProps> = ({
  open,
  onClose,
  scope,
  activeTab = "RECEIPT",
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const logic = useGarageDebtDetailDrawer({ open, scope, activeTab });
  const {
    title,
    isReceipt,
    mainRate,
    safeItem,
    breakdownSummary,
    vatWarningInfo,
    safeCategorized,
    totalBilled,
    totalCost,
    effectiveBreakdownTotal,
    receivableClassificationRows,
    payableClassificationRows,
    classificationCount,
    totalPartnerCount,
    unpaidCases,
    unpaidCasesCount,
    partnerDebtType,
    setPartnerDebtType,
    classificationDrawer,
    setClassificationDrawer,
    partnerDrawer,
    setPartnerDrawer,
    selectedCaseCode,
    setSelectedCaseCode,
    handleSelectClassification,
    handleSelectPartnerGroup,
    horizon,
    branchId,
    currentTab,
  } = logic;

  const drawerTabs = useMemo<DrawerTopTabItem[]>(
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

  if (!scope) return null;

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={title}
        subtitle={
          isReceipt
            ? t(
                "debts.detailDrawer.receiptSubtitle",
                "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Thu & Đã Thu",
              )
            : t(
                "debts.detailDrawer.paymentSubtitle",
                "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Trả & Đã Trả",
              )
        }
        titleExtra={<DebtRateBadge rate={mainRate} isReceipt={isReceipt} />}
        size="xl"
        layout="2-columns"
        tabs={drawerTabs}
        defaultTabKey="unpaid_cases"
        collapsibleRightPanel={true}
        rightPanelDefaultCollapsed={false}
        rightPanel={
          <DebtRightPanel
            item={safeItem}
            breakdownSummary={breakdownSummary}
            vatWarningInfo={vatWarningInfo}
            isReceipt={isReceipt}
          />
        }
        actions={[
          {
            label: t("common.close", "Đóng"),
            variant: "outline",
            onClick: onClose,
          },
        ]}
      />

      <GarageMonthClassificationCasesDrawer
        open={classificationDrawer.open}
        month={horizon ? undefined : safeItem.label}
        horizon={horizon}
        monthLabel={title}
        filterType="CLASSIFICATION"
        filterKey={classificationDrawer.filterKey}
        filterLabel={classificationDrawer.filterLabel}
        activeTab={currentTab}
        branchId={branchId}
        onClose={() =>
          setClassificationDrawer((prev) => ({ ...prev, open: false }))
        }
      />

      <GaragePartnerMonthDetailDrawer
        open={partnerDrawer.open}
        onClose={() => setPartnerDrawer((prev) => ({ ...prev, open: false }))}
        month={horizon ? "" : safeItem.label}
        horizon={horizon}
        periodLabel={horizon ? title : undefined}
        customerCode={partnerDrawer.customerCode}
        customerName={partnerDrawer.customerName}
        taxCode={partnerDrawer.taxCode}
        branchId={branchId}
        initialDebtType={isReceipt ? "receivables" : "payables"}
        initialCases={partnerDrawer.initialCases}
      />

      <GarageCaseStandaloneDrawer
        isOpen={Boolean(selectedCaseCode)}
        caseCode={selectedCaseCode}
        onClose={() => setSelectedCaseCode(null)}
      />
    </>
  );
};
