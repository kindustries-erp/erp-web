import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ErpInvoiceInternalMain } from "./ErpInvoiceInternalInfo";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getPdfDownloadUrl: vi.fn().mockResolvedValue({ url: "blob:mock-url" }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

vi.mock("./ErpInvoiceLinkedDocuments", () => ({
  ErpInvoiceLinkedDocuments: () => <div data-testid="mock-linked-docs" />,
}));

describe("ErpInvoiceInternalMain", () => {
  const defaultProps = {
    form: { invoiceNo: "INV-1" } as any,
    editMode: false,
    fieldSet: vi.fn(),
    direction: "IN" as const,
    detailInvoice: {
      id: "inv-1",
      postingStatus: "DRAFT",
      pdfFileKey: null,
      pdfFiles: [],
    } as any,
    postingState: { lines: [], reset: vi.fn() },
    pendingUnpost: false,
    invoicePreview: <div data-testid="fallback-preview">Fallback Preview</div>,
  };

  it("should render fallback invoicePreview when there is no pdfKey", () => {
    render(<ErpInvoiceInternalMain {...defaultProps} />);

    // The fallback preview should be displayed
    expect(screen.getByTestId("fallback-preview")).toBeInTheDocument();

    // iframe should NOT be displayed
    expect(screen.queryByTitle("PDF Preview")).not.toBeInTheDocument();
  });

  it("should render iframe when pdfKey exists", async () => {
    const propsWithPdf = {
      ...defaultProps,
      detailInvoice: {
        ...defaultProps.detailInvoice,
        pdfFileKey: "some-pdf.pdf",
      },
    };

    render(<ErpInvoiceInternalMain {...propsWithPdf} />);

    // Wait for the iframe to appear after the mock API call
    await waitFor(() => {
      expect(screen.getByTitle("PDF Preview")).toBeInTheDocument();
    });

    // Fallback preview should NOT be displayed
    expect(screen.queryByTestId("fallback-preview")).not.toBeInTheDocument();
  });
});
