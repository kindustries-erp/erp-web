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
    downloadPdfsZip: vi.fn().mockResolvedValue(new Blob(["zip"])),
  },
}));

vi.mock("@/modules/erp-invoices-core/api/invoiceFilesV2Api", () => ({
  invoiceFilesV2Api: {
    downloadUrl: vi
      .fn()
      .mockResolvedValue({ url: "https://example.com/x.pdf" }),
    upload: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockFiles = vi.hoisted(() => ({ current: [] as any[] }));
vi.mock("@/modules/erp-invoices-core/hooks/useInvoiceFilesV2", () => ({
  useInvoiceFilesV2: () => ({
    files: mockFiles.current,
    policy: null,
    loading: false,
    reload: vi.fn(),
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe("InvoiceDocumentWorkspace", () => {
  const mockInvoice: any = { id: "inv-123", invoiceNo: "0001234" };
  const v2 = (over: Record<string, unknown>) => ({
    id: "f",
    category: "HOA_DON",
    isOriginal: false,
    fileName: "f.pdf",
    fileSize: 1024,
    mimeType: "application/pdf",
    origin: "V2",
    createdAt: "2026-10-19T00:00:00Z",
    ...over,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFiles.current = [
      v2({ id: "a", fileName: "inv-123.pdf", isOriginal: true }),
      v2({ id: "b", fileName: "contract.pdf", category: "HOP_DONG" }),
    ];
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
    mockFiles.current = [];
    const emptyInvoice: any = { id: "inv-empty", invoiceNo: "0009999" };

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

  it("hiện 1 tệp với nhãn PDF gốc và dung lượng", () => {
    mockFiles.current = [
      v2({
        id: "m",
        fileName: "2026-10-02_C26MHD_65114302.pdf",
        isOriginal: true,
        fileSize: 280145,
      }),
    ];
    render(
      <InvoiceDocumentWorkspace
        detailInvoice={{ id: "inv-x", invoiceNo: "5" } as any}
        editMode={false}
      />,
    );
    expect(screen.getByText("1 tệp")).toBeInTheDocument();
    expect(screen.getByText("PDF gốc")).toBeInTheDocument();
    expect(screen.getByText("• 274 KB")).toBeInTheDocument();
  });
});
