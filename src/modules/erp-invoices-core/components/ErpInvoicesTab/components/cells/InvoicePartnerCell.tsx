import React from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { CopyButton } from "@/shared/components/CopyButton";
import { TableText } from "@/shared/components/DataTable/TableText";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoicePartnerCellProps {
  inv: ErpInvoice;
  direction: "IN" | "OUT";
}

export const InvoicePartnerCell = React.memo(function InvoicePartnerCell({
  inv,
  direction,
}: InvoicePartnerCellProps) {
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

  const taxPrefix = taxCode ? "MST: " : "CCCD: ";

  return (
    <div className="flex items-center gap-1.5 w-full min-w-0 py-0.5 leading-none">
      {/* Right Column: 2 tightly packed single lines */}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
        {/* Row 1: Partner Name with independent copy */}
        <div className="flex items-center gap-1 min-w-0 group/pname">
          <Tooltip content={partnerName || "—"}>
            <span className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight select-text">
              {partnerName || "—"}
            </span>
          </Tooltip>
          {partnerName && partnerName !== "—" && (
            <CopyButton
              value={partnerName}
              tooltip="Copy tên"
              copiedTooltip="Đã copy"
              toastMessage="Đã copy tên đối tác"
              toastId="partner-name-copy"
              iconClassName="w-2.5 h-2.5"
              className="h-3.5 w-3.5 p-0 opacity-0 group-hover/pname:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
            />
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
            <CopyButton
              value={displayTax}
              tooltip="Copy MST"
              copiedTooltip="Đã copy"
              toastMessage="Đã copy MST"
              toastId="partner-tax-copy"
              iconClassName="w-2.5 h-2.5"
              className="h-3 w-3 p-0 opacity-0 group-hover/tax:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
});

export interface InvoicePartnerNameCellProps {
  inv: ErpInvoice;
  direction: "IN" | "OUT";
}

export const InvoicePartnerNameCell = React.memo(
  function InvoicePartnerNameCell({
    inv,
    direction,
  }: InvoicePartnerNameCellProps) {
    return <InvoicePartnerCell inv={inv} direction={direction} />;
  },
);

export interface InvoiceTaxCodeCellProps {
  inv: ErpInvoice;
  direction: "IN" | "OUT";
}

export const InvoiceTaxCodeCell = React.memo(function InvoiceTaxCodeCell({
  inv,
  direction,
}: InvoiceTaxCodeCellProps) {
  const taxCode =
    direction === "IN" ? inv.sellerTaxCode || "—" : inv.buyerTaxCode || "—";

  if (!taxCode || taxCode === "—") return <>—</>;

  return <TableText text={taxCode} tooltip={true} enableCopy={true} />;
});
