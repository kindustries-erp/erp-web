import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listTransactions } = vi.hoisted(() => ({ listTransactions: vi.fn() }));
vi.mock("../../../api/cashTransactionApi", () => ({
  cashTransactionApi: { listTransactions },
}));

import "../../../bankStatements.locale";
import { CashPartnerTransactions } from "./CashPartnerTransactions";

const ROWS = [
  {
    id: "t9",
    referenceNumber: "REF-9",
    transDate: "2026-10-05",
    creditAmount: 300,
    debitAmount: 0,
    netOffAmount: 0,
    sourceType: "CASH",
    cashBook: { name: "Quỹ ĐT" },
    description: "Thu",
  },
];

const renderTable = (onSelect = vi.fn()) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <CashPartnerTransactions
        correspondentName="ACME"
        onSelectTransaction={onSelect}
      />
    </QueryClientProvider>,
  );

describe("CashPartnerTransactions", () => {
  beforeEach(() => {
    listTransactions.mockReset();
    listTransactions.mockResolvedValue({ items: ROWS, total: 1 });
  });

  it("tải theo đối tượng và hiện dòng giao dịch", async () => {
    renderTable();
    expect(await screen.findByText("REF-9")).toBeTruthy();
    expect(listTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        correspondentName: "ACME",
        sortBy: "transDate",
        sortOrder: "DESC",
      }),
    );
  });

  it("bấm số tham chiếu mở giao dịch đó", async () => {
    const onSelect = vi.fn();
    renderTable(onSelect);
    fireEvent.click(await screen.findByText("REF-9"));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("t9"));
  });
});
