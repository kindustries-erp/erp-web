import React from "react";
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
    <div className="flex flex-col justify-center min-w-0 w-full gap-0.5 py-0.5 leading-none">
      {/* Row 1: Partner Name qua App TableText */}
      <TableText
        text={partnerName || "—"}
        tooltip={true}
        enableCopy={Boolean(partnerName && partnerName !== "—")}
        textClassName="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight select-text"
      />

      {/* Row 2: Subtext MST / CCCD qua App TableText */}
      {displayTax && (
        <TableText
          text={`${taxPrefix}${displayTax}`}
          tooltip={true}
          enableCopy={true}
          textClassName="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text"
        />
      )}
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
