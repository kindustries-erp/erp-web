import { describe, it, expect } from "vitest";
import {
  generateAmortizationSchedule,
  calculatePmt,
} from "./loan-amortization.rule";
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
});
