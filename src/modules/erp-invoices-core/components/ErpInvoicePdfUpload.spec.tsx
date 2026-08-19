import React from "react";
import { render, screen } from "@testing-library/react";
import { ErpInvoicePdfUpload } from "./ErpInvoicePdfUpload";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    downloadPdfsZip: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe("ErpInvoicePdfUpload", () => {
  const defaultProps = {
    invoiceId: "inv-1",
    attachments: [
      {
        attachmentId: "att-main",
        attachment: {
          id: "file-main",
          fileName: "main-pdf.pdf",
          documentType: "HOA_DON",
          mimeType: "application/pdf",
        },
      },
      {
        attachmentId: "att-sub",
        attachment: {
          id: "file-sub",
          fileName: "sub-pdf.pdf",
          documentType: "BANG_KE",
          mimeType: "application/pdf",
        },
      },
    ],
    editMode: false,
    pendingDeletedPdfs: [],
    pendingAddedAttachments: [],
  };

  it("should render all linked attachments", () => {
    render(<ErpInvoicePdfUpload {...defaultProps} />);

    expect(screen.getByText("main-pdf.pdf")).toBeInTheDocument();
    expect(screen.getByText("sub-pdf.pdf")).toBeInTheDocument();
  });

  it("should filter out files that are in pendingDeletedPdfs", () => {
    render(
      <ErpInvoicePdfUpload
        {...defaultProps}
        pendingDeletedPdfs={["att-main"]}
      />,
    );

    expect(screen.queryByText("main-pdf.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("sub-pdf.pdf")).toBeInTheDocument();
  });

  it("should NOT render delete icons when editMode is false", () => {
    render(<ErpInvoicePdfUpload {...defaultProps} editMode={false} />);
    expect(screen.queryByTitle("Xóa đính kèm")).not.toBeInTheDocument();
  });

  it("should render without DrawerSection wrapper when noCard is true", () => {
    render(<ErpInvoicePdfUpload {...defaultProps} noCard={true} />);
    expect(screen.getByText("main-pdf.pdf")).toBeInTheDocument();
    // In noCard mode, the duplicate "Tài liệu đính kèm" DrawerSection title should not be rendered
    expect(screen.queryByText("Tài liệu đính kèm")).not.toBeInTheDocument();
  });
});
