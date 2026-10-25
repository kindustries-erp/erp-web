import * as React from "react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms";
import { V2ExportExcelDrawer } from "@/v2/shared/components/organisms/v2-export-excel-drawer";
import { V2ExportHistoryList } from "@/v2/shared/components/molecules/v2-export-history-list";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { VinfastPartsStockExportQuery } from "@/pages/api/vinfastPartsStockExportApi";
import { VINFAST_STOCK_EXPORT_DEFAULT_COLUMNS } from "./VinfastPartsStockExportDrawer.columns.config";
import { useVinfastPartsStockExportDrawer } from "./VinfastPartsStockExportDrawer.hook";
import { VinfastPartsStockExportConditions } from "./VinfastPartsStockExportConditions";

export interface VinfastPartsStockExportDrawerProps {
  open: boolean;
  onClose: () => void;
  buildBaseQuery: () => Partial<VinfastPartsStockExportQuery>;
}

export function VinfastPartsStockExportDrawer({
  open,
  onClose,
  buildBaseQuery,
}: VinfastPartsStockExportDrawerProps) {
  const { t } = useV2Translation();
  const vm = useVinfastPartsStockExportDrawer({ open, buildBaseQuery });

  return (
    <V2ExportExcelDrawer
      open={open}
      onClose={onClose}
      title={t(
        "v2.exportExcel.vinfastParts.title",
        "Xuất Excel tồn kho phụ tùng (FIFO)",
      )}
      subtitle={t(
        "v2.exportExcel.vinfastParts.subtitle",
        "File Excel trình bày theo phương pháp FIFO.",
      )}
      icon={<FileSpreadsheet className="h-4 w-4" />}
      columnGroups={vm.columnGroups}
      selectedColumns={vm.selectedColumns}
      defaultColumns={VINFAST_STOCK_EXPORT_DEFAULT_COLUMNS}
      onColumnsChange={vm.setSelectedColumns}
      columnsTitle={t("v2.exportExcel.columnSelector.title", "Cột xuất Excel")}
      historyTitle={t("v2.exportExcel.history.title", "Lịch sử xuất file")}
      historyExtra={
        <V2Button
          size="icon-xs"
          variant="ghost"
          aria-label={t("v2.exportExcel.history.refresh", "Làm mới lịch sử")}
          disabled={vm.historyLoading}
          onClick={vm.refreshHistory}
        >
          <RefreshCw
            className={
              vm.historyLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"
            }
          />
        </V2Button>
      }
      history={
        <V2ExportHistoryList
          items={vm.historyItems}
          isLoading={vm.historyLoading}
          emptyLabel={t(
            "v2.exportExcel.history.empty",
            "Chưa có file xuất nào",
          )}
          downloadLabel={t("v2.exportExcel.history.download", "Tải file")}
          downloadingLabel={t(
            "v2.exportExcel.history.downloading",
            "Đang tải...",
          )}
          downloadingId={vm.downloadingJobId}
          onDownload={(jobId) => void vm.handleDownload(jobId)}
          page={vm.page}
          pageSize={vm.pageSize}
          total={vm.historyTotal}
          onPageChange={vm.setPage}
          onPageSizeChange={vm.setPageSize}
        />
      }
      conditions={
        <VinfastPartsStockExportConditions
          period={vm.period}
          periodOptions={vm.periodOptions}
          onPeriodChange={vm.handlePeriodChange}
          dateRange={{
            from: vm.dateFrom || undefined,
            to: vm.dateTo || undefined,
          }}
          onDateRangeChange={(range) => {
            vm.setDateFrom(range.from ?? "");
            vm.setDateTo(range.to ?? "");
          }}
          starting={vm.starting}
          disabled={vm.selectedColumns.length === 0}
          onStart={() => void vm.handleStartExport()}
        />
      }
    />
  );
}
