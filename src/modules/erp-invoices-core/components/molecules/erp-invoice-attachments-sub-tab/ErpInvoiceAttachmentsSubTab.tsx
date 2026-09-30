import React from "react";
import { InvoiceDocumentWorkspace } from "@/modules/erp-invoices-core/components/InvoiceDocumentWorkspace";
import type { ErpInvoiceAttachmentsSubTabProps } from "./ErpInvoiceAttachmentsSubTab.type";

export const ErpInvoiceAttachmentsSubTab = React.memo(
  function ErpInvoiceAttachmentsSubTab({
    invoice,
    ...rest
  }: ErpInvoiceAttachmentsSubTabProps) {
    return <InvoiceDocumentWorkspace detailInvoice={invoice} {...rest} />;
  },
);
