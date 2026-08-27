import React, { useState } from "react";
import { Eye, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceNoCellProps {
  inv: ErpInvoice;
  handleOpenInternal: (inv: any, mode?: "view" | "edit") => void;
}

export const InvoiceNoCell = React.memo(function InvoiceNoCell({
  inv,
  handleOpenInternal,
}: InvoiceNoCellProps) {
  const [copiedNo, setCopiedNo] = useState(false);
  const [copiedSerial, setCopiedSerial] = useState(false);

  const invoiceNo = inv.invoiceNo?.trim() || "";
  const serialNo = inv.serialNo?.trim() || "";

  if (!invoiceNo && !serialNo) {
    return <span className="text-muted-foreground">—</span>;
  }

  const copyToClipboard = (
    text: string,
    isSerial: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    if (isSerial) {
      setCopiedSerial(true);
      toast.success("Đã copy Ký hiệu HĐ", { id: "invoice-serial-copy" });
      setTimeout(() => setCopiedSerial(false), 1500);
    } else {
      setCopiedNo(true);
      toast.success("Đã copy Số HĐ", { id: "invoice-no-copy" });
      setTimeout(() => setCopiedNo(false), 1500);
    }
  };

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
            <Tooltip content={copiedNo ? "Đã copy" : "Copy Số HĐ"}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-3.5 w-3.5 p-0 opacity-0 group-hover/invno:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={(e) => copyToClipboard(invoiceNo, false, e)}
                aria-label="Copy Số HĐ"
              >
                {copiedNo ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </Button>
            </Tooltip>
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
            <Tooltip content={copiedSerial ? "Đã copy" : "Copy Ký hiệu"}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 opacity-0 group-hover/serial:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={(e) => copyToClipboard(serialNo, true, e)}
                aria-label="Copy Ký hiệu"
              >
                {copiedSerial ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
});
