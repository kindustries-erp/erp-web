import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ErpInvoiceInternalMain } from "../ErpInvoiceInternalInfo";
import {
  InvoicePreviewModeContext,
  type InvoiceDetailViewMode,
} from "../../context/InvoicePreviewModeContext";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { erpInvoicesCoreApi } from "../../api/erpInvoicesCoreApi";
import { getAttachmentDownloadUrlApi } from "@/modules/system/api/attachmentsApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal?: string) => defaultVal || key,
  }),
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => "vi",
}));

vi.mock("../../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getPdfDownloadUrl: vi.fn(),
  },
}));

vi.mock("@/modules/system/api/attachmentsApi", () => ({
  getAttachmentDownloadUrlApi: vi.fn(),
  getFileViewUrl: vi.fn((id: string) => `http://mock-view-url/${id}`),
}));

function renderWithContext(
  ui: React.ReactElement,
  previewMode: InvoiceDetailViewMode = "template",
) {
  return render(
    <InvoicePreviewModeContext.Provider
      value={{
        previewMode,
        setPreviewMode: vi.fn(),
        hasPdf: previewMode === "pdf",
      }}
    >
      {ui}
    </InvoicePreviewModeContext.Provider>,
  );
}

describe("ErpInvoiceInternalMain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders template preview when previewMode is template", () => {
    renderWithContext(
      <ErpInvoiceInternalMain
        detailInvoice={{ id: "inv-1" } as any}
        invoicePreview={<div data-testid="custom-preview">Hóa đơn điện tử</div>}
      />,
      "template",
    );

    expect(screen.getByTestId("custom-preview")).toBeInTheDocument();
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
    (getAttachmentDownloadUrlApi as any).mockResolvedValue({
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

    expect(getAttachmentDownloadUrlApi).toHaveBeenCalledWith("att-1", true);
  });

  it("loads PDF from legacy pdfFileKey when available", async () => {
    (erpInvoicesCoreApi.getPdfDownloadUrl as any).mockResolvedValue({
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

    expect(erpInvoicesCoreApi.getPdfDownloadUrl).toHaveBeenCalledWith(
      "inv-legacy",
      "invoices/2026/09/inv-legacy.pdf",
      true,
    );
  });
});
