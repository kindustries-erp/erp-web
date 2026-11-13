import { describe, it, expect } from "vitest";
import {
  generateAmortizationSchedule,
  calculatePmt,
} from "./loan-amortization.rule";
import { recalculateAmortizationSchedule } from "./loan-recalculate.rule";
import { AmortizationMethod } from "../types/loan.types";

describe("loan-amortization.rule (Web V2)", () => {
  it("calculates PMT correctly", () => {
    const pmt = calculatePmt(120000000, 12, 12);
    expect(pmt).toBeCloseTo(10661854.91, -1);
  });

  it("generates AMORTIZED schedule with zero ending balance", () => {
    const res = generateAmortizationSchedule({
      principalAmount: 100000000,
      annualInterestRate: 12,
      tenorMonths: 12,
      amortizationMethod: AmortizationMethod.AMORTIZED,
      startDate: "2026-01-01",
      firstPaymentDate: "2026-02-01",
    });

    expect(res.schedule.length).toBe(12);
    expect(res.schedule[11].endingBalance).toBe(0);
    const sumP = res.schedule.reduce((acc, p) => acc + p.principalDue, 0);
    expect(Math.round(sumP)).toBe(100000000);
  });

  it("generates EQUAL_PRINCIPAL schedule correctly", () => {
    const res = generateAmortizationSchedule({
      principalAmount: 60000000,
      annualInterestRate: 10,
      tenorMonths: 6,
      amortizationMethod: AmortizationMethod.EQUAL_PRINCIPAL,
      startDate: "2026-01-01",
    });

    expect(res.schedule.length).toBe(6);
    expect(res.schedule[0].principalDue).toBe(10000000);
    expect(res.schedule[5].endingBalance).toBe(0);
  });

  it("generates GRACE_PERIOD schedule with zero principal during grace", () => {
    const res = generateAmortizationSchedule({
      principalAmount: 120000000,
      annualInterestRate: 12,
      tenorMonths: 12,
      amortizationMethod: AmortizationMethod.GRACE_PERIOD,
      startDate: "2026-01-01",
    });

    expect(res.schedule.length).toBe(12);
    expect(res.schedule[0].principalDue).toBe(0);
    expect(res.schedule[0].interestDue).toBe(1200000);
    expect(res.schedule[11].endingBalance).toBe(0);
  });

  it("generates MATURITY_LUMP_SUM schedule with all paid at end", () => {
    const res = generateAmortizationSchedule({
      principalAmount: 50000000,
      annualInterestRate: 12,
      tenorMonths: 6,
      amortizationMethod: AmortizationMethod.MATURITY_LUMP_SUM,
      startDate: "2026-01-01",
    });

    expect(res.schedule.length).toBe(6);
    expect(res.schedule[0].principalDue).toBe(0);
    expect(res.schedule[5].principalDue).toBe(50000000);
    expect(res.schedule[5].interestDue).toBe(3000000);
    expect(res.schedule[5].endingBalance).toBe(0);
  });

  it("normalizes firstPaymentDate if earlier than startDate", () => {
    const res = generateAmortizationSchedule({
      principalAmount: 10000000,
      annualInterestRate: 10,
      tenorMonths: 3,
      amortizationMethod: AmortizationMethod.EQUAL_PRINCIPAL,
      startDate: "2025-10-01",
      firstPaymentDate: "2020-01-01",
    });

    expect(res.schedule[0].dueDate).toBe("2025-11-01");
  });

  it("recalculateAmortizationSchedule recalculates future periods after payment", () => {
    const res = recalculateAmortizationSchedule({
      principalAmount: 60000000,
      annualInterestRate: 12,
      tenorMonths: 6,
      amortizationMethod: AmortizationMethod.EQUAL_PRINCIPAL,
      startDate: "2026-01-01",
      remainingPrincipal: 40000000,
      payments: [
        {
          periodNumber: 1,
          paymentDate: "2026-02-01",
          principalPaid: 20000000,
          interestPaid: 600000,
        },
      ],
    });

    expect(res.schedule[0].isPaid).toBe(true);
    expect(res.schedule[0].endingBalance).toBe(40000000);
    // 5 remaining periods each 40m / 5 = 8m
    expect(res.schedule[1].principalDue).toBe(8000000);
    expect(res.schedule[5].endingBalance).toBe(0);
  });
});
