import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { money } from "@/shared/utils/format";

export function CaseInvoiceStatusBadge({ row }: { row: any }) {
  const vat = Number(row.thueVat || row.vatAmount || 0);
  const hasInv = Boolean(row.daXuatHoaDon || row.invoiceNo || row.invoiceId);

  if (vat > 0 && !hasInv) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35 text-[10px] font-bold gap-1 px-1.5 py-0.5"
      >
        <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
        <span>VAT chưa HĐ ({money(vat)})</span>
      </Badge>
    );
  }
  if (hasInv) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[11px] font-mono px-1.5 py-0"
      >
        ✓ {row.invoiceNo ? `#${row.invoiceNo}` : "Đã xuất HĐ"}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-slate-100 dark:bg-slate-800/80 text-muted-foreground border-border text-[11px] px-1.5 py-0"
    >
      Chưa xuất HĐ
    </Badge>
  );
}
