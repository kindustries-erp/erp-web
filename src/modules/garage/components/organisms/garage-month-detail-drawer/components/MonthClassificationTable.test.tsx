import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MonthClassificationTable } from "./MonthClassificationTable";
import type { MonthClassificationRow } from "./MonthClassificationTable.type";

vi.mock("@/shared/hooks/useTableColumnState", () => ({
  useTableColumnState: () => ({}),
}));

vi.mock("@/shared/components/DataTable", () => {
  const createHeaderFilter = () => {
    const filter = (_key: string, label: string) => label;
    filter.amount = (_key: string, label: string) => label;
    filter.numeric = (_key: string, label: string) => label;
    return filter;
  };

  return {
    createColumnHeaderFilter: createHeaderFilter,
    filterClientItems: (items: unknown[]) => items,
    DataTable: ({
      columns,
      containerClassName,
    }: {
      columns: Array<{ key: string }>;
      containerClassName?: string;
    }) => (
      <div data-testid="column-keys" data-container-class={containerClassName}>
        {columns.map((column) => (
          <span key={column.key}>{column.key}</span>
        ))}
      </div>
    ),
  };
});

const baseRow: MonthClassificationRow = {
  key: "SUA_CHUA_CHUNG",
  name: "Sửa chữa chung",
  icon: null,
  caseCount: 2,
  billed: 100,
  paid: 40,
  remaining: 60,
  remainingWithInvoice: 20,
  remainingNoInvoice: 40,
  rate: 40,
  shareRate: 100,
};

describe("MonthClassificationTable data contract", () => {
  it("keeps receivable and payable rows independent", () => {
    const receivableRows: MonthClassificationRow[] = [baseRow];
    const payableRows = receivableRows.map((row) => ({
      ...row,
      billed: 80,
      paid: 30,
      remaining: 50,
    }));

    expect(receivableRows[0].remaining).toBe(60);
    expect(payableRows[0].remaining).toBe(50);
  });

  it("keeps invoice breakdown columns for receivables", () => {
    render(
      <MonthClassificationTable
        rows={[baseRow]}
        debtType="receivables"
        totalBilled={100}
        tableId="receivables-test"
        onSelectClassification={vi.fn()}
      />,
    );

    expect(screen.getByText("remaining")).toBeInTheDocument();
    expect(screen.getByText("caseCount")).toBeInTheDocument();
    expect(screen.getByText("remainingWithInvoice")).toBeInTheDocument();
    expect(screen.getByText("remainingNoInvoice")).toBeInTheDocument();
  });

  it("removes invoice breakdown columns from payables", () => {
    render(
      <MonthClassificationTable
        rows={[baseRow]}
        debtType="payables"
        totalBilled={100}
        tableId="payables-test"
        onSelectClassification={vi.fn()}
      />,
    );

    expect(screen.getByText("remaining")).toBeInTheDocument();
    expect(screen.getByText("caseCount")).toBeInTheDocument();
    expect(screen.queryByText("remainingWithInvoice")).not.toBeInTheDocument();
    expect(screen.queryByText("remainingNoInvoice")).not.toBeInTheDocument();
  });

  it("puts case count after the business type and scopes the container scroll contract", () => {
    render(
      <MonthClassificationTable
        rows={[baseRow]}
        debtType="payables"
        totalBilled={100}
        tableId="payables-header-test"
        onSelectClassification={vi.fn()}
      />,
    );

    expect(screen.getByTestId("column-keys").textContent).toBe(
      "indexnamecaseCountbilledpaidremainingshareRate",
    );
    expect(screen.getByTestId("column-keys")).toHaveAttribute(
      "data-container-class",
      expect.stringContaining("max-h-[360px]"),
    );
  });

  it("ensures remaining === remainingWithInvoice + remainingNoInvoice for all rows", () => {
    // Kiểm tra tính nhất quán số học
    expect(baseRow.remaining).toBe(
      baseRow.remainingWithInvoice + baseRow.remainingNoInvoice,
    );
  });
});
