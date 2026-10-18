import React from "react";
import { TableText } from "@/shared/components/DataTable/TableText";
import { InvoiceDateRangeSlot } from "@/modules/erp-invoices-core/components";
import type { ErpAttachment } from "../../types/attachment.types";
import type { useAttachmentsTable } from "./AttachmentsTable.hook";

export function RelatedDocsCell({
  attachment,
  onOpenInvoice,
}: {
  attachment: ErpAttachment;
  onOpenInvoice?: (id: string) => void;
}) {
  if (!attachment.invoiceLinks || attachment.invoiceLinks.length === 0) {
    return <span>—</span>;
  }
  return (
    <div className="flex flex-col gap-1 items-start justify-center">
      {attachment.invoiceLinks.map((link, idx) =>
        link.invoice?.invoiceNo ? (
          <TableText
            key={idx}
            text={link.invoice.invoiceNo}
            onDrawerClick={() => {
              if (link.invoice?.id && onOpenInvoice) {
                onOpenInvoice(link.invoice.id);
              }
            }}
            className="w-auto"
          />
        ) : null,
      )}
    </div>
  );
}

export function AttachmentsDateRangeSlot({
  tableState,
  close,
}: {
  tableState: ReturnType<typeof useAttachmentsTable>;
  close: () => void;
}) {
  return (
    <InvoiceDateRangeSlot
      dateFrom={tableState.dateFrom}
      dateTo={tableState.dateTo}
      onChange={(from: string, to: string) => {
        tableState.setDateFrom(from);
        tableState.setDateTo(to);
        tableState.setPage(1);
      }}
      onClose={close}
    />
  );
}
