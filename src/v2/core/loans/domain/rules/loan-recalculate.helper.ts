import { AmortizationMethod } from "../types/loan.types";
import { round2 } from "./loan-amortization.rule";

export interface RecalculateDueContext {
  method: AmortizationMethod;
  k: number;
  n: number;
  begBal: number;
  monthlyRate: number;
  pmtRem: number;
  equalPRem: number;
  remainingTenor: number;
  maxPaidPeriod: number;
  flatTotalRem: number;
  flatMonthlyRem: number;
}

export function resolveDueAmounts(ctx: RecalculateDueContext): {
  pDue: number;
  iDue: number;
} {
  const {
    method,
    k,
    n,
    begBal,
    monthlyRate,
    pmtRem,
    equalPRem,
    remainingTenor,
    maxPaidPeriod,
    flatTotalRem,
    flatMonthlyRem,
  } = ctx;

  if (method === AmortizationMethod.AMORTIZED) {
    const iDue = round2(begBal * monthlyRate);
    const pDue = k === n ? begBal : round2(pmtRem - iDue);
    return { pDue, iDue };
  }
  if (method === AmortizationMethod.EQUAL_PRINCIPAL) {
    return {
      pDue: k === n ? begBal : equalPRem,
      iDue: round2(begBal * monthlyRate),
    };
  }
  if (method === AmortizationMethod.BULLET) {
    return {
      pDue: k === n ? begBal : 0,
      iDue: round2(begBal * monthlyRate),
    };
  }
  if (method === AmortizationMethod.FLAT) {
    const pIdx = k - maxPaidPeriod;
    const iDue =
      pIdx === remainingTenor
        ? round2(flatTotalRem - (pIdx - 1) * flatMonthlyRem)
        : flatMonthlyRem;
    return { pDue: k === n ? begBal : equalPRem, iDue };
  }
  if (method === AmortizationMethod.GRACE_PERIOD) {
    const graceMonths = Math.min(Math.max(1, Math.floor(n / 3)), 6);
    const iDue = round2(begBal * monthlyRate);
    if (k <= graceMonths) return { pDue: 0, iDue };
    const postGraceRemaining = Math.max(
      1,
      n - Math.max(graceMonths, maxPaidPeriod),
    );
    return {
      pDue: k === n ? begBal : round2(begBal / postGraceRemaining),
      iDue,
    };
  }
  if (method === AmortizationMethod.MATURITY_LUMP_SUM) {
    return k === n
      ? { pDue: begBal, iDue: flatTotalRem }
      : { pDue: 0, iDue: 0 };
  }
  return {
    pDue: k === n ? begBal : equalPRem,
    iDue: round2(begBal * monthlyRate),
  };
}
