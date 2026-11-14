import { useMemo } from "react";
import { useCashflowProjectionQuery } from "../../../api";
import type { MonthlyProjectionRow } from "./ConsolidatedCashflowTable";
import type { CashflowLoanItem } from "./CashflowLoanFilterPanel";
import { useEnabledLoanIds } from "./useEnabledLoanIds";

export function useConsolidatedCashflow() {
  const { data, isLoading } = useCashflowProjectionQuery(true);

  // Extract all unique loans from breakdown
  const allLoans = useMemo<CashflowLoanItem[]>(() => {
    if (!data?.monthlyProjections) return [];
    const map = new Map<string, string>();
    for (const m of data.monthlyProjections) {
      if (m.breakdown) {
        for (const b of m.breakdown) {
          if (!map.has(b.loanId)) {
            map.set(b.loanId, b.loanName);
          }
        }
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const { enabledLoanIds, setEnabledLoanIds } = useEnabledLoanIds(allLoans);

  const handleToggleLoan = (id: string) => {
    setEnabledLoanIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setEnabledLoanIds(new Set(allLoans.map((l) => l.id)));
  };

  const handleClearAll = () => {
    setEnabledLoanIds(new Set());
  };

  // Filter projections and breakdown according to enabledLoanIds
  const filteredProjections = useMemo<MonthlyProjectionRow[]>(() => {
    if (!data?.monthlyProjections) return [];

    return data.monthlyProjections
      .map((m) => {
        const matchingBreakdown = (m.breakdown || []).filter((b) =>
          enabledLoanIds.has(b.loanId),
        );

        if (matchingBreakdown.length === 0 && enabledLoanIds.size > 0) {
          return null;
        }

        const principalDue = matchingBreakdown.reduce(
          (sum, b) => sum + (b.isPaid ? 0 : b.principalDue),
          0,
        );
        const interestDue = matchingBreakdown.reduce(
          (sum, b) => sum + (b.isPaid ? 0 : b.interestDue),
          0,
        );
        const totalPaymentDue = principalDue + interestDue;
        const cumulativeRemainingPrincipal = matchingBreakdown.reduce(
          (sum, b) => sum + (b.endingBalance || 0),
          0,
        );
        const scheduledPrincipalDue = matchingBreakdown.reduce(
          (sum, b) => sum + (b.scheduledPrincipal ?? b.principalDue),
          0,
        );
        const scheduledInterestDue = matchingBreakdown.reduce(
          (sum, b) => sum + (b.scheduledInterest ?? b.interestDue),
          0,
        );
        const scheduledTotalDue = scheduledPrincipalDue + scheduledInterestDue;
        const actualPrincipalPaid = matchingBreakdown.reduce(
          (sum, b) => sum + (b.actualPrincipalPaid || 0),
          0,
        );
        const actualInterestPaid = matchingBreakdown.reduce(
          (sum, b) => sum + (b.actualInterestPaid || 0),
          0,
        );
        const actualTotalPaid = actualPrincipalPaid + actualInterestPaid;

        return {
          month: m.month,
          activeLoanCount: matchingBreakdown.length,
          principalDue,
          interestDue,
          totalPaymentDue,
          cumulativeRemainingPrincipal,
          scheduledPrincipalDue,
          scheduledInterestDue,
          scheduledTotalDue,
          actualPrincipalPaid,
          actualInterestPaid,
          actualTotalPaid,
          isPaid:
            matchingBreakdown.length > 0 &&
            matchingBreakdown.every((b) => b.isPaid),
          breakdown: matchingBreakdown,
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [data, enabledLoanIds]);

  const kpis = useMemo(() => {
    let totalScheduledObligation = 0;
    let totalActualPaid = 0;
    let remainingPrincipal = 0;

    for (const p of filteredProjections) {
      totalScheduledObligation += p.scheduledTotalDue ?? p.totalPaymentDue;
      totalActualPaid += p.actualTotalPaid ?? 0;
    }

    if (filteredProjections.length > 0) {
      // Dư nợ còn lại lấy từ điểm hiện tại (các khoản vay chưa tất toán)
      const latestBalances = new Map<string, number>();
      for (const p of filteredProjections) {
        if (p.breakdown) {
          for (const b of p.breakdown) {
            latestBalances.set(b.loanId, b.endingBalance);
          }
        }
      }
      remainingPrincipal = Array.from(latestBalances.values()).reduce(
        (sum, bal) => sum + bal,
        0,
      );
    }

    return {
      totalScheduledObligation,
      totalActualPaid,
      remainingPrincipal,
    };
  }, [filteredProjections]);

  return {
    isLoading,
    allLoans,
    enabledLoanIds,
    handleToggleLoan,
    handleSelectAll,
    handleClearAll,
    projections: filteredProjections,
    kpis,
  };
}
