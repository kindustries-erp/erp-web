import React from "react";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { shortMoney } from "@/shared/utils/format";
import type { ClassificationTableRow } from "../types";

export function getFunnelTableColumns(
  t: TFunction,
): DataTableColumn<ClassificationTableRow>[] {
  return [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_, idx) => (
        <span className="w-full block text-center font-mono">{idx}</span>
      ),
    },
    {
      key: "name",
      header: t("dashboard.funnel.colClassification", "Phân Loại ERP"),
      size: 180,
      cell: (row) => {
        const Icon = row.icon;
        return (
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: row.dot }}
            />
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: "total",
      header: t("dashboard.funnel.colIntake", "Tổng Tiếp Nhận"),
      size: 150,
      className: "text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-foreground tabular-nums">
            {row.totalCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {shortMoney(row.totalAmount)}
          </span>
        </div>
      ),
    },
    {
      key: "inProgress",
      header: t("dashboard.funnel.colInProgress", "Đang Làm (Dự Thu)"),
      size: 160,
      className: "text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-foreground tabular-nums">
            {row.inProgressCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {shortMoney(row.inProgressAmount)}
          </span>
        </div>
      ),
    },
    {
      key: "completed",
      header: t("dashboard.funnel.colCompleted", "Hoàn Thành (Doanh Thu)"),
      size: 170,
      className: "text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {row.completedCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
            {shortMoney(row.completedAmount)}
          </span>
        </div>
      ),
    },
    {
      key: "cancelled",
      header: t("dashboard.funnel.colCancelled", "Đã Hủy"),
      size: 140,
      className: "text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-destructive tabular-nums">
            {row.cancelledCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {shortMoney(row.cancelledAmount)}
          </span>
        </div>
      ),
    },
    {
      key: "completionRate",
      header: t("dashboard.funnel.colRate", "Tỷ Lệ Hoàn Tất"),
      size: 140,
      className: "text-center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${row.completionRate}%` }}
            />
          </div>
          <span className="font-bold text-foreground text-[11px] tabular-nums">
            {row.completionRate}%
          </span>
        </div>
      ),
    },
  ];
}

export function getFunnelSummaryRow(
  t: TFunction,
  totalIntake: { count: number; amount: number },
  inProgress: { count: number; amount: number },
  completed: { count: number; amount: number; rate?: number },
  cancelled: { count: number; amount: number },
) {
  return {
    index: (
      <SubtotalSummaryCell
        variantType="label"
        label={t("common.total", "Tổng") + ":"}
      />
    ),
    name: (
      <SubtotalSummaryCell
        variantType="label"
        label={`4 ${t("dashboard.funnel.colClassification", "nhóm ERP")}`}
      />
    ),
    total: (
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle={t("dashboard.funnel.colIntake", "Tổng tiếp nhận")}
        itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
        subtotalQty={totalIntake.count}
        subtotalAmount={totalIntake.amount}
      />
    ),
    inProgress: (
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle={t("dashboard.funnel.colInProgress", "Đang làm (Dự thu)")}
        itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
        subtotalQty={inProgress.count}
        subtotalAmount={inProgress.amount}
      />
    ),
    completed: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t(
          "dashboard.funnel.colCompleted",
          "Hoàn thành (Doanh thu)",
        )}
        itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
        subtotalQty={completed.count}
        subtotalAmount={completed.amount}
      />
    ),
    cancelled: (
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle={t("dashboard.funnel.colCancelled", "Đã hủy")}
        itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
        subtotalQty={cancelled.count}
        subtotalAmount={cancelled.amount}
      />
    ),
    completionRate: (
      <SubtotalSummaryCell
        variantType="label"
        label={`${completed.rate ?? 0}%`}
        valueClassName="text-center font-bold text-emerald-600 dark:text-emerald-400"
      />
    ),
  };
}
