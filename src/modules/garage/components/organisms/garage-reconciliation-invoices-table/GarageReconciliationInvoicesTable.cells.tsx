import React from "react";
import { Eye } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export function InvoiceNoCell({
  inv,
  onViewDetail,
  onPreviewPdf,
  t,
}: {
  inv: ErpInvoice;
  onViewDetail: (id: string) => void;
  onPreviewPdf: (pdf: {
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
  }) => void;
  t: (key: string, def?: string) => string;
}) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <button
        type="button"
        className="text-xs font-mono font-bold text-primary hover:underline truncate cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail(inv.id);
        }}
      >
        {inv.invoiceNo || "---"}
      </button>
      {inv.pdfFileKey && (
        <Tooltip
          content={t("cases.reconciliation.viewPdfTooltip", "Xem PDF hóa đơn")}
        >
          <button
            type="button"
            className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onPreviewPdf({
                url: `/api/v1/erp-invoices-core/${inv.id}/pdf`,
                filename: `HD_${inv.invoiceNo || inv.id}.pdf`,
                fileKey: inv.pdfFileKey || "",
                invoiceId: inv.id,
              });
            }}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

export function InvoicePlateCell({
  licensePlate,
}: {
  licensePlate?: string | null;
}) {
  if (!licensePlate) return <span className="text-muted-foreground/40">—</span>;
  return (
    <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
      {licensePlate}
    </span>
  );
}
