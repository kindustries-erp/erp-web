import React from "react";
import { Eye } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { CopyButton } from "@/shared/components/CopyButton";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceNoCellProps {
  inv: ErpInvoice;
  handleOpenInternal: (inv: any, mode?: "view" | "edit") => void;
}

export const InvoiceNoCell = React.memo(function InvoiceNoCell({
  inv,
  handleOpenInternal,
}: InvoiceNoCellProps) {
  const invoiceNo = inv.invoiceNo?.trim() || "";
  const serialNo = inv.serialNo?.trim() || "";

  if (!invoiceNo && !serialNo) {
    return <span className="text-muted-foreground">—</span>;
  }

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenInternal(inv);
  };

  return (
    <div className="flex items-center gap-1.5 w-full min-w-0 py-0.5 leading-none">
      {/* Left Eye Icon: Vertically centered across both rows */}
      <Tooltip content="Xem chi tiết hóa đơn">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-transparent hover:text-primary transition-all focus:ring-0 focus-visible:ring-0 focus:outline-none"
          onClick={handleOpenDetail}
          aria-label="Xem chi tiết hóa đơn"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      {/* Right Column: 2 tightly packed single lines */}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
        {/* Row 1: Invoice No with independent copy */}
        <div className="flex items-center gap-1 min-w-0 group/invno">
          <Tooltip content={invoiceNo ? `Số HĐ: ${invoiceNo}` : "—"}>
            <span
              className="truncate text-[11px] font-semibold text-primary leading-tight select-text cursor-pointer hover:underline"
              onClick={handleOpenDetail}
            >
              {invoiceNo || "—"}
            </span>
          </Tooltip>
          {invoiceNo && (
            <CopyButton
              value={invoiceNo}
              tooltip="Copy Số HĐ"
              copiedTooltip="Đã copy"
              toastMessage="Đã copy Số HĐ"
              toastId="invoice-no-copy"
              iconClassName="w-2.5 h-2.5"
              className="h-3.5 w-3.5 p-0 opacity-0 group-hover/invno:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
            />
          )}
        </div>

        {/* Row 2: Subtext Serial No with independent copy */}
        {serialNo && (
          <div className="flex items-center gap-1 min-w-0 group/serial">
            <Tooltip content={`Ký hiệu: ${serialNo}`}>
              <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                {serialNo}
              </span>
            </Tooltip>
            <CopyButton
              value={serialNo}
              tooltip="Copy Ký hiệu"
              copiedTooltip="Đã copy"
              toastMessage="Đã copy Ký hiệu HĐ"
              toastId="invoice-serial-copy"
              iconClassName="w-2.5 h-2.5"
              className="h-3 w-3 p-0 opacity-0 group-hover/serial:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
});
