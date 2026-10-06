import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { useInvoiceExportDrawer } from "./InvoiceExportDrawer.hook";
import { useInvoiceExportColumns } from "./InvoiceExportDrawer.columns";
import { InvoiceExportConditionSection } from "./components/InvoiceExportConditionSection";
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
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("erpInvoices:exportDrawer.title", "Xuất Excel hóa đơn")}
      subtitle={t(
        "erpInvoices:exportDrawer.subtitle",
        "Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t(
              "erpInvoices:exportDrawer.historyTitle",
              "Lịch sử xuất file",
            )}
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
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <InvoiceExportConditionSection
            exportMode={hook.exportMode}
            onExportModeChange={hook.setExportMode}
            period={hook.period}
            onPeriodChange={hook.handlePeriodChange}
            periodOptions={hook.periodOptions}
            dateFrom={hook.dateFrom}
            onDateFromChange={(val) => hook.setDateFrom(val || "")}
            dateTo={hook.dateTo}
            onDateToChange={(val) => hook.setDateTo(val || "")}
            currentFilterSummary={currentFilterSummary}
            starting={hook.starting}
            onStartExport={hook.handleStartExport}
          />
        </div>
      }
    />
  );
}
