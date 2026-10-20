import React from "react";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Wrench, Building2, ExternalLink, HelpCircle } from "lucide-react";
import type { PartnerClassificationRow } from "../GaragePartnerMonthDetailDrawer.type";

const ICONS: Record<string, React.ReactNode> = {
  SUA_CHUA_CHUNG: <Wrench className="w-4 h-4 text-emerald-600" />,
  KY_GUI_NOI_BO: <Building2 className="w-4 h-4 text-indigo-600" />,
  OJ_NGOAI: <ExternalLink className="w-4 h-4 text-amber-600" />,
  OTHER: <HelpCircle className="w-4 h-4 text-slate-500" />,
};

export function getPartnerClassificationColumns(
  isPayable: boolean,
  t: TFunction,
): DataTableColumn<PartnerClassificationRow>[] {
  return [
    {
      key: "name",
      header: t("cases.columns.classification", "Phân loại"),
      size: 200,
      headerClassName: "font-semibold",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {ICONS[row.key] || <HelpCircle className="w-4 h-4 text-slate-400" />}
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-foreground">
              {row.name}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {row.caseCount} vụ việc
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "billed",
      header: isPayable ? "Tổng chi phí" : "Tổng phát sinh",
      size: 140,
      headerClassName: "text-right font-semibold",
      className:
        "text-right font-mono font-bold text-xs tabular-nums text-foreground",
      cell: (row) => (
        <div className="flex flex-col gap-1 w-full justify-center">
          <span className="font-semibold text-xs font-mono">
            {money(row.billed)}
          </span>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isPayable ? "bg-orange-500" : "bg-emerald-500",
              )}
              style={{ width: `${Math.min(100, Math.max(0, row.rate))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "paid",
      header: isPayable ? "Đã chi" : "Đã thu",
      size: 110,
      headerClassName: "text-right font-semibold",
      className:
        "text-right font-mono font-semibold text-xs tabular-nums text-emerald-600 dark:text-emerald-400",
      cell: (row) => (row.paid > 0 ? money(row.paid) : "—"),
    },
    {
      key: "remaining",
      header: isPayable ? "Còn phải chi" : "Còn phải thu",
      size: 110,
      headerClassName: "text-right font-semibold",
      className: "text-right font-mono font-bold text-xs tabular-nums",
      cell: (row) => (
        <span
          className={cn(
            row.remaining > 0
              ? isPayable
                ? "text-orange-600 dark:text-orange-400"
                : "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground/60",
          )}
        >
          {row.remaining > 0 ? money(row.remaining) : "—"}
        </span>
      ),
    },
    {
      key: "remainingWithInvoice",
      header: isPayable ? "Còn nợ có HĐ" : "Phải thu có HĐ",
      size: 120,
      headerClassName: "text-right font-semibold",
      className: "text-right font-mono text-xs tabular-nums",
      cell: (row) =>
        row.remainingWithInvoice > 0 ? money(row.remainingWithInvoice) : "—",
    },
    {
      key: "remainingNoInvoice",
      header: isPayable ? "Còn nợ k.HĐ" : "Phải thu k.HĐ",
      size: 120,
      headerClassName: "text-right font-semibold",
      className: "text-right font-mono text-xs tabular-nums",
      cell: (row) =>
        row.remainingNoInvoice > 0 ? money(row.remainingNoInvoice) : "—",
    },
    {
      key: "shareRate",
      header: "Tỷ trọng",
      size: 80,
      headerClassName: "text-center font-semibold",
      className: "text-center font-mono font-semibold text-xs text-foreground",
      cell: (row) => `${row.shareRate.toFixed(1)}%`,
    },
  ];
}
