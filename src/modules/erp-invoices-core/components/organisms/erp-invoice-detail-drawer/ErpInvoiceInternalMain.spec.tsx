import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ErpInvoiceInternalMain } from "./ErpInvoiceInternalMain";
import {
  InvoicePreviewModeContext,
  type InvoiceDetailViewMode,
} from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { invoiceFilesV2Api } from "@/modules/erp-invoices-core/api/invoiceFilesV2Api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal?: string) => defaultVal || key,
  }),
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => "vi",
}));

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {},
}));

const v2Files = vi.hoisted(() => ({ current: [] as any[] }));
vi.mock("@/modules/erp-invoices-core/hooks/useInvoiceFilesV2", () => ({
  useInvoiceFilesV2: () => ({
    files: v2Files.current,
    policy: null,
    loading: false,
    reload: vi.fn(),
  }),
}));
vi.mock("@/modules/erp-invoices-core/api/invoiceFilesV2Api", () => ({
  invoiceFilesV2Api: {
    downloadUrl: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
  },
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function renderWithContext(
  ui: React.ReactElement,
  previewMode: InvoiceDetailViewMode = "template",
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <InvoicePreviewModeContext.Provider
        value={{
          previewMode,
          setPreviewMode: vi.fn(),
          hasPdf: previewMode === "pdf",
        }}
      >
        {ui}
      </InvoicePreviewModeContext.Provider>
    </QueryClientProvider>,
  );
}

describe("ErpInvoiceInternalMain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    v2Files.current = [];
  });

  it("renders custom preview when provided in template mode", () => {
    renderWithContext(
      <ErpInvoiceInternalMain
        detailInvoice={{ id: "inv-1" } as any}
        invoicePreview={<div data-testid="custom-preview">Hóa đơn điện tử</div>}
      />,
      "template",
    );

    expect(screen.getByTestId("custom-preview")).toBeInTheDocument();
  });

  it("renders ErpInvoiceDetailLinesTable by default when invoicePreview is omitted in template mode", () => {
    const mockInvoice: any = {
      id: "inv-1",
      invoiceNo: "0006362",
      items: [
        {
          id: "item-1",
          description: "Bánh trung thu thập cẩm",
          quantity: 10,
          unitPrice: 50000,
          totalAmount: 500000,
        },
      ],
    };

    renderWithContext(
      <ErpInvoiceInternalMain detailInvoice={mockInvoice} />,
      "template",
    );

    expect(
      screen.getByText("Danh sách chi tiết hàng hóa & dịch vụ"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bánh trung thu thập cẩm")).toBeInTheDocument();
  });

  it("renders empty PDF state when previewMode is pdf and invoice has no pdf attachments or keys", () => {
    renderWithContext(
      <ErpInvoiceInternalMain
        detailInvoice={{ id: "inv-1", attachments: [] } as any}
      />,
      "pdf",
    );

    expect(screen.getByText("Chưa có tệp PDF đính kèm")).toBeInTheDocument();
  });

  it("loads and renders PDF iframe when pdfFileKey is null but attachments has a PDF file", async () => {
    v2Files.current = [
      {
        id: "att-1",
        category: "HOA_DON",
        isOriginal: false,
        fileName: "Hoa_don_GTGT.pdf",
        fileSize: 10,
        mimeType: "application/pdf",
        origin: "V2",
        createdAt: "2026-10-01T00:00:00Z",
      },
    ];
    (invoiceFilesV2Api.downloadUrl as any).mockResolvedValue({
      url: "https://r2.domain.com/signed-url/att-pdf-1.pdf",
    });

    const mockInvoiceWithAttachment: any = {
      id: "inv-1",
      pdfFileKey: null,
      pdfFiles: [],
      attachments: [
        {
          attachmentId: "att-1",
          attachment: {
            id: "att-1",
            fileName: "Hoa_don_GTGT.pdf",
            mimeType: "application/pdf",
          },
        },
      ],
    };

    renderWithContext(
      <ErpInvoiceInternalMain detailInvoice={mockInvoiceWithAttachment} />,
      "pdf",
    );

    await waitFor(() => {
      const iframe = screen.getByTitle("PDF Preview");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        "https://r2.domain.com/signed-url/att-pdf-1.pdf",
      );
    });

    expect(invoiceFilesV2Api.downloadUrl).toHaveBeenCalledWith(
      "inv-1",
      "att-1",
      true,
    );
  });

  it("loads PDF from legacy pdfFileKey when available", async () => {
    v2Files.current = [
      {
        id: "att-legacy",
        category: "HOA_DON",
        isOriginal: false,
        fileName: "inv-legacy.pdf",
        fileSize: 10,
        mimeType: "application/pdf",
        origin: "V2",
        createdAt: "2026-10-01T00:00:00Z",
      },
    ];
    (invoiceFilesV2Api.downloadUrl as any).mockResolvedValue({
      url: "https://r2.domain.com/signed-url/legacy.pdf",
    });

    const mockLegacyInvoice: any = {
      id: "inv-legacy",
      pdfFileKey: "invoices/2026/09/inv-legacy.pdf",
      attachments: [],
    };

    renderWithContext(
      <ErpInvoiceInternalMain detailInvoice={mockLegacyInvoice} />,
      "pdf",
    );

    await waitFor(() => {
      const iframe = screen.getByTitle("PDF Preview");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        "https://r2.domain.com/signed-url/legacy.pdf",
      );
    });

    expect(invoiceFilesV2Api.downloadUrl).toHaveBeenCalledWith(
      "inv-legacy",
      "att-legacy",
      true,
    );
  });

  it("renders ErpInvoiceAdjustmentSection for adjustment invoices", async () => {
    const mockAdjustingInvoice: any = {
      id: "inv-adj-1",
      invoiceNo: "146",
      relatedInvoiceNo: "142",
      taxInvoiceStatus: 3,
      items: [],
    };

    renderWithContext(
      <ErpInvoiceInternalMain detailInvoice={mockAdjustingInvoice} />,
    );

    expect(
      screen.getByText("Hóa đơn gốc bị điều chỉnh & Đối soát"),
    ).toBeInTheDocument();
  });
});
