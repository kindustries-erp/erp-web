import {
  PortfolioLoanItem,
  PortfolioMonthlyPeriod,
  PortfolioSimulationResult,
} from "../types/loan.types";
import { generateAmortizationSchedule, round2 } from "./loan-amortization.rule";

export function generatePortfolioAmortizationSchedule(
  loans: PortfolioLoanItem[],
): PortfolioSimulationResult {
  const activeLoans = loans.filter(
    (l) => l.enabled && l.principalAmount > 0 && l.tenorMonths > 0,
  );

  if (activeLoans.length === 0) {
    return {
      totalPrincipal: 0,
      totalInterest: 0,
      totalRepayment: 0,
      averageMonthlyPayment: 0,
      firstMonthPayment: 0,
      activeLoansCount: 0,
      schedule: [],
    };
  }

  const monthMap = new Map<
    string,
    {
      monthKey: string;
      paymentDate: string;
      principalDue: number;
      interestDue: number;
      totalPayment: number;
      loansCount: number;
      breakdown: Array<{
        loanId: string;
        loanName: string;
        principalDue: number;
        interestDue: number;
        totalPayment: number;
      }>;
    }
  >();

  let totalPrincipal = 0;
  let totalInterest = 0;

  activeLoans.forEach((loan) => {
    totalPrincipal += loan.principalAmount;
    const sim = generateAmortizationSchedule({
      principalAmount: loan.principalAmount,
      annualInterestRate: loan.annualInterestRate,
      tenorMonths: loan.tenorMonths,
      amortizationMethod: loan.amortizationMethod,
      startDate: loan.startDate,
    });
    totalInterest += sim.totalInterestDue;

    sim.schedule.forEach((period) => {
      const monthKey = period.dueDate.slice(0, 7);
      const existing = monthMap.get(monthKey);
      if (existing) {
        existing.principalDue = round2(
          existing.principalDue + period.principalDue,
        );
        existing.interestDue = round2(
          existing.interestDue + period.interestDue,
        );
        existing.totalPayment = round2(
          existing.totalPayment + period.totalPaymentDue,
        );
        existing.loansCount += 1;
        existing.breakdown.push({
          loanId: loan.id,
          loanName: loan.name,
          principalDue: period.principalDue,
          interestDue: period.interestDue,
          totalPayment: period.totalPaymentDue,
        });
      } else {
        monthMap.set(monthKey, {
          monthKey,
          paymentDate: period.dueDate,
          principalDue: period.principalDue,
          interestDue: period.interestDue,
          totalPayment: period.totalPaymentDue,
          loansCount: 1,
          breakdown: [
            {
              loanId: loan.id,
              loanName: loan.name,
              principalDue: period.principalDue,
              interestDue: period.interestDue,
              totalPayment: period.totalPaymentDue,
            },
          ],
        });
      }
    });
  });

  const sortedMonthKeys = Array.from(monthMap.keys()).sort();
  let remainingPrincipal = totalPrincipal;

  const schedule: PortfolioMonthlyPeriod[] = sortedMonthKeys.map((key) => {
    const entry = monthMap.get(key)!;
    remainingPrincipal = Math.max(
      0,
      round2(remainingPrincipal - entry.principalDue),
    );
    return {
      monthKey: entry.monthKey,
      paymentDate: entry.paymentDate,
      principalDue: entry.principalDue,
      interestDue: entry.interestDue,
      totalPayment: entry.totalPayment,
      remainingPrincipal,
      loansCount: entry.loansCount,
      breakdown: entry.breakdown,
    };
  });

  const totalRepayment = round2(totalPrincipal + totalInterest);
  const averageMonthlyPayment =
    schedule.length > 0 ? round2(totalRepayment / schedule.length) : 0;
  const firstMonthPayment = schedule.length > 0 ? schedule[0].totalPayment : 0;

  return {
    totalPrincipal: round2(totalPrincipal),
    totalInterest: round2(totalInterest),
    totalRepayment,
    averageMonthlyPayment,
    firstMonthPayment,
    activeLoansCount: activeLoans.length,
    schedule,
  };
}
