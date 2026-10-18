import React, { useMemo } from "react";
import { Download, RotateCcw } from "lucide-react";
import { useT } from "@/core/i18n";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { BankStatementExportHistoryItem } from "@/modules/bank-statements/api/bankStatementApi";
import {
  toDisplayDate,
  toDisplayRange,
  renderOverflowText,
} from "./BankStatementExportDrawer.helper";

export interface UseBankStatementExportColumnsProps {
  downloadingJobId: string | null;
  progress: {
    jobId?: string | null;
    total: number;
    current: number;
  };
  onDownload: (
    jobIdOrRow: string | BankStatementExportHistoryItem,
    fileName?: string,
  ) => void;
}

export function useBankStatementExportColumns({
  downloadingJobId,
  progress,
  onDownload,
}: UseBankStatementExportColumnsProps) {
  const t = useT();

  return useMemo<DataTableColumn<BankStatementExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip
            content={t(
              "bankStatement.resetColumnWidth",
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
                  "reset-column-sizing-bank-statement-export-history",
                );
                window.dispatchEvent(event);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Tooltip>
        ),
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px] text-center",
        className: "w-[40px] min-w-[40px] text-center",
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label:
                  downloadingJobId === row.jobId
                    ? t("bankStatement.downloading", "Đang tải...")
                    : t("bankStatement.downloadAgain", "Tải lại file"),
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
        header: t("bankStatement.tableCreatedAt", "Tạo lúc"),
        size: 160,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("bankStatement.tablePeriod", "Kỳ / Khoảng ngày"),
        size: 170,
        cell: (row) =>
          row.dateFrom || row.dateTo
            ? toDisplayRange(row.dateFrom, row.dateTo)
            : t("bankStatement.allRange", "Tất cả"),
      },
      {
        key: "fileName",
        header: t("bankStatement.tableFileName", "Tên file"),
        size: 240,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "status",
        header: t("bankStatement.tableStatus", "Trạng thái"),
        size: 140,
        cell: (row) => {
          if (row.status === "COMPLETED") {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {t("bankStatement.statusReady", "Sẵn sàng tải")}
              </Badge>
            );
          }
          if (row.status === "FAILED") {
            return (
              <Badge variant="destructive">
                {t("bankStatement.statusFailed", "Thất bại")}
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
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              {t("bankStatement.statusRunning", "Đang tạo")} {percent}%
            </Badge>
          );
        },
      },
      {
        key: "expiresAt",
        header: t("bankStatement.tableExpiresAt", "Hết hạn"),
        size: 150,
        cell: (row) => toDisplayDate(row.expiresAt),
      },
      {
        key: "message",
        header: t("bankStatement.tableMessage", "Thông tin"),
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
