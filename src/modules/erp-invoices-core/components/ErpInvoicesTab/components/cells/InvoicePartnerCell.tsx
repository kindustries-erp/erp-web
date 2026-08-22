import React from "react";
import { TableText } from "@/shared/components/DataTable/TableText";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

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
  const buyerDisplayName =
    inv.buyerName?.trim() || inv.buyerPersonalName?.trim() || "—";
  const text = direction === "IN" ? inv.sellerName || "—" : buyerDisplayName;
  const taxCode = direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode;

  return (
    <TableText
      text={text}
      onDrawerClick={
        taxCode
          ? (e) => {
              e.stopPropagation();
              onSelectPartner({
                taxCode,
                partnerName: text !== "—" ? text : "",
              });
            }
          : undefined
      }
      tooltip={true}
      enableCopy={true}
      textClassName="whitespace-normal line-clamp-2 break-words"
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
