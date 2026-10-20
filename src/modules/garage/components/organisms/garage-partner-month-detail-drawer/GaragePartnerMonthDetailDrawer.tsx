import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { PillTabs } from "@/shared/components/PillTabs";
import { Table as TableIcon, FileText } from "lucide-react";
import { CustomerDetailDebtSwitch } from "../garage-customer-detail-drawer/components/CustomerDetailDebtSwitch";
import { PartnerMonthKpiGrid } from "./components/PartnerMonthKpiGrid";
import { PartnerMonthCasesTable } from "./components/PartnerMonthCasesTable";
import { PartnerMonthClassificationTable } from "./components/PartnerMonthClassificationTable";
import { PartnerMonthSidebarSummary } from "./components/PartnerMonthSidebarSummary";
import { useGaragePartnerMonthDetailDrawerLogic } from "./GaragePartnerMonthDetailDrawer.hook";
import type { GaragePartnerMonthDetailDrawerProps } from "./GaragePartnerMonthDetailDrawer.type";

export function GaragePartnerMonthDetailDrawer(
  props: GaragePartnerMonthDetailDrawerProps,
) {
  const {
    open,
    onClose,
    customerCode,
    customerName,
    taxCode,
    onOpenCaseDetail,
    onOpenSettlementModal,
    onOpenInvoiceLinkingModal,
  } = props;
  const { t } = useTranslation(["garage", "debts", "common"]);

  const logic = useGaragePartnerMonthDetailDrawerLogic(props);

  const subTabs = useMemo(
    () => [
      {
        value: "cases",
        label: t("cases.drawer.tabCases", "1. Danh sách vụ việc"),
        icon: FileText,
        badge: logic.monthCases.length,
      },
      {
        value: "classification",
        label: t("cases.drawer.tabClassification", "2. Phân loại nghiệp vụ"),
        icon: TableIcon,
        badge: logic.classificationRows.length,
      },
    ],
    [logic.monthCases.length, logic.classificationRows.length, t],
  );

  const leftContent = (
    <div className="flex flex-col gap-3.5 flex-1 min-h-0 w-full">
      {/* 1. Header Toolbar with Subtabs and Debt Type Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/40 w-full shrink-0">
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full">
          <PillTabs
            items={subTabs}
            value={logic.activeSubTab}
            onValueChange={(val) => logic.setActiveSubTab(val as any)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CustomerDetailDebtSwitch
            value={logic.debtType}
            onChange={logic.handleDebtTypeChange}
          />
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <PartnerMonthKpiGrid metrics={logic.metrics} debtType={logic.debtType} />

      {/* 3. Main Tab Content */}
      <div className="flex-1 min-h-0 flex flex-col w-full">
        {logic.activeSubTab === "cases" ? (
          <PartnerMonthCasesTable
            cases={logic.filteredCases}
            debtType={logic.debtType}
            tableHook={logic.tableHook}
            onOpenCaseDetail={onOpenCaseDetail}
            onOpenSettlementModal={onOpenSettlementModal}
            onOpenInvoiceLinkingModal={onOpenInvoiceLinkingModal}
          />
        ) : (
          <PartnerMonthClassificationTable
            rows={logic.classificationRows}
            debtType={logic.debtType}
            totalBilled={logic.metrics.totalBilled}
          />
        )}
      </div>
    </div>
  );

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={`${logic.monthLabel} • ${customerName || customerCode || t("customers.detail", "Đối tượng")} (${logic.metrics.rate.toFixed(1)}% Hoàn tất)`}
      subtitle={
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {customerCode && (
            <span>
              Mã:{" "}
              <strong className="font-mono text-foreground">
                {customerCode}
              </strong>
            </span>
          )}
          {taxCode && (
            <span>
              • MST:{" "}
              <strong className="font-mono text-foreground">{taxCode}</strong>
            </span>
          )}
          <span>• Tiến độ Dòng tiền & Chi tiết Vụ việc trong tháng</span>
        </div>
      }
      size="full"
      layout="2-columns"
      leftPanel={leftContent}
      rightPanel={
        <PartnerMonthSidebarSummary
          metrics={logic.metrics}
          classificationRows={logic.classificationRows}
          debtType={logic.debtType}
        />
      }
    />
  );
}
