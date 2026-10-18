import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { InvoiceDocumentWorkspace } from "./InvoiceDocumentWorkspace";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, defaultVal?: string) => defaultVal || _key,
  }),
}));

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getPdfDownloadUrl: vi
      .fn()
      .mockResolvedValue({ url: "https://example.com/mock.pdf" }),
    downloadPdfsZip: vi.fn().mockResolvedValue(new Blob(["zip"])),
    deletePdf: vi.fn().mockResolvedValue({ success: true }),
    unlinkAttachment: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("@/modules/system/api/attachmentsApi", () => ({
  getAttachmentDownloadUrlApi: vi
    .fn()
    .mockResolvedValue({ url: "https://example.com/att.pdf" }),
  getFileViewUrl: vi.fn((id) => `https://example.com/view/${id}`),
  uploadAttachmentApi: vi
    .fn()
    .mockResolvedValue({ success: true, attachments: [] }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe("InvoiceDocumentWorkspace", () => {
  const mockInvoice: any = {
    id: "inv-123",
    invoiceNo: "0001234",
    pdfFileKey: "invoices/2026/inv-123.pdf",
    attachments: [
      {
        attachmentId: "att-1",
        attachment: {
          id: "att-1",
          fileName: "contract.pdf",
          mimeType: "application/pdf",
          documentType: "HOP_DONG",
          fileSize: 102400,
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders document list, badge counts and toolbar", () => {
    render(
      <InvoiceDocumentWorkspace detailInvoice={mockInvoice} editMode={false} />,
    );

    expect(screen.getByText("Danh sách tệp")).toBeInTheDocument();
    expect(screen.getByText("inv-123.pdf")).toBeInTheDocument();
    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
    expect(screen.getByText("Hợp đồng")).toBeInTheDocument();
    expect(screen.getByText("PDF gốc")).toBeInTheDocument();
    expect(screen.getByText("Tải tất cả (ZIP)")).toBeInTheDocument();
  });

  it("displays empty state when no files exist", () => {
    const emptyInvoice: any = {
      id: "inv-empty",
      invoiceNo: "0009999",
      attachments: [],
    };

    render(
      <InvoiceDocumentWorkspace
        detailInvoice={emptyInvoice}
        editMode={false}
      />,
    );

    expect(
      screen.getByText("Chưa có tài liệu hoặc tệp PDF đính kèm."),
    ).toBeInTheDocument();
    expect(screen.getByText("Chưa có tệp PDF đính kèm")).toBeInTheDocument();
  });

  it("handles document selection and updates active preview", () => {
    render(
      <InvoiceDocumentWorkspace detailInvoice={mockInvoice} editMode={false} />,
    );

    const contractItem = screen.getByText("contract.pdf");
    fireEvent.click(contractItem);

    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
  });

  it("handles pending files added in edit mode", () => {
    const mockFile = new File(["dummy content"], "test-invoice.pdf", {
      type: "application/pdf",
    });

    render(
      <InvoiceDocumentWorkspace
        detailInvoice={mockInvoice}
        editMode={true}
        form={
          {
            pendingAddedAttachments: [
              { file: mockFile, documentType: "HOA_DON" },
            ],
            pendingDeletedPdfs: [],
          } as any
        }
      />,
    );

    expect(screen.getByText("test-invoice.pdf")).toBeInTheDocument();
    expect(screen.getByText("Chờ lưu")).toBeInTheDocument();
  });

  it("deduplicates files when pdfFileKey matches an attachment fileKey", () => {
    const dedupeInvoice: any = {
      id: "inv-dedupe",
      invoiceNo: "0005555",
      pdfFileKey: "invoices/pdf/duplicate-uuid.pdf",
      attachments: [
        {
          attachmentId: "att-match",
          attachment: {
            id: "att-match",
            fileName: "2026-10-02_C26MHD_65114302.pdf",
            fileKey: "invoices/pdf/duplicate-uuid.pdf",
            mimeType: "application/pdf",
            documentType: "HOA_DON",
            fileSize: 280145,
          },
        },
      ],
    };

    render(
      <InvoiceDocumentWorkspace
        detailInvoice={dedupeInvoice}
        editMode={false}
      />,
    );

    // Should only render 1 file item with the friendly name, size, and original badge
    expect(screen.getByText("1 tệp")).toBeInTheDocument();
    expect(
      screen.getByText("2026-10-02_C26MHD_65114302.pdf"),
    ).toBeInTheDocument();
    expect(screen.queryByText("duplicate-uuid.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("PDF gốc")).toBeInTheDocument();
    expect(screen.getByText("• 274 KB")).toBeInTheDocument();
  });
});
