import React from "react";
import { render, screen } from "@testing-library/react";
import { ErpInvoiceAttachmentsSubTab } from "../ErpInvoiceAttachmentsSubTab";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../InvoiceDocumentWorkspace", () => ({
  InvoiceDocumentWorkspace: (props: any) => (
    <div
      data-testid="invoice-document-workspace"
      data-props={JSON.stringify(props)}
    >
      Document Workspace Component ({props.detailInvoice?.id || "empty"})
    </div>
  ),
}));

describe("ErpInvoiceAttachmentsSubTab", () => {
  it("renders InvoiceDocumentWorkspace with invoice passed as detailInvoice", () => {
    const mockInvoice: any = {
      id: "inv-uuid-123",
      invoiceNo: "0001234",
    };

    render(
      <ErpInvoiceAttachmentsSubTab invoice={mockInvoice} editMode={true} />,
    );

    const wsComp = screen.getByTestId("invoice-document-workspace");
    expect(wsComp).toBeInTheDocument();
    expect(wsComp).toHaveTextContent(
      "Document Workspace Component (inv-uuid-123)",
    );
  });
});
