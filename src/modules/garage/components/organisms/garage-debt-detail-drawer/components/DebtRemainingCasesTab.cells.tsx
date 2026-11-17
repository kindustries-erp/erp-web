import React from "react";
import { Badge } from "@/v2/shared/ui/badge";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils";
import type { DebtRemainingCaseRow } from "./DebtRemainingCasesTab.type";

export function renderDebtorCell(row: DebtRemainingCaseRow) {
  const isBH = row.payerType === "BH";
  const isEnt = row.partnerType === "enterprise";
  const badgeCls = isBH
    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
    : isEnt
      ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-border";

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Badge
        variant="outline"
        className={cn("text-[10px] px-1 py-0 shrink-0 font-medium", badgeCls)}
      >
        {isBH ? "Bảo hiểm" : isEnt ? "DN" : "Cá nhân"}
      </Badge>
      <span className="truncate" title={row.debtorName}>
        {row.debtorName}
      </span>
    </div>
  );
}

export function renderVatCell(row: DebtRemainingCaseRow) {
  if (row.vatWarning) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35 text-[10px] font-bold gap-1 px-1.5 py-0.5"
      >
        <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
        <span>Thiếu HĐ</span>
      </Badge>
    );
  }
  if (row.invoiceNo) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[11px] font-mono px-1.5 py-0"
      >
        #{row.invoiceNo}
      </Badge>
    );
  }
  return <span className="text-muted-foreground/60 text-xs">—</span>;
}
