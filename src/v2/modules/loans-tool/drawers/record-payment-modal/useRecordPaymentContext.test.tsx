import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type {
  LoanItem,
  LoanPaymentRecord,
  LoanSchedulePeriod,
} from "@/v2/core/loans";
import { useRecordPaymentContext } from "./useRecordPaymentContext";

const detailMock = vi.fn();
vi.mock("../../api", () => ({
  useLoanDetailQuery: (...args: unknown[]) => detailMock(...args),
}));

const payment = (periodNumber: number): LoanPaymentRecord => ({
  id: `pay-${periodNumber}`,
  loanId: "loan-1",
  periodNumber,
  paymentDate: "2026-01-05",
  principalPaid: 100_000_000,
  interestPaid: 1_000_000,
  totalPaid: 101_000_000,
  paymentRef: null,
  createdAt: "2026-01-05T00:00:00Z",
});

const loan = {
  id: "loan-1",
  principalAmount: 300_000_000,
  annualInterestRate: 12,
  tenorMonths: 3,
  amortizationMethod: "EQUAL_PRINCIPAL",
  startDate: "2026-01-01",
  firstPaymentDate: "2026-02-01",
  remainingPrincipal: 200_000_000,
  payments: [payment(1)],
} as unknown as LoanItem;

const schedule: LoanSchedulePeriod[] = [1, 2, 3].map((n) => ({
  periodNumber: n,
  dueDate: `2026-0${n + 1}-01`,
  beginningBalance: 300_000_000,
  principalDue: 100_000_000,
  interestDue: 3_000_000,
  totalPaymentDue: 103_000_000,
  endingBalance: 200_000_000,
}));

const baseProps = {
  open: true,
  onClose: () => {},
  loanId: "loan-1",
  loanTitle: "Khoản vay",
};

describe("useRecordPaymentContext", () => {
  beforeEach(() => {
    detailMock.mockReset();
    detailMock.mockReturnValue({ data: undefined, isLoading: false });
  });

  it("mở từ drawer: dùng payments truyền vào, kỳ gợi ý là kỳ chưa trả đầu tiên", () => {
    const { result } = renderHook(() =>
      useRecordPaymentContext({
        ...baseProps,
        loan,
        payments: [payment(1)],
        schedule,
        suggestedPeriod: 1,
      }),
    );

    expect(detailMock).toHaveBeenCalledWith(null);
    expect(result.current.paidByPeriod.has(1)).toBe(true);
    expect(result.current.initialPeriod).toBe(2);
    expect(result.current.allPeriodsPaid).toBe(false);
  });

  it("mở từ danh sách (không có payments): tự tải chi tiết và chọn kỳ chưa trả", () => {
    detailMock.mockReturnValue({ data: loan, isLoading: false });

    const { result } = renderHook(() =>
      useRecordPaymentContext({
        ...baseProps,
        loan: { ...loan, payments: undefined } as unknown as LoanItem,
        suggestedPeriod: 1,
      }),
    );

    expect(detailMock).toHaveBeenCalledWith("loan-1");
    expect(result.current.paidByPeriod.has(1)).toBe(true);
    expect(result.current.initialPeriod).toBe(2);
  });

  it("đã trả đủ mọi kỳ: báo allPeriodsPaid và không chọn kỳ đã trả", () => {
    const allPaid = {
      ...loan,
      payments: [payment(1), payment(2), payment(3)],
    } as unknown as LoanItem;
    detailMock.mockReturnValue({ data: allPaid, isLoading: false });

    const { result } = renderHook(() =>
      useRecordPaymentContext({
        ...baseProps,
        loan: allPaid,
        suggestedPeriod: 1,
      }),
    );

    expect(result.current.allPeriodsPaid).toBe(true);
    expect(result.current.paidByPeriod.size).toBe(3);
  });

  it("chế độ sửa: kỳ của thanh toán đang sửa không bị coi là đã trả", () => {
    const { result } = renderHook(() =>
      useRecordPaymentContext({
        ...baseProps,
        loan,
        payments: [payment(1)],
        schedule,
        mode: "edit",
        editPayment: payment(1),
      }),
    );

    expect(result.current.paidByPeriod.has(1)).toBe(false);
  });
});
