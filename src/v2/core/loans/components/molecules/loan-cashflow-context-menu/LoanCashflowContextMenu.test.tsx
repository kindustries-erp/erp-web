import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoanCashflowContextMenu } from "./LoanCashflowContextMenu";

describe("LoanCashflowContextMenu", () => {
  const mockPeriod = {
    monthKey: "2026-11",
    principalDue: 10000000,
    interestDue: 2000000,
    remainingPrincipal: 90000000,
    breakdown: [
      {
        loanId: "l1",
        loanName: "Vay Vietcombank",
        principalDue: 10000000,
        interestDue: 2000000,
        totalPayment: 12000000,
        dueDate: "2026-11-15",
        isPaid: false,
      },
    ],
  };

  it("không render gì khi open = false hoặc period = null", () => {
    const { container } = render(
      <LoanCashflowContextMenu
        open={false}
        period={mockPeriod}
        position={{ x: 100, y: 100 }}
        onClose={vi.fn()}
        onRecordPayment={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("render đúng thông tin khoản vay khi open = true", () => {
    render(
      <LoanCashflowContextMenu
        open={true}
        period={mockPeriod}
        position={{ x: 100, y: 100 }}
        onClose={vi.fn()}
        onRecordPayment={vi.fn()}
      />,
    );

    expect(screen.getByText("2026-11")).toBeInTheDocument();
    expect(screen.getByText("Vay Vietcombank")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Thanh toán/i }),
    ).toBeInTheDocument();
  });

  it("gọi onRecordPayment và onClose khi bấm nút Thanh toán", () => {
    const onRecordPayment = vi.fn();
    const onClose = vi.fn();

    render(
      <LoanCashflowContextMenu
        open={true}
        period={mockPeriod}
        position={{ x: 100, y: 100 }}
        onClose={onClose}
        onRecordPayment={onRecordPayment}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Thanh toán/i }));

    expect(onRecordPayment).toHaveBeenCalledWith(
      "l1",
      "Vay Vietcombank",
      undefined,
      "2026-11-15",
      10000000,
      2000000,
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("khóa nút Thanh toán khi khoản vay đã thanh toán (isPaid = true)", () => {
    const paidPeriod = {
      ...mockPeriod,
      breakdown: [
        {
          ...mockPeriod.breakdown[0],
          isPaid: true,
        },
      ],
    };

    render(
      <LoanCashflowContextMenu
        open={true}
        period={paidPeriod}
        position={{ x: 100, y: 100 }}
        onClose={vi.fn()}
        onRecordPayment={vi.fn()}
      />,
    );

    const payButton = screen.getByRole("button", { name: /Thanh toán/i });
    expect(payButton).toBeDisabled();
  });

  it("gọi onClose khi bấm nút đóng (X)", () => {
    const onClose = vi.fn();
    render(
      <LoanCashflowContextMenu
        open={true}
        period={mockPeriod}
        position={{ x: 100, y: 100 }}
        onClose={onClose}
        onRecordPayment={vi.fn()}
      />,
    );

    const closeBtn = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
