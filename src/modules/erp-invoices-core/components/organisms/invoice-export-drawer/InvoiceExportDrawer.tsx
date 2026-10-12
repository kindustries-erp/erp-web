import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { useInvoiceExportDrawer } from "./InvoiceExportDrawer.hook";
import { useInvoiceExportColumns } from "./InvoiceExportDrawer.columns";
import { InvoiceExportConditionSection } from "./components/InvoiceExportConditionSection";
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
      leftTitle={t(
        "erpInvoices:exportDrawer.historyTitle",
        "Lịch sử xuất file",
      )}
      leftContent={
        <StandardTable
          tableId="invoice-export-history"
          variant="spreadsheet"
          enableColumnResizing={true}
          items={hook.historyQuery.data?.items || []}
          columns={columns}
          getRowKey={(row) => row.jobId}
          loading={hook.historyQuery.isLoading || hook.historyQuery.isFetching}
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
      }
      rightContent={
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
      }
    />
  );
}
