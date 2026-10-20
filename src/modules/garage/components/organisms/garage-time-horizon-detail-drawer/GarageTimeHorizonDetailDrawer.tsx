import React, { useMemo } from "react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import {
  Table as TableIcon,
  ShieldCheck,
  FileText,
  Wallet,
  Truck,
} from "lucide-react";
import { useGarageTimeHorizonDetailDrawer } from "./GarageTimeHorizonDetailDrawer.hook";
import { TimeHorizonClassificationTab } from "./components/TimeHorizonClassificationTab";
import { TimeHorizonPartnerTab } from "./components/TimeHorizonPartnerTab";
import { TimeHorizonCasesTab } from "./components/TimeHorizonCasesTab";
import { TimeHorizonRightPanel } from "./components/TimeHorizonRightPanel";
import { GarageMonthClassificationCasesDrawer } from "../../GarageMonthClassificationCasesDrawer";
import { GaragePartnerMonthDetailDrawer } from "../garage-partner-month-detail-drawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import type { GarageTimeHorizonDetailDrawerProps } from "./GarageTimeHorizonDetailDrawer.type";

export const GarageTimeHorizonDetailDrawer: React.FC<
  GarageTimeHorizonDetailDrawerProps
> = (props) => {
  const { open, onClose, onOpenCustomerDetail } = props;
  const logic = useGarageTimeHorizonDetailDrawer(props);
  const {
    t,
    isReceipt,
    mainRate,
    breakdown,
    casesSummary,
    receivableClassificationRows,
    payableClassificationRows,
    totalBilled,
    totalCost,
    safeCategorized,
    partnerDebtType,
    setPartnerDebtType,
    handleSelectClassification,
    handleSelectPartnerGroup,
    selectedCaseCode,
    setSelectedCaseCode,
    classificationDrawerState,
    setClassificationDrawerState,
    partnerMonthDrawerState,
    setPartnerMonthDrawerState,
  } = logic;

  const totalPartners =
    safeCategorized.enterprise.all.length +
    safeCategorized.individual.all.length +
    safeCategorized.insurance.all.length;

  const drawerTabs = useMemo<DrawerTopTabItem[]>(
    () => [
      {
        key: "classification",
        label: isReceipt ? "Phân loại Nghiệp vụ" : "Phân loại Chi phí",
        icon: <TableIcon className="w-3.5 h-3.5" />,
        badgeCount: receivableClassificationRows.length,
        content: (
          <TimeHorizonClassificationTab
            receivableRows={receivableClassificationRows}
            payableRows={payableClassificationRows}
            totalBilled={totalBilled}
            totalCost={totalCost}
            onSelectClassification={handleSelectClassification}
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
        badgeCount: totalPartners,
        content: (
          <TimeHorizonPartnerTab
            safeCategorized={safeCategorized}
            partnerDebtType={partnerDebtType}
            onPartnerDebtTypeChange={setPartnerDebtType}
            effectiveBreakdownTotal={
              partnerDebtType === "payables" ? totalCost : totalBilled
            }
            onSelectGroup={handleSelectPartnerGroup}
            onOpenCaseDetail={setSelectedCaseCode}
          />
        ),
      },
      {
        key: "cases",
        label: "Danh sách vụ việc",
        icon: <FileText className="w-3.5 h-3.5" />,
        badgeCount: logic.total,
        content: (
          <TimeHorizonCasesTab
            items={logic.items}
            isLoading={logic.isLoading}
            page={logic.page}
            pageSize={logic.pageSize}
            total={logic.total}
            totalPages={logic.totalPages}
            onPageChange={logic.setPage}
            onPageSizeChange={logic.setPageSize}
            onOpenCustomerDetail={onOpenCustomerDetail}
          />
        ),
      },
    ],
    [
      isReceipt,
      receivableClassificationRows,
      payableClassificationRows,
      totalBilled,
      totalCost,
      totalPartners,
      safeCategorized,
      partnerDebtType,
      logic.items,
      logic.isLoading,
      logic.page,
      logic.pageSize,
      logic.total,
      logic.totalPages,
      t,
      handleSelectClassification,
      handleSelectPartnerGroup,
      setPartnerDebtType,
      setSelectedCaseCode,
      logic.setPage,
      logic.setPageSize,
      onOpenCustomerDetail,
    ],
  );

  const title =
    breakdown?.monthLabel ||
    casesSummary?.horizonLabel ||
    "Chi tiết Mốc thời gian công nợ";

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={title}
        subtitle={
          isReceipt
            ? "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Thu & Đã Thu"
            : "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Trả & Đã Trả"
        }
        titleExtra={
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 border",
              mainRate >= 100
                ? isReceipt
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
            )}
          >
            {isReceipt ? (
              <Wallet className="w-3 h-3 inline mr-1" />
            ) : (
              <Truck className="w-3 h-3 inline mr-1" />
            )}
            {mainRate.toFixed(1)}% Hoàn tất
          </Badge>
        }
        size="xl"
        layout="2-columns"
        tabs={drawerTabs}
        defaultTabKey="classification"
        collapsibleRightPanel={true}
        rightPanelDefaultCollapsed={false}
        rightPanel={
          <TimeHorizonRightPanel
            summary={casesSummary}
            breakdownSummary={logic.breakdownSummary}
            trendItem={logic.trendItem}
            vatWarningInfo={logic.vatWarningInfo}
            isReceipt={isReceipt}
          />
        }
        actions={[{ label: "Đóng", variant: "outline", onClick: onClose }]}
      />

      {/* Sub-drawers */}
      <GarageMonthClassificationCasesDrawer
        open={classificationDrawerState.open}
        month={props.horizon || undefined}
        monthLabel={title}
        filterType={classificationDrawerState.filterType}
        filterKey={classificationDrawerState.filterKey}
        filterLabel={classificationDrawerState.filterLabel}
        activeTab={logic.activeTab}
        branchId={props.branchId}
        onClose={() =>
          setClassificationDrawerState((prev) => ({ ...prev, open: false }))
        }
      />

      <GaragePartnerMonthDetailDrawer
        open={partnerMonthDrawerState.open}
        onClose={() =>
          setPartnerMonthDrawerState((prev) => ({ ...prev, open: false }))
        }
        month={props.horizon || ""}
        customerCode={partnerMonthDrawerState.customerCode}
        customerName={partnerMonthDrawerState.customerName}
        taxCode={partnerMonthDrawerState.taxCode}
        initialDebtType={isReceipt ? "receivables" : "payables"}
        initialCases={partnerMonthDrawerState.initialCases}
      />

      <GarageCaseStandaloneDrawer
        isOpen={Boolean(selectedCaseCode)}
        caseCode={selectedCaseCode || undefined}
        onClose={() => setSelectedCaseCode(null)}
      />
    </>
  );
};
