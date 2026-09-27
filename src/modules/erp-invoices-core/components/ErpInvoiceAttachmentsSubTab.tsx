import React from "react";
import {
  InvoiceDocumentWorkspace,
  type InvoiceDocumentWorkspaceProps,
} from "./InvoiceDocumentWorkspace";
import type { ErpInvoice } from "../api/erpInvoicesCoreApi";

export interface ErpInvoiceAttachmentsSubTabProps extends Omit<
  InvoiceDocumentWorkspaceProps,
  "detailInvoice"
> {
  invoice: ErpInvoice | null;
}

export const ErpInvoiceAttachmentsSubTab = React.memo(
  function ErpInvoiceAttachmentsSubTab({
    invoice,
    ...rest
  }: ErpInvoiceAttachmentsSubTabProps) {
    return <InvoiceDocumentWorkspace detailInvoice={invoice} {...rest} />;
  },
);
