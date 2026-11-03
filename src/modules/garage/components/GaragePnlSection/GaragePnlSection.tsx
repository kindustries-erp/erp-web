import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  ArrowRight,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import { GaragePnlChartsCard } from "../GaragePnlCharts";
import { GarageOpexDrawer, type CostGroupType } from "../GarageOpexDrawer";
import { useGaragePnlLogic } from "./useGaragePnlLogic";
import { PnlFinancialTable } from "./components/PnlFinancialTable";
import { PnlViewModeSwitch } from "./components/PnlViewModeSwitch";

export function GaragePnlSection() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerCostGroup, setDrawerCostGroup] = useState<CostGroupType>("OPEX");
  const {
    t,
    report,
    prevReport,
    prev2Report,
    isLoading,
    isLoadingPrev,
    isLoadingPrev2,
    selectedPeriod,
    setSelectedPeriod,
    isOjOnly,
    setIsOjOnly,
    periodOptions,
    selectedYear,
    selectedMonth,
    prevYear,
    prevMonth,
    prev2Year,
    prev2Month,
    exporting,
    handleExportExcel,
    handleGoToOpex,
    refetch,
  } = useGaragePnlLogic();

  return (
    <div className="flex flex-col gap-4">
      {/* Header: Title on Left, Full Width Divider */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1a1e26] px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-white/[0.06] shadow-sm flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            {t("pnl.title", "Báo cáo Lợi nhuận (P&L)")}
          </h4>
        </div>

        <div className="h-px bg-slate-200/80 dark:bg-white/[0.06] flex-1 hidden md:block" />
      </div>

      {/* 2 chart 12 tháng giống sheet "Báo cáo lợi nhuận" của file Excel, theo kỳ đang chọn */}
      <div className="w-full">
        <GaragePnlChartsCard year={selectedYear} month={selectedMonth} />
      </div>

      <div className="bg-surface border border-border/70 dark:border-white/[0.06] rounded-xl card-shadow p-5 flex flex-col gap-4">
        {/* Card Actions Header */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
              {t(
                "pnl.financialReportTable",
                "Bảng Phân Tích Kết Quả Kinh Doanh",
              )}
            </span>
          </div>

          {/* Action buttons: View Mode Switch + Period Picker + Xuất P&L Excel + Chi phí vận hành Garage → */}
          <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
            <PnlViewModeSwitch isOjOnly={isOjOnly} onChange={setIsOjOnly} />

            <div className="h-4 w-px bg-border/60 dark:bg-white/[0.08] hidden sm:block" />

            {/* Enhanced Period Selector Combobox (Ghost variant, clean container) */}
            <div className="h-7 flex items-center bg-muted/40 dark:bg-slate-900/40 border border-border/80 dark:border-white/[0.08] rounded-md px-2 shadow-2xs shrink-0">
              <div className="flex items-center justify-center w-4 h-4 rounded bg-primary/10 text-primary shrink-0 mr-1.5">
                <Calendar className="w-3 h-3" />
              </div>
              <div className="min-w-[140px] sm:min-w-[155px]">
                <Combobox
                  options={periodOptions}
                  value={selectedPeriod}
                  onChange={(val) => val && setSelectedPeriod(val)}
                  allowClear={false}
                  variant="ghost"
                  placeholder={t("pnl.selectPeriodPlaceholder", "Chọn kỳ...")}
                  className="h-6 text-xs font-medium text-foreground px-1"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting || isLoading}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {t("pnl.exportExcel", "Xuất P&L Excel")}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleGoToOpex}
              className="h-7 gap-1.5 px-3 text-xs font-semibold"
            >
              <span>{t("pnl.goToOpex", "Chi phí vận hành Garage →")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Content Table */}
        <PnlFinancialTable
          report={report}
          prevReport={prevReport}
          prev2Report={prev2Report}
          isLoading={isLoading}
          isLoadingPrev={isLoadingPrev}
          isLoadingPrev2={isLoadingPrev2}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          prevMonth={prevMonth}
          prevYear={prevYear}
          prev2Month={prev2Month}
          prev2Year={prev2Year}
          isOjOnly={isOjOnly}
          onOpenDrawer={(group) => {
            setDrawerCostGroup(group || "OPEX");
            setDrawerOpen(true);
          }}
        />
      </div>

      {/* Quick Add Expense Drawer */}
      <GarageOpexDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="edit"
        setMode={() => {}}
        isCreate={true}
        initialCostGroup={drawerCostGroup}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
