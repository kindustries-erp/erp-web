import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MonthClassificationTable } from "./MonthClassificationTable";
import type { MonthClassificationRow } from "./MonthClassificationTable.type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
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

const renderComponent = (
  props: React.ComponentProps<typeof MonthClassificationTable>,
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MonthClassificationTable {...props} />
    </QueryClientProvider>,
  );

describe("MonthClassificationTable", () => {
  it("hiển thị dữ liệu phân loại và số thứ tự bắt đầu từ 1", () => {
    renderComponent({
      rows: [baseRow],
      debtType: "receivables",
      totalBilled: 100,
      tableId: "receivables-test",
      onSelectClassification: vi.fn(),
    });

    expect(screen.getByText("Sửa chữa chung")).toBeInTheDocument();
    const cellOnes = screen.getAllByText("1");
    expect(cellOnes.length).toBeGreaterThan(0);
  });

  it("giữ các cột hóa đơn đối với nợ phải thu (receivables)", () => {
    renderComponent({
      rows: [baseRow],
      debtType: "receivables",
      totalBilled: 100,
      tableId: "receivables-test",
      onSelectClassification: vi.fn(),
    });

    expect(screen.getByText("Còn phải thu có HĐ")).toBeInTheDocument();
    expect(screen.getByText("Còn phải thu không HĐ")).toBeInTheDocument();
  });

  it("không hiển thị các cột hóa đơn đối với nợ phải trả (payables)", () => {
    renderComponent({
      rows: [baseRow],
      debtType: "payables",
      totalBilled: 100,
      tableId: "payables-test",
      onSelectClassification: vi.fn(),
    });

    expect(screen.queryByText("Còn phải thu có HĐ")).not.toBeInTheDocument();
    expect(screen.queryByText("Còn phải thu không HĐ")).not.toBeInTheDocument();
  });
});
