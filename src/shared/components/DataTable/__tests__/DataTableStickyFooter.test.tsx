// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable, type DataTableColumn } from "../index";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

interface TestRow {
  id: string;
  name: string;
  amount: number;
}

describe("DataTable Sticky Bottom Footer Suite", () => {
  const mockItems: TestRow[] = [
    { id: "1", name: "Dịch vụ A", amount: 1500000 },
  ];

  const columns: DataTableColumn<TestRow>[] = [
    {
      key: "name",
      header: "Tên dịch vụ",
      cell: (item) => <span>{item.name}</span>,
    },
    {
      key: "amount",
      header: "Thành tiền",
      cell: (item) => <span>{item.amount.toLocaleString()}</span>,
    },
  ];

  it("renders TableFooter with sticky bottom-0 class and summaryRow content", () => {
    const { container } = render(
      <DataTable
        items={mockItems}
        columns={columns}
        emptyLabel="Không có dữ liệu"
        getRowKey={(r) => r.id}
        summaryRow={{
          name: <strong>Tổng</strong>,
          amount: <span>1.500.000</span>,
        }}
      />,
    );

    const footer = container.querySelector("tfoot");
    expect(footer).toBeInTheDocument();
    expect(footer?.className).toContain("sticky");
    expect(footer?.className).toContain("bottom-0");

    expect(screen.getByText("Tổng")).toBeInTheDocument();
    expect(screen.getByText("1.500.000")).toBeInTheDocument();
  });

  it("renders expanding spacer row in tbody when summaryRow is present to push footer to bottom", () => {
    const { container } = render(
      <DataTable
        items={mockItems}
        columns={columns}
        emptyLabel="Không có dữ liệu"
        getRowKey={(r) => r.id}
        summaryRow={{
          name: "Tổng",
          amount: "1.500.000",
        }}
      />,
    );

    const tbody = container.querySelector("tbody");
    expect(tbody).toBeInTheDocument();

    const spacerRow = tbody?.querySelector('tr[aria-hidden="true"]');
    expect(spacerRow).toBeInTheDocument();
    expect(spacerRow?.className).toContain("h-full");
  });

  it("applies min-h-full to table element", () => {
    const { container } = render(
      <DataTable
        items={mockItems}
        columns={columns}
        emptyLabel="Không có dữ liệu"
        getRowKey={(r) => r.id}
        summaryRow={{
          name: "Tổng",
        }}
      />,
    );

    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
    expect(table?.className).toContain("min-h-full");
  });
});
