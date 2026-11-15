import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmortizationMethod, LoanStatus, type LoanItem } from "@/v2/core/loans";
import { loansApi } from "../../api/loansApi";
import { LoanFormDrawer } from "./LoanFormDrawer";

vi.mock("../../api/loansApi", async () => {
  const actual =
    await vi.importActual<typeof import("../../api/loansApi")>(
      "../../api/loansApi",
    );
  return {
    ...actual,
    loansApi: {
      ...actual.loansApi,
      update: vi.fn(),
      create: vi.fn(),
    },
  };
});

const mockRecord: LoanItem = {
  id: "loan-1",
  loanCode: "LOAN-001",
  title: "Vay cũ",
  lenderName: "VCB",
  principalAmount: 100_000_000,
  annualInterestRate: 10.5,
  tenorMonths: 12,
  amortizationMethod: AmortizationMethod.AMORTIZED,
  startDate: "2026-09-01",
  firstPaymentDate: "2026-09-01",
  totalPaidPrincipal: 0,
  totalPaidInterest: 0,
  remainingPrincipal: 100_000_000,
  status: LoanStatus.ACTIVE,
  notes: "",
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
};

describe("LoanFormDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
  });

  it("hiển thị Ngày giải ngân đầu tiên và Lãi suất + Thời hạn cùng một hàng", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <LoanFormDrawer open onClose={vi.fn()} record={mockRecord} />
      </QueryClientProvider>,
    );

    const startDateLabel = screen.getByText(/Ngày giải ngân/i);
    const principalLabel = screen.getByText(/Số tiền vay/i);
    const rateLabel = screen.getByText(/Lãi suất \(% \/ năm\)/i);
    const tenorLabel = screen.getByText(/Thời hạn \(tháng\)/i);

    expect(
      startDateLabel.compareDocumentPosition(principalLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(rateLabel.closest(".grid")).toBe(tenorLabel.closest(".grid"));
    expect(rateLabel.closest(".grid")?.className).toContain("sm:grid-cols-2");
  });

  it("gửi đầy đủ thông tin cập nhật lên API khi bấm Lưu", async () => {
    vi.mocked(loansApi.update).mockResolvedValue({
      ...mockRecord,
      title: "Vay mới",
      annualInterestRate: 8.5,
    });

    const qc = new QueryClient();
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <QueryClientProvider client={qc}>
        <LoanFormDrawer
          open
          onClose={onClose}
          onSuccess={onSuccess}
          record={mockRecord}
        />
      </QueryClientProvider>,
    );

    const titleInput = screen.getByDisplayValue("Vay cũ");
    fireEvent.change(titleInput, { target: { value: "Vay mới" } });

    const saveBtn = screen.getByRole("button", { name: /^Lưu$/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(loansApi.update).toHaveBeenCalledWith(
        "loan-1",
        expect.objectContaining({
          title: "Vay mới",
          lenderName: "VCB",
          principalAmount: 100_000_000,
          annualInterestRate: 10.5,
          tenorMonths: 12,
          startDate: "2026-09-01",
        }),
      );
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
