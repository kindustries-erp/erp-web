import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoanCashflowChart } from "./LoanCashflowChart";

describe("LoanCashflowChart", () => {
  it("hiển thị các scheme màu khác nhau theo từng khoản vay khi có nhiều khoản vay", () => {
    const schedule = [
      {
        monthKey: "2026-11",
        principalDue: 30000000,
        interestDue: 5000000,
        remainingPrincipal: 470000000,
        breakdown: [
          {
            loanId: "l1",
            loanName: "Vay Vietcombank",
            principalDue: 10000000,
            interestDue: 2000000,
            totalPayment: 12000000,
          },
          {
            loanId: "l2",
            loanName: "Vay Techcombank",
            principalDue: 20000000,
            interestDue: 3000000,
            totalPayment: 23000000,
          },
        ],
      },
    ];

    render(<LoanCashflowChart schedule={schedule} />);

    expect(screen.getByText("Vay Vietcombank")).toBeInTheDocument();
    expect(screen.getByText("Vay Techcombank")).toBeInTheDocument();
    expect(screen.getByText(/Dư nợ còn lại/i)).toBeInTheDocument();
    expect(screen.queryByText("Tiền gốc")).not.toBeInTheDocument();
  });

  it("hiển thị Tiền gốc và Tiền lãi khi chỉ có 1 khoản vay", () => {
    const schedule = [
      {
        monthKey: "2026-11",
        principalDue: 10000000,
        interestDue: 2000000,
        remainingPrincipal: 90000000,
      },
    ];

    render(<LoanCashflowChart schedule={schedule} />);

    expect(screen.getByText("Tiền gốc")).toBeInTheDocument();
    expect(screen.getByText("Tiền lãi")).toBeInTheDocument();
    expect(screen.getByText(/Dư nợ còn lại/i)).toBeInTheDocument();
  });
});
