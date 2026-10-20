import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { ShieldCheck, User, AlertTriangle } from "lucide-react";
import type { MonthInvoiceCaseRow } from "./MonthInvoiceCaseRow.type";

export const CasePayerTypeBadge: React.FC<{ payerType: "KH" | "BH" }> = ({
  payerType,
}) =>
  payerType === "BH" ? (
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
  );

export const CaseInvoiceStatusBadge: React.FC<{ row: MonthInvoiceCaseRow }> = ({
  row,
}) => {
  if (row.vatWarning) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35 font-bold text-[10px] gap-1 px-1.5 py-0.5"
      >
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Có VAT – Chưa xuất HĐ</span>
      </Badge>
    );
  }
  if (row.hasInvoice) {
    const nos =
      row.invoiceNos.length > 0
        ? `#${row.invoiceNos.join(", ")}`
        : row.invoiceNo
          ? `#${row.invoiceNo}`
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
      Không VAT
    </Badge>
  );
};
