// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import {
  renderInvoiceNoCell,
  renderInvoiceSerialCell,
  renderInvoiceDateCell,
} from "../components/BankStatementCellRenderers";

const t = (_key: string, opts?: any) => opts?.defaultValue ?? _key;

const row = {
  invoiceNetOffs: [
    {
      invoice: {
        invoiceNo: "0000123",
        serialNo: "1C26TAA",
        invoiceDate: "2026-02-09",
      },
    },
    {
      invoice: {
        invoiceNo: "0000456",
        serialNo: "1C26TAA",
        invoiceDate: "2026-02-09",
      },
    },
    {
      invoice: {
        invoiceNo: "0000123",
        serialNo: "1C26TAA",
        invoiceDate: "2026-02-09",
      },
    },
  ],
};

const renderCell = (node: unknown) =>
  render(<TooltipProvider>{node as any}</TooltipProvider>);

describe("BankStatement invoice cells", () => {
  it("lists distinct invoice numbers joined by comma", () => {
    renderCell(renderInvoiceNoCell(row, t));
    expect(screen.getByText("0000123, 0000456")).toBeTruthy();
  });

  it("lists distinct serial numbers", () => {
    renderCell(renderInvoiceSerialCell(row, t));
    expect(screen.getByText("1C26TAA")).toBeTruthy();
  });

  it("formats invoice date as dd/mm/yyyy", () => {
    renderCell(renderInvoiceDateCell(row, t));
    expect(screen.getByText("09/02/2026")).toBeTruthy();
  });

  it("renders nothing when the row has no linked invoice", () => {
    const { container } = renderCell(renderInvoiceNoCell({}, t));
    expect(container.textContent).toBe("");
  });
});
