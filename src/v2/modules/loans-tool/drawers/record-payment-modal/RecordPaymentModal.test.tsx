import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecordPaymentModal } from "./RecordPaymentModal";

describe("RecordPaymentModal", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders modal with loan title, code, and remaining principal", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RecordPaymentModal
          open={true}
          onClose={vi.fn()}
          loanId="loan-123"
          loanTitle="Khoản vay kinh doanh"
          loanCode="LOAN-123"
          remainingPrincipal={50_000_000}
          schedule={[
            {
              periodNumber: 1,
              dueDate: "2026-11-15",
              beginningBalance: 50_000_000,
              principalDue: 10_000_000,
              interestDue: 500_000,
              totalPaymentDue: 10_500_000,
              endingBalance: 40_000_000,
            },
          ]}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Ghi Nhận Thanh Toán Khoản Vay/i)).toBeDefined();
    expect(screen.getByText(/LOAN-123 — Khoản vay kinh doanh/i)).toBeDefined();
    expect(screen.getByText(/50.000.000/i)).toBeDefined();
  });
});
