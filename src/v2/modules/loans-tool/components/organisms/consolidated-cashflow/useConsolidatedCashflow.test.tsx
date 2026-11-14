import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useConsolidatedCashflow } from "./useConsolidatedCashflow";

const queryState: { data: unknown; isLoading: boolean } = {
  data: undefined,
  isLoading: false,
};

vi.mock("../../../api", () => ({
  useCashflowProjectionQuery: () => queryState,
}));

function makeProjection(loanIds: { id: string; name: string }[]) {
  return {
    monthlyProjections: [
      {
        month: "2026-12",
        principalDue: 100,
        interestDue: 10,
        totalPaymentDue: 110,
        cumulativeRemainingPrincipal: 1000,
        activeLoanCount: loanIds.length,
        breakdown: loanIds.map((l) => ({
          loanId: l.id,
          loanName: l.name,
          dueDate: "2026-12-10",
          principalDue: 100,
          interestDue: 10,
          totalPayment: 110,
          endingBalance: 1000,
          isPaid: false,
        })),
      },
    ],
    totalPrincipalDue: 100,
    totalInterestDue: 10,
    totalObligationDue: 110,
  };
}

describe("useConsolidatedCashflow", () => {
  beforeEach(() => {
    queryState.data = undefined;
    queryState.isLoading = false;
  });

  it("khoản vay mới được bật sau refetch, khoản đã tắt vẫn tắt", () => {
    queryState.data = makeProjection([
      { id: "loan-a", name: "Khoản A" },
      { id: "loan-c", name: "Khoản C" },
    ]);

    const { result, rerender } = renderHook(() => useConsolidatedCashflow());
    expect(result.current.enabledLoanIds.size).toBe(2);

    // Người dùng tắt khoản A (còn khoản C đang bật)
    act(() => {
      result.current.handleToggleLoan("loan-a");
    });
    expect(result.current.enabledLoanIds.has("loan-a")).toBe(false);

    // Tạo khoản B rồi projection refetch
    queryState.data = makeProjection([
      { id: "loan-a", name: "Khoản A" },
      { id: "loan-b", name: "Khoản B" },
      { id: "loan-c", name: "Khoản C" },
    ]);
    rerender();

    expect(result.current.enabledLoanIds.has("loan-b")).toBe(true);
    expect(result.current.enabledLoanIds.has("loan-c")).toBe(true);
    expect(result.current.enabledLoanIds.has("loan-a")).toBe(false);
    expect(result.current.projections[0].activeLoanCount).toBe(2);
  });
});
