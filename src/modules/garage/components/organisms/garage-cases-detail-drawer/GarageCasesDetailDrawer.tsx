import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  V2StandardDrawer,
  type DrawerAction,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { GarageMonthClassificationCasesDrawer } from "../../GarageMonthClassificationCasesDrawer";
import { GaragePartnerMonthDetailDrawer } from "../garage-partner-month-detail-drawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import { GarageExportDrawer } from "../../GarageExportDrawer";
import { GarageCasesRightPanel } from "./components/GarageCasesRightPanel";
import { DebtRateBadge } from "../garage-debt-detail-drawer/components/DebtRateBadge";
import { useGarageCasesDetailDrawer } from "./GarageCasesDetailDrawer.hook";
import { useGarageCasesDrawerTabs } from "./GarageCasesDetailDrawer.tabs";
import type { GarageCasesDetailDrawerProps } from "./GarageCasesDetailDrawer.type";

/**
 * Organism lõi dùng chung cho xem chi tiết vụ việc dịch vụ xưởng (Doanh thu & Công nợ).
 * Hỗ trợ layout 2 cột V2, bảng V2StandardTable, và điều khiển cột Doanh thu/Chi phí/Lợi nhuận qua showProfitMetrics.
 */
export const GarageCasesDetailDrawer: React.FC<
  GarageCasesDetailDrawerProps
> = ({
  open,
  onClose,
  scope,
  showProfitMetrics = false,
  activeTab = "RECEIPT",
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [exportOpen, setExportOpen] = useState(false);

  const logic = useGarageCasesDetailDrawer({
    open,
    scope,
    activeTab,
    showProfitMetrics,
  });

  const {
    title,
    isReceipt,
    isCheckpoint,
    mainRate,
    safeItem,
    pnlSummary,
    checkpointSummary,
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
    dateFrom,
    dateTo,
  } = logic;

  const drawerTabs = useGarageCasesDrawerTabs(logic);

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
        id="garage-cases-detail-drawer"
        open={open}
        mode="view"
        onClose={onClose}
        title={title}
        subtitle={
          isCheckpoint
            ? dateFrom && dateTo
              ? `Khoảng thời gian: ${dateFrom} đến ${dateTo}`
              : undefined
            : isReceipt
              ? t(
                  "debts.detailDrawer.receiptSubtitle",
                  "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Thu & Đã Thu",
                )
              : t(
                  "debts.detailDrawer.paymentSubtitle",
                  "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Trả & Đã Trả",
                )
        }
        titleExtra={
          <div className="flex items-center gap-2">
            <DebtRateBadge rate={mainRate} isReceipt={isReceipt} />
            {isCheckpoint && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setExportOpen(true)}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </Button>
            )}
          </div>
        }
        size="xl"
        layout="2-columns"
        tabs={drawerTabs}
        defaultTabKey="cases"
        collapsibleRightPanel={true}
        rightPanel={
          <GarageCasesRightPanel
            item={safeItem}
            pnlSummary={pnlSummary}
            checkpointSummary={checkpointSummary}
            breakdownSummary={breakdownSummary}
            vatWarningInfo={vatWarningInfo}
            isReceipt={isReceipt}
            showProfitMetrics={showProfitMetrics}
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

      {isCheckpoint && dateFrom && dateTo && (
        <GarageExportDrawer
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          defaultReportType="period-all"
          initialRange={{ from: dateFrom, to: dateTo }}
        />
      )}
    </>
  );
};
