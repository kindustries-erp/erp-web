// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionPartnerTab } from "../BankTransactionPartnerTab";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransactions: vi.fn(),
    getColumnOptions: vi.fn().mockResolvedValue([
      { value: "10000000", label: "10000000", count: 1 },
      { value: "5000000", label: "5000000", count: 2 },
    ]),
  },
}));

describe("BankTransactionPartnerTab", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("renders 1-based index STT starting from 1 and not 0", async () => {
    (bankStatementApi.getTransactions as any).mockResolvedValue({
      items: [
        {
          id: "txn-1",
          transDate: "2026-08-01T00:00:00.000Z",
          referenceNumber: "REF-001",
          description: "Thu tien 1",
          creditAmount: 10000000,
          debitAmount: 0,
          netOffAmount: 0,
        },
        {
          id: "txn-2",
          transDate: "2026-08-02T00:00:00.000Z",
          referenceNumber: "REF-002",
          description: "Thu tien 2",
          creditAmount: 5000000,
          debitAmount: 0,
          netOffAmount: 0,
        },
      ],
      total: 2,
      totalPages: 1,
    });

    const mockTransaction = {
      id: "root-1",
      correspondentName: "Đối tác Công ty A",
      correspondentAccount: "123456789",
    };

    render(
      <QueryClientProvider client={queryClient}>
        <BankTransactionPartnerTab transaction={mockTransaction} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Thu tien 1")).toBeTruthy();
      expect(screen.getByText("Thu tien 2")).toBeTruthy();
    });

    const allSpans = Array.from(
      document.querySelectorAll(
        "span.w-full.block.text-center.text-xs.text-muted-foreground",
      ),
    );
    expect(allSpans.length).toBeGreaterThanOrEqual(2);
    expect(allSpans[0].textContent).toBe("1");
    expect(allSpans[1].textContent).toBe("2");
  });
});
