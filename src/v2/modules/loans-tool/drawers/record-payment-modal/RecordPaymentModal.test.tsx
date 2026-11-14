import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  LoanItem,
  LoanPaymentRecord,
  LoanSchedulePeriod,
} from "@/v2/core/loans";
import { RecordPaymentModal } from "./RecordPaymentModal";

const detailMock = vi.fn();
vi.mock("../../api", () => ({
  useLoanDetailQuery: (...args: unknown[]) => detailMock(...args),
  useRecordPaymentMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdatePaymentMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const schedule: LoanSchedulePeriod[] = [1, 2, 3].map((n) => ({
  periodNumber: n,
  dueDate: `2026-0${n}-15`,
  beginningBalance: 50_000_000,
  principalDue: 10_000_000,
  interestDue: 500_000,
  totalPaymentDue: 10_500_000,
  endingBalance: 40_000_000,
}));

const payment = (periodNumber: number): LoanPaymentRecord => ({
  id: `pay-${periodNumber}`,
  loanId: "loan-123",
  periodNumber,
  paymentDate: `2026-0${periodNumber}-15`,
  principalPaid: 10_000_000,
  interestPaid: 500_000,
  totalPaid: 10_500_000,
  paymentRef: null,
  createdAt: "2026-01-01T00:00:00Z",
});

const renderModal = (
  props: Partial<React.ComponentProps<typeof RecordPaymentModal>> = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RecordPaymentModal
        open={true}
        onClose={vi.fn()}
        loanId="loan-123"
        loanTitle="Khoản vay kinh doanh"
        loanCode="LOAN-123"
        remainingPrincipal={50_000_000}
        schedule={schedule}
        {...props}
      />
    </QueryClientProvider>,
  );
};

describe("RecordPaymentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    detailMock.mockReturnValue({ data: undefined, isLoading: false });
  });

  it("renders modal with loan title, code, and remaining principal", () => {
    renderModal();

    expect(screen.getByText(/Ghi Nhận Thanh Toán Khoản Vay/i)).toBeDefined();
    expect(screen.getByText(/LOAN-123 — Khoản vay kinh doanh/i)).toBeDefined();
    expect(screen.getByText(/50.000.000/i)).toBeDefined();
  });

  it("mở từ danh sách (không có payments): tự tải chi tiết và gợi ý kỳ chưa trả", () => {
    const loanWithPayments = {
      id: "loan-123",
      principalAmount: 50_000_000,
      annualInterestRate: 12,
      tenorMonths: 3,
      amortizationMethod: "EQUAL_PRINCIPAL",
      startDate: "2026-01-01",
      firstPaymentDate: "2026-01-15",
      remainingPrincipal: 40_000_000,
      payments: [payment(1)],
    } as unknown as LoanItem;
    detailMock.mockReturnValue({ data: loanWithPayments, isLoading: false });

    renderModal({ schedule: undefined, loan: undefined });

    expect(detailMock).toHaveBeenCalledWith("loan-123");
    // Ô kỳ hiển thị kỳ 2 (kỳ 1 đã trả), không còn mặc định Kỳ 1
    expect(screen.getByRole("combobox")).toHaveTextContent("Kỳ 2");
    expect(screen.getByText("Dự kiến kỳ này (Kỳ 2)")).toBeDefined();
  });

  it("đang tải chi tiết (mở từ danh sách): khóa dropdown kỳ để không chọn kỳ đã trả", () => {
    detailMock.mockReturnValue({ data: undefined, isLoading: true });

    renderModal({ schedule: undefined, loan: undefined });

    const combo = screen.getByRole("combobox");
    expect(
      combo.hasAttribute("disabled") ||
        combo.getAttribute("aria-disabled") === "true",
    ).toBe(true);
  });

  it("đã trả đủ mọi kỳ: hiện thông báo và khóa nút xác nhận", () => {
    const allPaid = {
      id: "loan-123",
      principalAmount: 50_000_000,
      annualInterestRate: 12,
      tenorMonths: 3,
      amortizationMethod: "EQUAL_PRINCIPAL",
      startDate: "2026-01-01",
      firstPaymentDate: "2026-01-15",
      remainingPrincipal: 0,
      payments: [payment(1), payment(2), payment(3)],
    } as unknown as LoanItem;
    detailMock.mockReturnValue({ data: allPaid, isLoading: false });

    renderModal({ schedule: undefined, loan: undefined });

    expect(screen.getByText("Đã thanh toán đủ các kỳ")).toBeDefined();
    expect(
      (
        screen.getByRole("button", {
          name: "Xác nhận thanh toán",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
