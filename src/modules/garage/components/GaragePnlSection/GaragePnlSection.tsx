import React, { useState } from "react";
import { FileSpreadsheet, Download, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Combobox } from "@/shared/components/Combobox";
import { GarageOpexDrawer } from "../GarageOpexDrawer";
import { useGaragePnlLogic } from "./useGaragePnlLogic";
import { PnlFinancialTable } from "./components/PnlFinancialTable";

export function GaragePnlSection() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const {
    t,
    report,
    prevReport,
    isLoading,
    isLoadingPrev,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    selectedYear,
    selectedMonth,
    prevYear,
    prevMonth,
    exporting,
    handleExportExcel,
    handleGoToOpex,
    refetch,
  } = useGaragePnlLogic();

  return (
    <div className="flex flex-col gap-3">
      {/* Header: Title & Badges on Left, Opex Nav Button on Right */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center flex-wrap gap-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            {t("pnl.title", "Báo cáo Lợi nhuận (P&L)")}
          </h4>

          {report && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {report.caseCount} {t("pnl.casesCompleted", "vụ việc hoàn tất")}
              </Badge>
              {Boolean(report.oj && report.oj.caseCount > 0) && (
                <Badge
                  variant="secondary"
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {report.oj!.caseCount} {t("pnl.ojCases", "vụ OJ")}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Nút chuyển đến trang nhập CP vận hành ở trên bên phải */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleGoToOpex}
            className="h-8 gap-1.5 px-3 text-xs font-semibold"
          >
            <span>{t("pnl.goToOpex", "Chi phí vận hành Garage →")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-4">
        {/* Card Actions Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Combobox chọn kỳ báo cáo trực tiếp bên trong Card */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {t("pnl.reportingPeriod", "Kỳ báo cáo:")}
            </span>
            <div className="w-[160px]">
              <Combobox
                options={periodOptions}
                value={selectedPeriod}
                onChange={(val) => val && setSelectedPeriod(val)}
                placeholder={t("pnl.selectPeriodPlaceholder", "Chọn kỳ...")}
                allowClear={false}
                className="h-7 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting || isLoading}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {t("pnl.exportExcel", "Xuất Excel")}
            </Button>
          </div>
        </div>

        {/* Content Table */}
        <PnlFinancialTable
          report={report}
          prevReport={prevReport}
          isLoading={isLoading}
          isLoadingPrev={isLoadingPrev}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          prevMonth={prevMonth}
          prevYear={prevYear}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
      </div>

      {/* Quick Add Expense Drawer */}
      <GarageOpexDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="edit"
        setMode={() => {}}
        isCreate={true}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
