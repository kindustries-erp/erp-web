import { describe, expect, it } from "vitest";
import { AmortizationMethod, PortfolioLoanItem } from "../types/loan.types";
import { generatePortfolioAmortizationSchedule } from "./loan-portfolio.rule";

describe("generatePortfolioAmortizationSchedule", () => {
  it("returns zero metrics when loan list is empty or disabled", () => {
    const result = generatePortfolioAmortizationSchedule([]);
    expect(result.totalPrincipal).toBe(0);
    expect(result.activeLoansCount).toBe(0);
    expect(result.schedule).toHaveLength(0);

    const disabledResult = generatePortfolioAmortizationSchedule([
      {
        id: "1",
        name: "Khoản 1",
        enabled: false,
        principalAmount: 100_000_000,
        annualInterestRate: 10,
        tenorMonths: 12,
        amortizationMethod: AmortizationMethod.AMORTIZED,
        startDate: "2026-01-01",
      },
    ]);
    expect(disabledResult.totalPrincipal).toBe(0);
    expect(disabledResult.schedule).toHaveLength(0);
  });

  it("consolidates multiple active loans into monthly timeline", () => {
    const loans: PortfolioLoanItem[] = [
      {
        id: "loan-1",
        name: "Vay mua máy",
        enabled: true,
        principalAmount: 120_000_000,
        annualInterestRate: 12,
        tenorMonths: 12,
        amortizationMethod: AmortizationMethod.EQUAL_PRINCIPAL,
        startDate: "2026-01-01",
      },
      {
        id: "loan-2",
        name: "Vay vốn lưu động",
        enabled: true,
        principalAmount: 60_000_000,
        annualInterestRate: 6,
        tenorMonths: 6,
        amortizationMethod: AmortizationMethod.EQUAL_PRINCIPAL,
        startDate: "2026-01-01",
      },
    ];

    const result = generatePortfolioAmortizationSchedule(loans);

    expect(result.activeLoansCount).toBe(2);
    expect(result.totalPrincipal).toBe(180_000_000);
    expect(result.schedule.length).toBe(12);

    // Kỳ 1 có cả 2 khoản
    const period1 = result.schedule[0];
    expect(period1.loansCount).toBe(2);
    expect(period1.principalDue).toBe(20_000_000); // 10M + 10M
    expect(period1.breakdown).toHaveLength(2);

    // Kỳ 7 chỉ còn khoản 1
    const period7 = result.schedule[6];
    expect(period7.loansCount).toBe(1);
    expect(period7.principalDue).toBe(10_000_000);
  });
});
