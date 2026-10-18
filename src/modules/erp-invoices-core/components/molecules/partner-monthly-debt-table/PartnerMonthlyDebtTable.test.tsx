import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PartnerMonthlyDebtTable } from "./PartnerMonthlyDebtTable";
import type { MonthlyDebtTableRow } from "./PartnerMonthlyDebtTable.type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

const mockRows: MonthlyDebtTableRow[] = [
  {
    id: "2026-01",
    monthKey: "2026-01",
    monthLabel: "Th01/26",
    invoiceCount: 2,
    totalAmount: 10000000,
    paidAmount: 8000000,
    balanceAmount: 2000000,
    rate: 80,
  },
  {
    id: "2026-02",
    monthKey: "2026-02",
    monthLabel: "Th02/26",
    invoiceCount: 3,
    totalAmount: 15000000,
    paidAmount: 5000000,
    balanceAmount: 10000000,
    rate: 33,
  },
];

describe("PartnerMonthlyDebtTable", () => {
  it("renders table with correct columns and data", () => {
    renderWithClient(
      <PartnerMonthlyDebtTable rows={mockRows} isCustomer={false} />,
    );

    expect(screen.getByText("Th01/26")).toBeInTheDocument();
    expect(screen.getByText("Th02/26")).toBeInTheDocument();
    expect(screen.getAllByText(/10\.000\.000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/8\.000\.000/).length).toBeGreaterThan(0);
  });

  it("renders empty label when rows is empty", () => {
    renderWithClient(<PartnerMonthlyDebtTable rows={[]} isCustomer={false} />);

    expect(
      screen.getByText("Chưa có dữ liệu biến động dòng tiền theo tháng"),
    ).toBeInTheDocument();
  });
});
