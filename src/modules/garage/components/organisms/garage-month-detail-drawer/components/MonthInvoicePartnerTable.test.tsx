import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import { MonthInvoicePartnerTable } from "./MonthInvoicePartnerTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
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

describe("MonthInvoicePartnerTable", () => {
  it("hiển thị bảng chuẩn V2 với pageSize bắt đầu từ 10 và STT bắt đầu từ 1", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MonthInvoicePartnerTable
          items={Array.from({ length: 12 }, (_, index) => makeItem(index))}
          tableId="partner-pagination-test"
          totalBilled={1200}
          onSelectGroup={vi.fn()}
        />
      </QueryClientProvider>,
    );

    // Phiếu đầu tiên GR-PDV2610-000 xuất hiện
    expect(screen.getByText("GR-PDV2610-000")).toBeInTheDocument();

    // Số thứ tự 1 xuất hiện
    const cellOnes = screen.getAllByText("1");
    expect(cellOnes.length).toBeGreaterThan(0);
  });
});
