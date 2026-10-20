import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoiceExportColumnSelector } from "./InvoiceExportColumnSelector";
import { ALL_INVOICE_EXPORT_COLUMNS } from "../InvoiceExportDrawer.helper";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));

describe("InvoiceExportColumnSelector", () => {
  const defaultSelected = ["invoiceDate", "invoiceNo", "partnerName"];

  it("renders section title with concise count pattern (3/22)", () => {
    render(
      <InvoiceExportColumnSelector
        selectedColumns={defaultSelected}
        onChange={vi.fn()}
        onResetDefault={vi.fn()}
      />,
    );

    expect(screen.getByText("Cột xuất dữ liệu")).toBeInTheDocument();
    expect(
      screen.getByText(`(3/${ALL_INVOICE_EXPORT_COLUMNS.length})`),
    ).toBeInTheDocument();
  });

  it("renders action buttons in titleExtra and fires handlers", () => {
    const handleChange = vi.fn();
    const handleResetDefault = vi.fn();

    render(
      <InvoiceExportColumnSelector
        selectedColumns={defaultSelected}
        onChange={handleChange}
        onResetDefault={handleResetDefault}
      />,
    );

    // Click "Chọn tất cả"
    fireEvent.click(screen.getByText("Chọn tất cả"));
    expect(handleChange).toHaveBeenCalledWith(
      ALL_INVOICE_EXPORT_COLUMNS.map((c) => c.key),
    );

    // Click "Bỏ chọn"
    fireEvent.click(screen.getByText("Bỏ chọn"));
    expect(handleChange).toHaveBeenCalledWith([]);

    // Click "Mặc định"
    fireEvent.click(screen.getByText("Mặc định"));
    expect(handleResetDefault).toHaveBeenCalledTimes(1);
  });

  it("toggles single column checkbox correctly", () => {
    const handleChange = vi.fn();

    render(
      <InvoiceExportColumnSelector
        selectedColumns={["invoiceDate"]}
        onChange={handleChange}
        onResetDefault={vi.fn()}
      />,
    );

    // Toggle invoiceDate off
    const invoiceDateCheckbox = screen.getByLabelText("Ngày phát hành");
    fireEvent.click(invoiceDateCheckbox);
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
