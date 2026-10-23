import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { InvoiceXmlImportModal } from "./InvoiceXmlImportModal";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const testQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    previewPdfMatch: vi.fn(),
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

describe("InvoiceXmlImportModal", () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  const mockPdfFile = new File(["dummy"], "1_C26MGN_1234567_abc.pdf", {
    type: "application/pdf",
  });
  const mockXmlFile = new File(["dummy"], "inv.xml", {
    type: "application/xml",
  });

  const defaultProps = {
    open: true,
    direction: "IN" as const,
    files: [
      { id: "1", type: "pdf", file: mockPdfFile } as FileEntry,
      { id: "2", type: "xml", file: mockXmlFile } as FileEntry,
    ],
    onConfirm,
    onCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call previewPdfMatch and render matched invoice info with eye icon", async () => {
    vi.mocked(erpInvoicesCoreApi.previewPdfMatch).mockResolvedValueOnce({
      "1_C26MGN_1234567_abc.pdf": {
        id: "inv-uuid",
        invoiceNo: "1234567",
        serialNo: "C26MGN",
        totalAmount: "1000000",
      },
    });

    render(
      <QueryClientProvider client={testQueryClient()}>
        <TooltipProvider>
          <InvoiceXmlImportModal {...defaultProps} />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Wait for the UI to update with matched info
    await waitFor(() => {
      expect(screen.getByText(/Tự động: HĐ 1234567/)).toBeInTheDocument();
      expect(screen.getByText(/KH: C26MGN/)).toBeInTheDocument();
      expect(screen.getByText(/1\.000\.000đ/)).toBeInTheDocument();
    });

    // Check if Eye icon button is rendered
    const eyeButton = screen.getByTitle("Xem trước file");
    expect(eyeButton).toBeInTheDocument();

    // Clicking eye button shouldn't crash
    fireEvent.click(eyeButton);
  });

  it("should render default text when pdf is not matched", async () => {
    vi.mocked(erpInvoicesCoreApi.previewPdfMatch).mockResolvedValue({
      "1_C26MGN_1234567_abc.pdf": null,
    });

    render(
      <QueryClientProvider client={testQueryClient()}>
        <TooltipProvider>
          <InvoiceXmlImportModal {...defaultProps} />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Wait for the state to settle
    await waitFor(() => {
      // Should still have Eye icon for previewing local file
      expect(screen.getByTitle("Xem trước file")).toBeInTheDocument();
    });

    const elements = screen.getAllByText(/File mồ côi/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("selects and clears every file from the header checkbox", () => {
    render(
      <QueryClientProvider client={testQueryClient()}>
        <TooltipProvider>
          <InvoiceXmlImportModal {...defaultProps} />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    const selectAll = screen.getByLabelText("Chọn tất cả");
    fireEvent.click(selectAll);
    expect(
      screen.getByText("Chọn ít nhất 1 file để import"),
    ).toBeInTheDocument();

    fireEvent.click(selectAll);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("confirms with the selected files", () => {
    render(
      <QueryClientProvider client={testQueryClient()}>
        <TooltipProvider>
          <InvoiceXmlImportModal {...defaultProps} />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Xác nhận Import/ }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const [selected] = onConfirm.mock.calls[0];
    expect(selected).toHaveLength(2);
  });
});
