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

  it("có dữ liệu đã trả thực tế thì tách đã trả/còn phải trả, legend chỉ hiện một mục mỗi khoản", () => {
    const schedule = [
      {
        monthKey: "2026-11",
        principalDue: 0,
        interestDue: 0,
        remainingPrincipal: 90000000,
        isPaid: true,
        breakdown: [
          {
            loanId: "l1",
            loanName: "Vay Vietcombank",
            principalDue: 10000000,
            interestDue: 2000000,
            totalPayment: 12000000,
            scheduledTotal: 12000000,
            actualTotalPaid: 12000000,
            isPaid: true,
          },
        ],
      },
      {
        monthKey: "2026-12",
        principalDue: 10000000,
        interestDue: 1500000,
        remainingPrincipal: 80000000,
        breakdown: [
          {
            loanId: "l1",
            loanName: "Vay Vietcombank",
            principalDue: 10000000,
            interestDue: 1500000,
            totalPayment: 11500000,
            scheduledTotal: 11500000,
            actualTotalPaid: 0,
            isPaid: false,
          },
        ],
      },
    ];

    render(<LoanCashflowChart schedule={schedule} />);

    // Một khoản: vẫn hiện tên khoản làm legend, không hiện Tiền gốc/Tiền lãi
    expect(screen.getAllByText("Vay Vietcombank").length).toBeGreaterThan(0);
    expect(screen.queryByText("Tiền gốc")).not.toBeInTheDocument();
    expect(screen.getByText("Dư nợ còn lại")).toBeInTheDocument();
  });
});
