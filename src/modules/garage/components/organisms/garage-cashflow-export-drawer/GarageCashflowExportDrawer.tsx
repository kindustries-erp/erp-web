import React from "react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { useGarageCashflowExportDrawer } from "./GarageCashflowExportDrawer.hook";
import { useGarageCashflowExportColumns } from "./GarageCashflowExportDrawer.columns";
import { GarageCashflowExportColumnSelector } from "./components/GarageCashflowExportColumnSelector";
import { GarageCashflowExportConditionSection } from "./components/GarageCashflowExportConditionSection";
import type { GarageCashflowExportFilterSummary } from "./components/GarageCashflowExportFilterPreview";

export interface GarageCashflowExportDrawerProps {
  open: boolean;
  onClose: () => void;
  tableFilter?: any;
  filterSummary?: GarageCashflowExportFilterSummary;
}

export function GarageCashflowExportDrawer({
  open,
  onClose,
  tableFilter,
  filterSummary,
}: GarageCashflowExportDrawerProps) {
  const hook = useGarageCashflowExportDrawer({ open, tableFilter });

  const columns = useGarageCashflowExportColumns({
    downloadingJobId: hook.downloadingJobId,
    progress: hook.progress,
    onDownload: hook.handleDownload,
  });

  const historyData = hook.historyQuery.data as
    | { items?: any[]; total?: number; totalPages?: number }
    | undefined;

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title="Xuất Excel thu chi garage"
      subtitle="Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng"
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          <GarageCashflowExportColumnSelector
            selectedColumns={hook.selectedColumns}
            onChange={hook.setSelectedColumns}
            defaultCollapsed={true}
          />

          <DrawerSection
            title="Lịch sử xuất file"
            titleExtra={
              <Tooltip content="Làm mới lịch sử">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    void hook.historyQuery.refetch();
                  }}
                  disabled={hook.historyQuery.isFetching}
                >
                  <RefreshCw
                    className={cn(
                      "w-3.5 h-3.5",
                      hook.historyQuery.isFetching &&
                        "animate-spin text-primary",
                    )}
                  />
                </Button>
              </Tooltip>
            }
            collapsible
            defaultCollapsed={false}
          >
            <StandardTable
              tableId="garage-cashflow-export-history"
              variant="spreadsheet"
              enableColumnResizing={true}
              items={historyData?.items || []}
              columns={columns}
              getRowKey={(row) => row.jobId}
              loading={
                hook.historyQuery.isLoading || hook.historyQuery.isFetching
              }
              page={hook.page}
              pageSize={hook.pageSize}
              total={historyData?.total || 0}
              totalPages={historyData?.totalPages || 1}
              onPage={hook.setPage}
              onPageSize={hook.setPageSize}
              emptyLabel="Chưa có file xuất nào"
            />
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <GarageCashflowExportConditionSection
            exportMode={hook.exportMode}
            onExportModeChange={hook.setExportMode}
            periodType={hook.periodType}
            onPeriodTypeChange={hook.setPeriodType}
            week={hook.week}
            onWeekChange={hook.setWeek}
            weekOptions={hook.weekOptions}
            period={hook.period}
            onPeriodChange={hook.setPeriod}
            periodOptions={hook.periodOptions}
            quarter={hook.quarter}
            onQuarterChange={hook.setQuarter}
            quarterOptions={hook.quarterOptions}
            dateFrom={hook.dateFrom}
            onDateFromChange={hook.setDateFrom}
            dateTo={hook.dateTo}
            onDateToChange={hook.setDateTo}
            accountOptions={hook.accountOptions}
            selectedAccountId={hook.selectedAccountId}
            onSelectedAccountIdChange={hook.setSelectedAccountId}
            transactionTypeOptions={hook.transactionTypeOptions}
            transactionType={hook.transactionType}
            onTransactionTypeChange={hook.setTransactionType}
            filterSummary={filterSummary}
            starting={hook.starting}
            onStartExport={hook.handleStartExport}
          />
        </div>
      }
    />
  );
}
