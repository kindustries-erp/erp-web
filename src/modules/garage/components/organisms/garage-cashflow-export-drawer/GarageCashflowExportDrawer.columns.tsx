import React, { useMemo } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import type { DataTableColumn } from "@/shared/components/DataTable";
import {
  toDisplayDate,
  toDisplayRange,
  renderOverflowText,
} from "./GarageCashflowExportDrawer.helper";

export interface CashflowExportHistoryItem {
  jobId: string;
  fileName: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  current: number;
  total: number;
  message: string;
  createdAt: string;
  finishedAt?: string;
  expiresAt?: string;
  dateFrom?: string;
  dateTo?: string;
  canDownload: boolean;
}

export interface UseGarageCashflowExportColumnsProps {
  downloadingJobId: string | null;
  progress?: {
    jobId?: string | null;
    total: number;
    current: number;
  };
  onDownload: (row: CashflowExportHistoryItem) => void;
}

export function useGarageCashflowExportColumns({
  downloadingJobId,
  progress,
  onDownload,
}: UseGarageCashflowExportColumnsProps) {
  return useMemo<DataTableColumn<CashflowExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip content="Khôi phục độ rộng cột">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent(
                  "reset-column-sizing-garage-cashflow-export-history",
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
                    ? "Đang tải..."
                    : "Tải lại file",
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
        header: "Tạo lúc",
        size: 160,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: "Kỳ / Khoảng ngày",
        size: 170,
        cell: (row) =>
          row.dateFrom || row.dateTo
            ? toDisplayRange(row.dateFrom, row.dateTo)
            : "Tất cả",
      },
      {
        key: "fileName",
        header: "Tên file",
        size: 240,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "status",
        header: "Trạng thái",
        size: 140,
        cell: (row) => {
          if (row.status === "COMPLETED") {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Sẵn sàng tải
              </Badge>
            );
          }
          if (row.status === "FAILED") {
            return <Badge variant="destructive">Thất bại</Badge>;
          }

          const current =
            progress?.jobId === row.jobId && progress.total > 0
              ? progress.current
              : row.current;
          const total =
            progress?.jobId === row.jobId && progress.total > 0
              ? progress.total
              : row.total;
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;

          return (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              Đang tạo {percent}%
            </Badge>
          );
        },
      },
      {
        key: "expiresAt",
        header: "Hết hạn",
        size: 150,
        cell: (row) => toDisplayDate(row.expiresAt),
      },
    ],
    [downloadingJobId, onDownload, progress],
  );
}
