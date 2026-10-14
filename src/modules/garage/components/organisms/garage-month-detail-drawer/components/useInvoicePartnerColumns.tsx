import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type {
  DataTableColumn,
  ColumnFilterBuilder,
} from "@/shared/components/DataTable";
import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import { ShieldCheck, User, AlertTriangle } from "lucide-react";

interface UseInvoicePartnerColumnsParams {
  headerFilter: ColumnFilterBuilder;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
}

export function useInvoicePartnerColumns({
  headerFilter,
  onSelectGroup,
}: UseInvoicePartnerColumnsParams): DataTableColumn<MonthlyReceivablesGroupItem>[] {
  const { t } = useTranslation("garage");
  const compactHeader = (header: React.ReactNode, fullLabel: string) => (
    <Tooltip content={fullLabel} side="top">
      <span className="block min-w-0 truncate">{header}</span>
    </Tooltip>
  );

  return useMemo(
    () => [
      {
        key: "index",
        header: "#",
        size: 48,
        headerClassName: "text-center font-semibold",
        className: "text-center font-mono text-xs text-muted-foreground",
        cell: (_: MonthlyReceivablesGroupItem, index: number) => index,
      },
      {
        key: "payerType",
        header: "Loại thu",
        size: 90,
        headerClassName: "text-center font-semibold",
        className: "text-center",
        cell: (row: MonthlyReceivablesGroupItem) =>
          row.payerType === "BH" ? (
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 font-semibold text-[11px] gap-1 px-1.5"
            >
              <ShieldCheck className="w-3 h-3 text-indigo-500" />
              Thu BH
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25 font-semibold text-[11px] gap-1 px-1.5"
            >
              <User className="w-3 h-3 text-slate-500" />
              Thu KH
            </Badge>
          ),
      },
      {
        key: "title",
        header: compactHeader(
          headerFilter("title", "Đối tượng / Cty BH", { align: "left" }),
          t("progress.columns.partnerTitleFull", "Đối tượng HĐ / Cty Bảo hiểm"),
        ),
        size: 260,
        enableResizing: true,
        headerClassName: "font-semibold",
        cell: (row: MonthlyReceivablesGroupItem) => (
          <div className="flex flex-col py-0.5 max-w-full">
            <span className="font-semibold text-xs text-foreground truncate">
              {row.title}
            </span>
            {row.subLabel && (
              <span className="text-[11px] text-muted-foreground font-mono truncate">
                {row.subLabel}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "hasInvoice",
        header: compactHeader(
          t("progress.columns.invoiceVatStatusShort", "HĐ & VAT"),
          t("progress.columns.invoiceVatStatus", "Trạng thái HĐ & VAT"),
        ),
        size: 190,
        enableResizing: true,
        headerClassName: "font-semibold",
        cell: (row: MonthlyReceivablesGroupItem) => {
          if (row.vatWarning) {
            return (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35 font-bold text-[10px] gap-1 px-1.5 py-0.5"
              >
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Có VAT – Chưa xuất HĐ ({money(row.vatAmount)})</span>
              </Badge>
            );
          }
          if (row.hasInvoice) {
            const nos =
              row.invoiceNos.length > 0
                ? `#${row.invoiceNos.join(", ")}`
                : "Đã xuất HĐ";
            return (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 font-mono text-[11px] px-1.5 py-0"
              >
                ✓ {nos}
              </Badge>
            );
          }
          return (
            <Badge
              variant="outline"
              className="bg-slate-100 dark:bg-slate-800/80 text-muted-foreground border-border text-[11px] px-1.5 py-0"
            >
              Chưa xuất HĐ (K.Thuế)
            </Badge>
          );
        },
      },
      {
        key: "caseCount",
        header: compactHeader(
          headerFilter.numeric("caseCount", "Vụ việc", { align: "center" }),
          "Vụ việc",
        ),
        size: 75,
        headerClassName: "text-center font-semibold",
        className: "text-center font-mono tabular-nums text-xs text-foreground",
        cell: (row: MonthlyReceivablesGroupItem) => row.caseCount,
      },
      {
        key: "billed",
        header: compactHeader(
          headerFilter.amount("billed", "Phát sinh", { align: "right" }),
          "Phát sinh",
        ),
        size: 130,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className:
          "text-right font-mono tabular-nums font-bold text-xs text-foreground",
        cell: (row: MonthlyReceivablesGroupItem) => money(row.billed),
      },
      {
        key: "paid",
        header: compactHeader(
          headerFilter.amount("paid", "Đã thu", { align: "right" }),
          "Đã thu",
        ),
        size: 110,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className:
          "text-right font-mono tabular-nums text-xs text-emerald-600 dark:text-emerald-400 font-semibold",
        cell: (row: MonthlyReceivablesGroupItem) =>
          row.paid > 0 ? money(row.paid) : "—",
      },
      {
        key: "remaining",
        header: compactHeader(
          headerFilter.amount("remaining", "Còn nợ", { align: "right" }),
          "Còn nợ",
        ),
        size: 110,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums text-xs",
        cell: (row: MonthlyReceivablesGroupItem) => (
          <span
            className={cn(
              "font-mono tabular-nums",
              row.remaining > 0
                ? "font-bold text-amber-600 dark:text-amber-400"
                : "text-muted-foreground/60",
            )}
          >
            {row.remaining > 0 ? money(row.remaining) : "—"}
          </span>
        ),
      },
      {
        key: "shareRate",
        header: compactHeader(
          headerFilter.numeric("shareRate", "Tỷ trọng", {
            align: "center",
          }),
          "Tỷ trọng",
        ),
        size: 75,
        headerClassName: "text-center font-semibold",
        className:
          "text-center font-mono tabular-nums text-xs text-foreground font-semibold",
        cell: (row: MonthlyReceivablesGroupItem) =>
          `${row.shareRate.toFixed(1)}%`,
      },
    ],
    [headerFilter, onSelectGroup, t],
  );
}
