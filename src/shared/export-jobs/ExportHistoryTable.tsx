import React, { useMemo } from "react";
import { Download } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Badge } from "@/shared/components/ui/badge";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { StandardTable } from "@/shared/components/StandardTable";
import type { ExportHistoryItem } from "./exportJobTypes";

export interface ExportHistoryLabels {
  createdAt: string;
  period: string;
  allRange: string;
  fileName: string;
  status: string;
  ready: string;
  failed: string;
  running: string;
  expiresAt: string;
  downloadAgain: string;
  downloading: string;
  empty: string;
}

export interface ExportHistoryTableProps {
  tableId: string;
  items: ExportHistoryItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  downloadingJobId: string | null;
  progress: { jobId?: string; current: number; total: number };
  onDownload: (row: ExportHistoryItem) => void;
  labels: ExportHistoryLabels;
}

export function formatExportDateTime(iso?: string): string {
  if (!iso) return "-";
  const date = parseISO(iso);
  return isValid(date) ? format(date, "dd/MM/yyyy HH:mm") : "-";
}

export function formatExportRange(from?: string, to?: string): string | null {
  if (!from && !to) return null;
  const day = (v?: string) => (v ? formatExportDateTime(v).slice(0, 10) : "-");
  return `${day(from)} - ${day(to)}`;
}

export function ExportHistoryTable({
  tableId,
  items,
  loading,
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
  downloadingJobId,
  progress,
  onDownload,
  labels,
}: ExportHistoryTableProps) {
  const columns = useMemo<DataTableColumn<ExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: "",
        size: 40,
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label:
                  downloadingJobId === row.jobId
                    ? labels.downloading
                    : labels.downloadAgain,
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: () => onDownload(row),
                disabled: !row.canDownload || Boolean(downloadingJobId),
                loading: downloadingJobId === row.jobId,
              },
            ]}
          />
        ),
      },
      {
        key: "createdAt",
        header: labels.createdAt,
        size: 150,
        cell: (row) => formatExportDateTime(row.createdAt),
      },
      {
        key: "period",
        header: labels.period,
        size: 160,
        cell: (row) =>
          formatExportRange(row.dateFrom, row.dateTo) ?? labels.allRange,
      },
      {
        key: "fileName",
        header: labels.fileName,
        size: 240,
        cell: (row) => (
          <div className="truncate" title={row.fileName}>
            {row.fileName}
          </div>
        ),
      },
      {
        key: "status",
        header: labels.status,
        size: 130,
        cell: (row) => {
          if (row.status === "COMPLETED") {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                {labels.ready}
              </Badge>
            );
          }
          if (row.status === "FAILED") {
            return <Badge variant="destructive">{labels.failed}</Badge>;
          }
          const live = progress.jobId === row.jobId && progress.total > 0;
          const current = live ? progress.current : row.current;
          const totalUnits = live ? progress.total : row.total;
          const percent =
            totalUnits > 0 ? Math.round((current / totalUnits) * 100) : 0;
          return (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              {labels.running} {percent}%
            </Badge>
          );
        },
      },
      {
        key: "expiresAt",
        header: labels.expiresAt,
        size: 150,
        cell: (row) => formatExportDateTime(row.expiresAt),
      },
    ],
    [
      downloadingJobId,
      labels,
      onDownload,
      progress.current,
      progress.jobId,
      progress.total,
    ],
  );

  return (
    <StandardTable
      tableId={tableId}
      variant="spreadsheet"
      enableColumnResizing={true}
      items={items}
      columns={columns}
      getRowKey={(row) => row.jobId}
      loading={loading}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPage={onPage}
      onPageSize={onPageSize}
      emptyLabel={labels.empty}
    />
  );
}
