import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
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
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: MonthlyReceivablesGroupItem, index: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {index}
          </span>
        ),
      },
      {
        key: "payerType",
        header: "LOẠI THU",
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
          headerFilter("title", "ĐỐI TƯỢNG HÓA ĐƠN / CTY BẢO HIỂM", {
            align: "left",
          }),
          t("progress.columns.partnerTitleFull", "Đối tượng HĐ / Cty Bảo hiểm"),
        ),
        size: 260,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
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
        headerClassName: "text-center font-semibold",
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
          headerFilter.numeric("caseCount", "SỐ VỤ VIỆC", { align: "center" }),
          "Số vụ việc",
        ),
        size: 100,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        className: "text-center tabular-nums text-muted-foreground",
        cell: (row: MonthlyReceivablesGroupItem) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            {row.caseCount} phiếu
          </span>
        ),
      },
      {
        key: "billed",
        header: compactHeader(
          headerFilter.amount("billed", "TỔNG PHÁT SINH", { align: "right" }),
          "Tổng phát sinh",
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className:
          "text-right font-mono tabular-nums font-semibold text-xs text-foreground",
        cell: (row: MonthlyReceivablesGroupItem) => money(row.billed),
      },
      {
        key: "paid",
        header: compactHeader(
          headerFilter.amount("paid", "ĐÃ THU", { align: "right" }),
          "Đã thu",
        ),
        size: 120,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className:
          "text-right font-mono tabular-nums text-xs text-foreground font-medium",
        cell: (row: MonthlyReceivablesGroupItem) =>
          row.paid > 0 ? money(row.paid) : "—",
      },
      {
        key: "remaining",
        header: compactHeader(
          headerFilter.amount("remaining", "CÒN PHẢI THU", { align: "right" }),
          "Còn phải thu",
        ),
        size: 140,
        enableResizing: true,
        headerClassName:
          "text-center bg-slate-100 dark:bg-slate-800/60 font-semibold border-r border-border/50",
        className:
          "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
        cell: (row: MonthlyReceivablesGroupItem) => (
          <span
            className={
              row.remaining > 0
                ? "font-mono font-bold text-foreground text-[12px] tabular-nums"
                : "font-mono text-muted-foreground/60 text-[11px]"
            }
          >
            {row.remaining > 0 ? money(row.remaining) : "—"}
          </span>
        ),
      },
      {
        key: "shareRate",
        header: compactHeader(
          headerFilter.numeric("shareRate", "TỶ TRỌNG", {
            align: "center",
          }),
          "Tỷ trọng",
        ),
        size: 85,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        className:
          "text-center font-mono tabular-nums text-xs text-foreground font-medium",
        cell: (row: MonthlyReceivablesGroupItem) =>
          `${row.shareRate.toFixed(1)}%`,
      },
    ],
    [headerFilter, onSelectGroup, t],
  );
}
