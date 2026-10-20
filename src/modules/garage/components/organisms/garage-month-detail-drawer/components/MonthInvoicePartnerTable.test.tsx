import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import { MonthInvoicePartnerTable } from "./MonthInvoicePartnerTable";

vi.mock("@/shared/hooks/useTableColumnState", () => ({
  useTableColumnState: () => ({
    sorts: [],
    columnFilters: {},
    columnSearch: {},
  }),
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
      items,
      page,
      pageSize,
      total,
      totalPages,
      onPage,
      onPageSize,
      summaryRow,
      containerClassName,
    }: any) => (
      <div>
        <div
          data-testid="partner-table-container"
          data-class={containerClassName}
        />
        <div data-testid="partner-row-count">{items.length}</div>
        <div data-testid="partner-pagination">
          {page}/{totalPages} ({pageSize}) {total}
        </div>
        <button type="button" onClick={() => onPage(2)}>
          next
        </button>
        <button type="button" onClick={() => onPageSize(10)}>
          size-10
        </button>
        <div data-testid="partner-summary">{summaryRow?.partner}</div>
      </div>
    ),
  };
});

function makeItem(index: number): MonthlyReceivablesGroupItem {
  return {
    key: `partner-${index}`,
    payerType: "KH",
    title: `Partner ${index}`,
    buyerName: `Partner ${index}`,
    hasInvoice: false,
    invoiceNos: [],
    hasVat: false,
    vatAmount: 0,
    vatWarning: false,
    caseCount: 1,
    billed: 100,
    paid: 50,
    remaining: 50,
    rate: 50,
    shareRate: 10,
    cases: [
      {
        id: `case-${index}`,
        soChungTu: `GR-PDV2610-00${index}`,
        bienSoXe: `51K-${index}`,
        khachHangName: `Customer ${index}`,
        amount: 100,
        paid: 50,
        remaining: 50,
        vatAmount: 0,
        vatWarning: false,
      },
    ],
  };
}

describe("MonthInvoicePartnerTable pagination", () => {
  it("starts at five rows and paginates the filtered client-side collection", () => {
    render(
      <MonthInvoicePartnerTable
        items={Array.from({ length: 12 }, (_, index) => makeItem(index))}
        tableId="partner-pagination-test"
        totalBilled={1200}
        onSelectGroup={vi.fn()}
      />,
    );

    expect(screen.getByTestId("partner-row-count")).toHaveTextContent("5");
    expect(screen.getByTestId("partner-pagination")).toHaveTextContent(
      "1/3 (5) 12",
    );
    expect(screen.getByTestId("partner-summary")).toHaveTextContent(
      "TỔNG CỘNG (12 phiếu • 12 xe)",
    );
    expect(screen.getByTestId("partner-table-container")).toHaveAttribute(
      "data-class",
      expect.stringContaining("max-h-[360px]"),
    );

    fireEvent.click(screen.getByRole("button", { name: "next" }));
    expect(screen.getByTestId("partner-pagination")).toHaveTextContent(
      "2/3 (5) 12",
    );

    fireEvent.click(screen.getByRole("button", { name: "size-10" }));
    expect(screen.getByTestId("partner-row-count")).toHaveTextContent("10");
    expect(screen.getByTestId("partner-pagination")).toHaveTextContent(
      "1/2 (10) 12",
    );
  });
});
