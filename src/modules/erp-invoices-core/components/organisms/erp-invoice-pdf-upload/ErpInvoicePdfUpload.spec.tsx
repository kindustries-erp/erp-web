import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { ErpInvoicePdfUpload } from "./ErpInvoicePdfUpload";

const files = [
  { id: "f-main", fileName: "main-pdf.pdf", category: "HOA_DON" },
  { id: "f-sub", fileName: "sub-pdf.pdf", category: "BANG_KE" },
];

vi.mock("@/modules/erp-invoices-core/hooks/useInvoiceFilesV2", () => ({
  useInvoiceFilesV2: () => ({ files, policy: null, loading: false }),
}));

vi.mock("@/modules/erp-invoices-core/api/invoiceFilesV2Api", () => ({
  invoiceFilesV2Api: { downloadUrl: vi.fn(), downloadZip: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));

describe("ErpInvoicePdfUpload (V2)", () => {
  const defaultProps = {
    invoiceId: "inv-1",
    editMode: false,
    pendingDeletedPdfs: [],
    pendingAddedAttachments: [],
  };

  it("hiển thị file đọc từ API V2", () => {
    render(<ErpInvoicePdfUpload {...defaultProps} />);
    expect(screen.getByText("main-pdf.pdf")).toBeInTheDocument();
    expect(screen.getByText("sub-pdf.pdf")).toBeInTheDocument();
  });

  it("ẩn file nằm trong pendingDeletedPdfs (theo id V2)", () => {
    render(
      <ErpInvoicePdfUpload {...defaultProps} pendingDeletedPdfs={["f-main"]} />,
    );
    expect(screen.queryByText("main-pdf.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("sub-pdf.pdf")).toBeInTheDocument();
  });

  it("không có nút xóa khi không ở chế độ sửa", () => {
    render(<ErpInvoicePdfUpload {...defaultProps} editMode={false} />);
    expect(screen.queryByTitle("Xóa đính kèm")).not.toBeInTheDocument();
  });

  it("noCard không render tiêu đề DrawerSection", () => {
    render(<ErpInvoicePdfUpload {...defaultProps} noCard={true} />);
    expect(screen.getByText("main-pdf.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Tài liệu đính kèm")).not.toBeInTheDocument();
  });
});
