import {
  AmortizationMethod,
  type LoanRecalculateInput,
  type LoanSchedulePeriod,
  type LoanSimulationResult,
} from "../types/loan.types";
import {
  addMonths,
  calculatePmt,
  generateAmortizationSchedule,
  round2,
} from "./loan-amortization.rule";
import { resolveDueAmounts } from "./loan-recalculate.helper";

export function recalculateAmortizationSchedule(
  input: LoanRecalculateInput,
): LoanSimulationResult {
  const {
    principalAmount: P,
    annualInterestRate: rate,
    tenorMonths: n,
    amortizationMethod: method,
    startDate,
    payments = [],
  } = input;

  if (!payments || payments.length === 0) {
    return generateAmortizationSchedule(input);
  }

  let firstDate = input.firstPaymentDate;
  if (!firstDate || firstDate < startDate) {
    firstDate = addMonths(startDate, 1);
  }
  const monthlyRate = rate / 100 / 12;

  const sortedPayments = [...payments].sort(
    (a, b) => a.periodNumber - b.periodNumber,
  );
  const paymentMap = new Map<number, (typeof payments)[0]>();
  for (const p of sortedPayments) paymentMap.set(p.periodNumber, p);
  const maxPaidPeriod =
    sortedPayments[sortedPayments.length - 1]?.periodNumber || 0;

  const schedule: LoanSchedulePeriod[] = [];
  let curBal = P;
  let totalInterest = 0;

  // 1. Điền các kỳ đã thanh toán thực tế (1 .. maxPaidPeriod)
  for (let k = 1; k <= maxPaidPeriod; k++) {
    const dueDate = addMonths(firstDate, k - 1);
    const begBal = curBal;
    const pRec = paymentMap.get(k);

    if (pRec) {
      const pPaid = round2(pRec.principalPaid);
      const iPaid = round2(pRec.interestPaid);
      const endBal = round2(Math.max(0, begBal - pPaid));
      curBal = endBal;
      totalInterest += iPaid;

      schedule.push({
        periodNumber: k,
        dueDate,
        beginningBalance: begBal,
        principalDue: pPaid,
        interestDue: iPaid,
        totalPaymentDue: round2(pPaid + iPaid),
        endingBalance: endBal,
        isPaid: true,
        actualPaymentDate: pRec.paymentDate,
        actualPrincipalPaid: pPaid,
        actualInterestPaid: iPaid,
        actualTotalPaid: round2(pPaid + iPaid),
        paymentRef: pRec.paymentRef || null,
      });
    } else {
      const iDue = round2(begBal * monthlyRate);
      schedule.push({
        periodNumber: k,
        dueDate,
        beginningBalance: begBal,
        principalDue: 0,
        interestDue: iDue,
        totalPaymentDue: iDue,
        endingBalance: begBal,
        isPaid: false,
      });
      totalInterest += iDue;
    }
  }

  if (input.remainingPrincipal !== undefined) {
    curBal = round2(Number(input.remainingPrincipal));
  }

  // 2. Tính toán lại cho các kỳ tương lai (maxPaidPeriod + 1 .. n)
  const remainingTenor = Math.max(0, n - maxPaidPeriod);
  const pmtRem =
    remainingTenor > 0 ? calculatePmt(curBal, rate, remainingTenor) : 0;
  const equalPRem = remainingTenor > 0 ? round2(curBal / remainingTenor) : 0;
  const flatTotalRem = round2(curBal * (rate / 100) * (remainingTenor / 12));
  const flatMonthlyRem =
    remainingTenor > 0 ? round2(flatTotalRem / remainingTenor) : 0;

  for (let k = maxPaidPeriod + 1; k <= n; k++) {
    const dueDate = addMonths(firstDate, k - 1);
    const begBal = curBal;

    if (begBal <= 0) {
      schedule.push({
        periodNumber: k,
        dueDate,
        beginningBalance: 0,
        principalDue: 0,
        interestDue: 0,
        totalPaymentDue: 0,
        endingBalance: 0,
        isPaid: false,
      });
      continue;
    }

    const { pDue, iDue } = resolveDueAmounts({
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
    });

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
      isPaid: false,
    });
  }

  const roundedTotalInterest = round2(totalInterest);
  const totalAmount = round2(P + roundedTotalInterest);
  const monthlyEstimate =
    remainingTenor > 0
      ? method === AmortizationMethod.AMORTIZED
        ? pmtRem
        : round2((curBal + roundedTotalInterest) / remainingTenor)
      : 0;

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
