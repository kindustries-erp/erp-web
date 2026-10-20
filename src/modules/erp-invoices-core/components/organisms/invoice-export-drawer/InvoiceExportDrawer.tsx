import React from "react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import { useInvoiceExportDrawer } from "./InvoiceExportDrawer.hook";
import { useInvoiceExportColumns } from "./InvoiceExportDrawer.columns";
import { InvoiceExportConditionSection } from "./components/InvoiceExportConditionSection";
import { InvoiceExportColumnSelector } from "./components/InvoiceExportColumnSelector";
import { InvoiceExportDrawerShell } from "./components/InvoiceExportDrawerShell";
import type { InvoiceExportDrawerProps } from "./InvoiceExportDrawer.type";

export type { InvoiceExportDrawerProps };

export function InvoiceExportDrawer(props: InvoiceExportDrawerProps) {
  const { open, onClose, direction, buildBaseQuery, currentFilterSummary } =
    props;
  const { t } = useTranslation("erpInvoices");

  const hook = useInvoiceExportDrawer({
    open,
    direction,
    buildBaseQuery,
  });

  const columns = useInvoiceExportColumns({
    downloadingJobId: hook.downloadingJobId,
    progress: hook.progress,
    onDownload: hook.handleDownload,
  });

  return (
    <InvoiceExportDrawerShell
      open={open}
      onClose={onClose}
      title={t("erpInvoices:exportDrawer.title", "Xuất Excel hóa đơn")}
      subtitle={t(
        "erpInvoices:exportDrawer.subtitle",
        "Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4" />}
      leftSections={
        <>
          <InvoiceExportColumnSelector
            selectedColumns={hook.selectedColumns}
            onChange={hook.handleColumnsChange}
            onResetDefault={hook.handleResetDefaultColumns}
            defaultCollapsed={true}
          />
          <DrawerSection
            title={t(
              "erpInvoices:exportDrawer.historyTitle",
              "Lịch sử xuất file",
            )}
            titleExtra={
              <Tooltip
                content={t(
                  "erpInvoices:exportDrawer.refreshHistory",
                  "Làm mới lịch sử",
                )}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  title={t(
                    "erpInvoices:exportDrawer.refreshHistory",
                    "Làm mới lịch sử",
                  )}
                  aria-label={t(
                    "erpInvoices:exportDrawer.refreshHistory",
                    "Làm mới lịch sử",
                  )}
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
              tableId="invoice-export-history"
              variant="spreadsheet"
              enableColumnResizing={true}
              items={hook.historyQuery.data?.items || []}
              columns={columns}
              getRowKey={(row) => row.jobId}
              loading={
                hook.historyQuery.isLoading || hook.historyQuery.isFetching
              }
              page={hook.page}
              pageSize={hook.pageSize}
              total={hook.historyQuery.data?.total || 0}
              totalPages={hook.historyQuery.data?.totalPages || 1}
              onPage={hook.setPage}
              onPageSize={hook.setPageSize}
              emptyLabel={t(
                "erpInvoices:exportDrawer.emptyHistory",
                "Chưa có file xuất nào",
              )}
            />
          </DrawerSection>
        </>
      }
      rightContent={
        <InvoiceExportConditionSection
          exportMode={hook.exportMode}
          onExportModeChange={hook.setExportMode}
          periodType={hook.periodType}
          onPeriodTypeChange={hook.handlePeriodTypeChange}
          period={hook.period}
          onPeriodChange={hook.handlePeriodChange}
          periodOptions={hook.periodOptions}
          quarter={hook.quarter}
          onQuarterChange={hook.handleQuarterChange}
          quarterOptions={hook.quarterOptions}
          dateFrom={hook.dateFrom}
          onDateFromChange={(val) => hook.setDateFrom(val || "")}
          dateTo={hook.dateTo}
          onDateToChange={(val) => hook.setDateTo(val || "")}
          currentFilterSummary={currentFilterSummary}
          starting={hook.starting}
          onStartExport={hook.handleStartExport}
        />
      }
    />
  );
}
