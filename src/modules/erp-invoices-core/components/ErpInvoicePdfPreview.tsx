import React from "react";
import {
  InvoiceDocumentWorkspace,
  type InvoiceDocumentWorkspaceProps,
} from "./InvoiceDocumentWorkspace";

export type ErpInvoicePdfPreviewProps = InvoiceDocumentWorkspaceProps;

export const ErpInvoicePdfPreview = React.memo(function ErpInvoicePdfPreview(
  props: ErpInvoicePdfPreviewProps,
) {
  return <InvoiceDocumentWorkspace {...props} />;
});
