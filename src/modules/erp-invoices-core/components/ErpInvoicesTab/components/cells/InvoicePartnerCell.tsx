import React, { useState } from "react";
import { PanelRightOpen, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { TableText } from "@/shared/components/DataTable/TableText";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoicePartnerCellProps {
  inv: ErpInvoice;
  direction: "IN" | "OUT";
  onSelectPartner: (partner: { taxCode: string; partnerName: string }) => void;
}

export function InvoicePartnerCell({
  inv,
  direction,
  onSelectPartner,
}: InvoicePartnerCellProps) {
  const [copiedName, setCopiedName] = useState(false);
  const [copiedTax, setCopiedTax] = useState(false);

  const buyerDisplayName =
    inv.buyerName?.trim() || inv.buyerPersonalName?.trim() || "";
  const partnerName =
    direction === "IN" ? inv.sellerName?.trim() || "" : buyerDisplayName;
  const taxCode =
    direction === "IN" ? inv.sellerTaxCode?.trim() : inv.buyerTaxCode?.trim();
  const cccd = direction === "OUT" ? inv.buyerCccd?.trim() : undefined;
  const displayTax = taxCode || cccd;

  if (!partnerName && !displayTax) {
    return <span className="text-muted-foreground">—</span>;
  }

  const copyToClipboard = (
    text: string,
    isTax: boolean,
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
    if (isTax) {
      setCopiedTax(true);
      toast.success("Đã copy MST", { id: "partner-tax-copy" });
      setTimeout(() => setCopiedTax(false), 1500);
    } else {
      setCopiedName(true);
      toast.success("Đã copy tên đối tác", { id: "partner-name-copy" });
      setTimeout(() => setCopiedName(false), 1500);
    }
  };

  const handleOpenDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (taxCode) {
      onSelectPartner({
        taxCode,
        partnerName: partnerName || "",
      });
    }
  };

  const taxPrefix = taxCode ? "MST: " : "CCCD: ";

  return (
    <div className="flex items-center gap-1.5 w-full min-w-0 py-0.5 leading-none">
      {/* Left Drawer Icon: Vertically centered across both rows */}
      {taxCode && (
        <Tooltip content="Xem thông tin liên quan">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-transparent hover:text-primary transition-all focus:ring-0 focus-visible:ring-0 focus:outline-none"
            onClick={handleOpenDrawer}
            aria-label="Xem thông tin liên quan"
          >
            <PanelRightOpen className="w-3.5 h-3.5" />
          </Button>
        </Tooltip>
      )}

      {/* Right Column: 2 tightly packed single lines */}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
        {/* Row 1: Partner Name with independent copy */}
        <div className="flex items-center gap-1 min-w-0 group/pname">
          <Tooltip content={partnerName || "—"}>
            <span
              className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight select-text cursor-pointer hover:text-primary transition-colors"
              onClick={taxCode ? handleOpenDrawer : undefined}
            >
              {partnerName || "—"}
            </span>
          </Tooltip>
          {partnerName && partnerName !== "—" && (
            <Tooltip content={copiedName ? "Đã copy" : "Copy tên"}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-3.5 w-3.5 p-0 opacity-0 group-hover/pname:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={(e) => copyToClipboard(partnerName, false, e)}
                aria-label="Copy tên"
              >
                {copiedName ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </Button>
            </Tooltip>
          )}
        </div>

        {/* Row 2: Subtext MST with independent copy */}
        {displayTax && (
          <div className="flex items-center gap-1 min-w-0 group/tax">
            <Tooltip content={`${taxPrefix}${displayTax}`}>
              <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                <span className="text-slate-400 font-sans mr-0.5">
                  {taxPrefix}
                </span>
                {displayTax}
              </span>
            </Tooltip>
            <Tooltip content={copiedTax ? "Đã copy" : "Copy MST"}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 opacity-0 group-hover/tax:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={(e) => copyToClipboard(displayTax, true, e)}
                aria-label="Copy MST"
              >
                {copiedTax ? (
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
}

export interface InvoicePartnerNameCellProps {
  inv: ErpInvoice;
  direction: "IN" | "OUT";
  onSelectPartner: (partner: { taxCode: string; partnerName: string }) => void;
}

export function InvoicePartnerNameCell({
  inv,
  direction,
  onSelectPartner,
}: InvoicePartnerNameCellProps) {
  return (
    <InvoicePartnerCell
      inv={inv}
      direction={direction}
      onSelectPartner={onSelectPartner}
    />
  );
}

export interface InvoiceTaxCodeCellProps {
  inv: ErpInvoice;
  direction: "IN" | "OUT";
  onSelectPartner: (partner: { taxCode: string; partnerName: string }) => void;
}

export function InvoiceTaxCodeCell({
  inv,
  direction,
  onSelectPartner,
}: InvoiceTaxCodeCellProps) {
  const taxCode =
    direction === "IN" ? inv.sellerTaxCode || "—" : inv.buyerTaxCode || "—";
  const buyerDisplayName =
    inv.buyerName?.trim() || inv.buyerPersonalName?.trim() || "";
  const partnerName =
    direction === "IN" ? inv.sellerName || "" : buyerDisplayName;

  if (!taxCode || taxCode === "—") return <>—</>;

  return (
    <TableText
      text={taxCode}
      onDrawerClick={(e) => {
        e.stopPropagation();
        onSelectPartner({
          taxCode,
          partnerName,
        });
      }}
      tooltip={true}
      enableCopy={true}
    />
  );
}
