import React, { useMemo } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { GARAGE_CASE_CLASSIFICATIONS } from "@/modules/garage/components/GarageCaseClassificationBadge";
import type { GarageCaseExportHistoryItem } from "./useGarageCaseExportLogic";

function toDisplayDate(iso?: string) {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

function toDisplayRange(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return "-";
  return `${dateFrom} - ${dateTo}`;
}

const renderOverflowText = (text: string, className?: string) => {
  const value = text?.trim() || "-";
  const showTooltip = value.length > 30;

  return (
    <Tooltip content={value} disabled={!showTooltip}>
      <div
        className={`truncate ${className || ""}`}
        title={showTooltip ? undefined : value}
      >
        {value}
      </div>
    </Tooltip>
  );
};

export function useGarageCaseExportColumns(
  downloadingId: string | null,
  onDownloadAgain: (item: GarageCaseExportHistoryItem) => void,
) {
  const { t } = useTranslation("garage");

  const getRowActions = useMemo(() => {
    return (row: GarageCaseExportHistoryItem): ActionDropdownItem[] => [
      {
        groupLabel: t("cases.exportDrawer.actions", "THAO TÁC"),
        items: [
          {
            label:
              downloadingId === row.id
                ? t("cases.exportDrawer.downloading", "Đang tải...")
                : t("cases.exportDrawer.downloadAgain", "Tải lại file"),
            icon: <Download className="w-3.5 h-3.5" />,
            onClick: () => onDownloadAgain(row),
            disabled: Boolean(downloadingId),
            loading: downloadingId === row.id,
          },
        ],
      },
    ];
  }, [downloadingId, onDownloadAgain, t]);

  const columns = useMemo<DataTableColumn<GarageCaseExportHistoryItem>[]>(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "createdAt",
        header: t("cases.exportDrawer.table.createdAt", "Tạo lúc"),
        size: 140,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("cases.exportDrawer.table.period", "Kỳ / Khoảng ngày"),
        size: 180,
        cell: (row) => toDisplayRange(row.dateFrom, row.dateTo),
      },
      {
        key: "fileName",
        header: t("cases.exportDrawer.table.fileName", "Tên file"),
        size: 260,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "scope",
        header: t("cases.exportDrawer.table.scope", "Phạm vi"),
        size: 180,
        cell: (row) => {
          const parts: string[] = [];
          if (row.branchName) parts.push(row.branchName);
          if (row.classification) {
            const classLabel =
              GARAGE_CASE_CLASSIFICATIONS[row.classification]?.label ||
              row.classification;
            parts.push(classLabel);
          }
          if (row.dateType === "case_date") {
            parts.push("Ngày phát sinh");
          } else {
            parts.push("Ngày hoàn thành");
          }
          return renderOverflowText(
            parts.length
              ? parts.join(" • ")
              : t("cases.exportDrawer.allScope", "Tất cả"),
          );
        },
      },
      {
        key: "status",
        header: t("cases.exportDrawer.table.status", "Trạng thái"),
        size: 120,
        cell: () => (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            {t("cases.exportDrawer.ready", "Sẵn sàng")}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return { columns, getRowActions };
}
