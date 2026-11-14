import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoanCashflowChart } from "./LoanCashflowChart";
import { buildLoanCashflowSeries } from "./LoanCashflowChart.series";

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

  it("tách rõ Nợ gốc và Đã trả của từng khoản, tự điều chỉnh số phải trả về 0 khi đã trả", () => {
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
            scheduledPrincipal: 10000000,
            scheduledInterest: 2000000,
            scheduledTotal: 12000000,
            actualPrincipalPaid: 10000000,
            actualInterestPaid: 2000000,
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
            scheduledPrincipal: 10000000,
            scheduledInterest: 1500000,
            scheduledTotal: 11500000,
            actualPrincipalPaid: 0,
            actualInterestPaid: 0,
            actualTotalPaid: 0,
            isPaid: false,
          },
        ],
      },
    ];

    const series = buildLoanCashflowSeries({
      schedule,
      palette: ["#10b981"],
      balanceColor: "#64748b",
      labels: {
        paid: "Đã trả",
        unpaid: "Còn phải trả",
        remaining: "Dư nợ còn lại",
        principal: "Nợ gốc",
        interest: "Tiền lãi",
      },
    });

    // 1 khoản vay có: paid, principal, interest + remaining line
    expect(series).toHaveLength(4);

    const paidSeries = series.find((s) => s.key === "loan-l1-paid");
    const principalSeries = series.find((s) => s.key === "loan-l1-principal");
    const interestSeries = series.find((s) => s.key === "loan-l1-interest");

    // Kỳ 1: Đã trả 12tr, nợ gốc phải trả = 0, tiền lãi phải trả = 0 (tự điều chỉnh sau thanh toán)
    expect(paidSeries?.data[0]).toBe(12000000);
    expect(principalSeries?.data[0]).toBe(0);
    expect(interestSeries?.data[0]).toBe(0);

    // Kỳ 2: Chưa trả nên Đã trả = 0, nợ gốc phải trả = 10tr, tiền lãi = 1.5tr
    expect(paidSeries?.data[1]).toBe(0);
    expect(principalSeries?.data[1]).toBe(10000000);
    expect(interestSeries?.data[1]).toBe(1500000);

    // Tooltip labels
    expect(paidSeries?.tooltipLabel).toBe("Vay Vietcombank – Đã trả");
    expect(principalSeries?.tooltipLabel).toBe("Vay Vietcombank – Nợ gốc");
    expect(interestSeries?.tooltipLabel).toBe("Vay Vietcombank – Tiền lãi");
  });
});
