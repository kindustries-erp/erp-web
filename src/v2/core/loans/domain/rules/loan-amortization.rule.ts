import {
  AmortizationMethod,
  LoanSchedulePeriod,
  LoanSimulationInput,
  LoanSimulationResult,
} from "../types/loan.types";

export function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function addMonths(dateStr: string, monthsToAdd: number): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  d.setMonth(d.getMonth() + monthsToAdd);
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d.toISOString().split("T")[0];
}

export function calculatePmt(
  principal: number,
  annualRate: number,
  tenorMonths: number,
): number {
  if (annualRate <= 0) return round2(principal / tenorMonths);
  const r = annualRate / 100 / 12;
  const factor = Math.pow(1 + r, tenorMonths);
  return round2((principal * (r * factor)) / (factor - 1));
}

export function generateAmortizationSchedule(
  input: LoanSimulationInput,
): LoanSimulationResult {
  const {
    principalAmount: P,
    annualInterestRate: rate,
    tenorMonths: n,
    amortizationMethod: method,
    startDate,
  } = input;
  let firstDate = input.firstPaymentDate;
  if (!firstDate || firstDate < startDate) {
    firstDate = addMonths(startDate, 1);
  }
  const monthlyRate = rate / 100 / 12;

  const schedule: LoanSchedulePeriod[] = [];
  let curBal = P;
  let totalInterest = 0;
  const pmt = calculatePmt(P, rate, n);
  const flatTotalInterest = round2(P * (rate / 100) * (n / 12));
  const flatMonthlyInterest = round2(flatTotalInterest / n);
  const equalPrincipal = round2(P / n);

  // Tính thời gian ân hạn cho phương thức GRACE_PERIOD
  const graceMonths = Math.min(Math.max(1, Math.floor(n / 3)), 6);
  const postGraceTenor = Math.max(1, n - graceMonths);
  const graceEqualPrincipal = round2(P / postGraceTenor);

  for (let k = 1; k <= n; k++) {
    const dueDate = addMonths(firstDate, k - 1);
    const begBal = curBal;
    let pDue = 0;
    let iDue = 0;

    if (method === AmortizationMethod.AMORTIZED) {
      iDue = round2(begBal * monthlyRate);
      pDue = k === n ? begBal : round2(pmt - iDue);
    } else if (method === AmortizationMethod.EQUAL_PRINCIPAL) {
      pDue = k === n ? begBal : equalPrincipal;
      iDue = round2(begBal * monthlyRate);
    } else if (method === AmortizationMethod.BULLET) {
      iDue = round2(begBal * monthlyRate);
      pDue = k === n ? begBal : 0;
    } else if (method === AmortizationMethod.FLAT) {
      pDue = k === n ? begBal : equalPrincipal;
      iDue =
        k === n
          ? flatTotalInterest - (k - 1) * flatMonthlyInterest
          : flatMonthlyInterest;
    } else if (method === AmortizationMethod.GRACE_PERIOD) {
      iDue = round2(begBal * monthlyRate);
      if (k <= graceMonths) {
        pDue = 0;
      } else {
        pDue = k === n ? begBal : graceEqualPrincipal;
      }
    } else if (method === AmortizationMethod.MATURITY_LUMP_SUM) {
      if (k === n) {
        pDue = begBal;
        iDue = flatTotalInterest;
      } else {
        pDue = 0;
        iDue = 0;
      }
    }

    const totalDue = round2(pDue + iDue);
    const endBal = k === n ? 0 : round2(begBal - pDue);
    curBal = endBal;
    totalInterest += iDue;

    schedule.push({
      periodNumber: k,
      dueDate,
      beginningBalance: begBal,
      principalDue: pDue,
      interestDue: iDue,
      totalPaymentDue: totalDue,
      endingBalance: endBal,
    });
  }

  const roundedTotalInterest = round2(totalInterest);
  const totalAmount = round2(P + roundedTotalInterest);
  const monthlyEstimate =
    method === AmortizationMethod.AMORTIZED ? pmt : round2(totalAmount / n);

  return {
    principalAmount: P,
    annualInterestRate: rate,
    tenorMonths: n,
    amortizationMethod: method,
    startDate,
    firstPaymentDate: firstDate,
    monthlyPaymentEstimate: monthlyEstimate,
    totalInterestDue: roundedTotalInterest,
    totalAmountDue: totalAmount,
    schedule,
  };
}
