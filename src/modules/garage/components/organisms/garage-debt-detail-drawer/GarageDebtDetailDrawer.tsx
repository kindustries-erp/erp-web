import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  V2StandardDrawer,
  type DrawerAction,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { GarageMonthClassificationCasesDrawer } from "../../GarageMonthClassificationCasesDrawer";
import { GaragePartnerMonthDetailDrawer } from "../garage-partner-month-detail-drawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import { DebtRightPanel } from "./components/DebtRightPanel";
import { DebtRateBadge } from "./components/DebtRateBadge";
import { useGarageDebtDetailDrawer } from "./GarageDebtDetailDrawer.hook";
import { useGarageDebtDrawerTabs } from "./GarageDebtDetailDrawer.tabs";
import type { GarageDebtDetailDrawerProps } from "./GarageDebtDetailDrawer.type";

/**
 * Drawer chi tiết công nợ thế hệ mới chuẩn V2 dùng chung cho tháng và mốc tuổi nợ.
 * Gồm 3 tabs: Phiếu còn công nợ, Phân loại theo đối tượng, và Phân loại nghiệp vụ.
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
    classificationDrawer,
    setClassificationDrawer,
    partnerDrawer,
    setPartnerDrawer,
    selectedCaseCode,
    setSelectedCaseCode,
    horizon,
    branchId,
    currentTab,
  } = logic;

  const drawerTabs = useGarageDebtDrawerTabs(logic);

  const drawerActions = useMemo<DrawerAction[]>(
    () => [
      {
        label: t("common.close", "Đóng"),
        variant: "outline",
        onClick: onClose,
      },
    ],
    [t, onClose],
  );

  if (!scope) return null;

  return (
    <>
      <V2StandardDrawer
        id="garage-debt-detail-drawer"
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
        rightPanel={
          <DebtRightPanel
            item={safeItem}
            breakdownSummary={breakdownSummary}
            vatWarningInfo={vatWarningInfo}
            isReceipt={isReceipt}
          />
        }
        actions={drawerActions}
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
