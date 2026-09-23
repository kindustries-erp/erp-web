import React from "react";
import { render, screen } from "@testing-library/react";
import { ErpInvoiceAttachmentsSubTab } from "../ErpInvoiceAttachmentsSubTab";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal?: string) => defaultVal || key,
  }),
}));

vi.mock("../ErpInvoicePdfUpload", () => ({
  ErpInvoicePdfUpload: (props: any) => (
    <div
      data-testid="erp-invoice-pdf-upload"
      data-props={JSON.stringify(props)}
    >
      PDF Upload Component ({props.invoiceId})
    </div>
  ),
}));

describe("ErpInvoiceAttachmentsSubTab", () => {
  it("renders empty message when invoice is null or has no id", () => {
    render(<ErpInvoiceAttachmentsSubTab invoice={null} />);
    expect(
      screen.getByText(
        "Chưa có thông tin hóa đơn để quản lý tài liệu đính kèm.",
      ),
    ).toBeInTheDocument();
  });

  it("renders DrawerSection and ErpInvoicePdfUpload with correct invoice id and badge count", () => {
    const mockInvoice: any = {
      id: "inv-uuid-123",
      invoiceNo: "0001234",
      attachments: [{ attachmentId: "att-1", attachment: { id: "att-1" } }],
      pdfFileKey: "invoices/inv-123.pdf",
    };

    render(
      <ErpInvoiceAttachmentsSubTab
        invoice={mockInvoice}
        editMode={true}
        form={{ pendingDeletedPdfs: [], pendingAddedAttachments: [] } as any}
      />,
    );

    expect(screen.getByText("Tài liệu đính kèm & Tệp PDF")).toBeInTheDocument();
    expect(screen.getByText("(2 tệp)")).toBeInTheDocument();

    const uploadComp = screen.getByTestId("erp-invoice-pdf-upload");
    expect(uploadComp).toBeInTheDocument();
    expect(uploadComp).toHaveTextContent("PDF Upload Component (inv-uuid-123)");
  });
});
