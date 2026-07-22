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
    pdfFileKey: "main-pdf.pdf",
    pdfFiles: [{ key: "sub-pdf.pdf", filename: "sub-pdf.pdf" }],
    editMode: false,
    pendingDeletedPdfs: [],
    pendingAddedPdfs: [],
  };

  it("should render both primary pdfFileKey and secondary pdfFiles", () => {
    render(<ErpInvoicePdfUpload {...defaultProps} />);

    // Check if both files are displayed
    expect(screen.getByText("main-pdf.pdf")).toBeInTheDocument();
    expect(screen.getByText("sub-pdf.pdf")).toBeInTheDocument();
  });

  it("should filter out files that are in pendingDeletedPdfs", () => {
    render(
      <ErpInvoicePdfUpload
        {...defaultProps}
        pendingDeletedPdfs={["main-pdf.pdf"]}
      />,
    );

    // main-pdf.pdf should be hidden
    expect(screen.queryByText("main-pdf.pdf")).not.toBeInTheDocument();
    // sub-pdf.pdf should still be visible
    expect(screen.getByText("sub-pdf.pdf")).toBeInTheDocument();
  });

  it("should NOT render delete icons when editMode is false", () => {
    const { container } = render(
      <ErpInvoicePdfUpload {...defaultProps} editMode={false} />,
    );
    // SVG for delete icon usually has a specific class or we can check by querying the DOM
    const trashIcons = container.querySelectorAll(".lucide-trash2");
    expect(trashIcons.length).toBe(0);
  });
});
