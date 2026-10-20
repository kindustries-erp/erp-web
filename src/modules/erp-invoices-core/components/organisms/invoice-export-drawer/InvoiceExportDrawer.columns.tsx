import { useMemo } from "react";
import { Download, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { InvoiceExportHistoryItem } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  toDisplayDate,
  toDisplayRange,
  renderOverflowText,
} from "./InvoiceExportDrawer.helper";

export interface UseInvoiceExportColumnsOptions {
  downloadingJobId: string | null;
  progress: {
    jobId?: string | null;
    current: number;
    total: number;
  };
  onDownload: (row: InvoiceExportHistoryItem) => void;
}

export function useInvoiceExportColumns({
  downloadingJobId,
  progress,
  onDownload,
}: UseInvoiceExportColumnsOptions): DataTableColumn<InvoiceExportHistoryItem>[] {
  const { t } = useTranslation("erpInvoices");

  return useMemo<DataTableColumn<InvoiceExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip
            content={t(
              "erpInvoices:exportDrawer.resetColumnWidth",
              "Khôi phục độ rộng cột",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent(
                  "reset-column-sizing-invoice-export-history",
                );
                window.dispatchEvent(event);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Tooltip>
        ),
        size: 40,
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label:
                  downloadingJobId === row.jobId
                    ? t("erpInvoices:exportDrawer.downloading", "Đang tải...")
                    : t(
                        "erpInvoices:exportDrawer.downloadAgain",
                        "Tải lại file",
                      ),
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: () => {
                  void onDownload(row);
                },
                disabled: !row.canDownload || Boolean(downloadingJobId),
                loading: downloadingJobId === row.jobId,
              },
            ]}
          />
        ),
      },
      {
        key: "createdAt",
        header: t("erpInvoices:exportDrawer.table.createdAt", "Tạo lúc"),
        size: 160,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("erpInvoices:exportDrawer.table.period", "Kỳ / Khoảng ngày"),
        size: 170,
        cell: (row) =>
          row.dateFrom || row.dateTo
            ? toDisplayRange(row.dateFrom, row.dateTo)
            : t("erpInvoices:exportDrawer.allRange", "Tất cả"),
      },
      {
        key: "fileName",
        header: t("erpInvoices:exportDrawer.table.fileName", "Tên file"),
        size: 240,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "status",
        header: t("erpInvoices:exportDrawer.table.status", "Trạng thái"),
        size: 140,
        cell: (row) => {
          if (row.status === "COMPLETED") {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                {t("erpInvoices:exportDrawer.status.ready", "Sẵn sàng tải")}
              </Badge>
            );
          }
          if (row.status === "FAILED") {
            return (
              <Badge variant="destructive">
                {t("erpInvoices:exportDrawer.status.failed", "Thất bại")}
              </Badge>
            );
          }

          const current =
            progress.jobId === row.jobId && progress.total > 0
              ? progress.current
              : row.current;
          const total =
            progress.jobId === row.jobId && progress.total > 0
              ? progress.total
              : row.total;
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;

          // No Blue Mandate: sử dụng amber tone thay vì sky/blue
          return (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              {t("erpInvoices:exportDrawer.status.running", "Đang tạo")}{" "}
              {percent}%
            </Badge>
          );
        },
      },
      {
        key: "expiresAt",
        header: t("erpInvoices:exportDrawer.table.expiresAt", "Hết hạn"),
        size: 150,
        cell: (row) => toDisplayDate(row.expiresAt),
      },
      {
        key: "message",
        header: t("erpInvoices:exportDrawer.table.message", "Thông tin"),
        size: 200,
        cell: (row) => renderOverflowText(row.message),
      },
    ],
    [
      downloadingJobId,
      onDownload,
      progress.current,
      progress.jobId,
      progress.total,
      t,
    ],
  );
}
