import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { XmlImportResultTables } from "./XmlImportResultTables";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: unknown) =>
      typeof fallback === "string"
        ? fallback
        : (fallback as { defaultValue: string }).defaultValue,
  }),
}));

const result = {
  importId: "i",
  direction: "IN" as const,
  total: 2,
  created: 1,
  skipped: [],
  errors: [{ filename: "bad.xml", reason: "Sai cấu trúc" }],
  pdfAttached: [
    {
      filename: "a.pdf",
      invoiceNo: "1847",
      invoiceId: "inv-1",
      serialNo: "C26MSP",
      sellerName: "ABC",
      totalAmount: "1000",
    },
  ],
  pdfOrphans: [{ filename: "c.pdf", reason: "Không tìm thấy HĐ" }],
};

describe("XmlImportResultTables", () => {
  it("renders only the sections that have rows", () => {
    render(<XmlImportResultTables result={result} />);

    expect(screen.getByText("Lỗi xử lý")).toBeInTheDocument();
    expect(screen.getByText("Sai cấu trúc")).toBeInTheDocument();
    expect(
      screen.getByText("PDF không ghép được (Orphans)"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Hóa đơn bị bỏ qua (trùng lặp)")).toBeNull();
  });

  it("opens the invoice from the attached-PDF row", () => {
    const onOpenInvoice = vi.fn();
    render(
      <XmlImportResultTables result={result} onOpenInvoice={onOpenInvoice} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /1847/ }));
    expect(onOpenInvoice).toHaveBeenCalledWith("inv-1");
  });
});
