import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { LoanKpiSummaryProps } from "./LoanKpiSummary.type";
import { CalendarCheck, DollarSign, TrendingDown, Wallet } from "lucide-react";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";

export const LoanKpiSummary: React.FC<LoanKpiSummaryProps> = ({
  principalAmount,
  remainingPrincipal,
  totalPaidPrincipal = 0,
  totalPaidInterest = 0,
  remainingInterestDue,
  remainingTotalObligation,
  nextPaymentDue,
  nextPaymentDate,
  firstMonthDue = 0,
  monthlyAverage = 0,
  totalInterest = 0,
  totalObligation = 0,
  className = "",
}) => {
  const { t } = useV2Translation();
  const hasPaid = totalPaidPrincipal > 0 || totalPaidInterest > 0;

  const cards = hasPaid
    ? [
        {
          title: t("v2.loans.kpi.remainingPrincipal", "Dư nợ gốc còn lại"),
          value: formatVndCurrency(remainingPrincipal ?? 0),
          subText: principalAmount
            ? `${t("v2.loans.kpi.paid", "Đã trả")} ${formatVndCurrency(totalPaidPrincipal)}`
            : undefined,
          icon: <Wallet className="h-5 w-5 text-emerald-500" />,
        },
        {
          title: t(
            "v2.loans.kpi.remainingObligation",
            "Tổng số tiền còn phải trả",
          ),
          value: formatVndCurrency(
            remainingTotalObligation ?? remainingPrincipal ?? 0,
          ),
          subText: t(
            "v2.loans.kpi.subObligation",
            "Gốc còn lại + Lãi tương lai",
          ),
          icon: <DollarSign className="h-5 w-5 text-primary" />,
        },
        {
          title: t("v2.loans.kpi.remainingInterest", "Tiền lãi còn lại"),
          value: formatVndCurrency(remainingInterestDue ?? 0),
          subText: `${t("v2.loans.kpi.paidInterest", "Đã trả lãi")} ${formatVndCurrency(totalPaidInterest)}`,
          icon: <TrendingDown className="h-5 w-5 text-amber-500" />,
        },
        {
          title: t("v2.loans.kpi.nextPayment", "Thanh toán kỳ tiếp theo"),
          value:
            nextPaymentDue && nextPaymentDue > 0
              ? formatVndCurrency(nextPaymentDue)
              : t("v2.loans.status.settled", "Đã tất toán"),
          subText: nextPaymentDate
            ? `${t("v2.loans.table.dueDate", "Hạn")}: ${nextPaymentDate}`
            : undefined,
          icon: <CalendarCheck className="h-5 w-5 text-teal-500" />,
        },
      ]
    : [
        {
          title: t("v2.loans.kpi.firstMonthDue", "Thanh toán kỳ đầu"),
          value: formatVndCurrency(firstMonthDue),
          subText: undefined,
          icon: <CalendarCheck className="h-5 w-5 text-primary" />,
        },
        {
          title: t("v2.loans.kpi.monthlyAverage", "Trung bình hàng tháng"),
          value: formatVndCurrency(monthlyAverage),
          subText: undefined,
          icon: <Wallet className="h-5 w-5 text-primary" />,
        },
        {
          title: t("v2.loans.kpi.totalInterest", "Tổng lãi phải trả"),
          value: formatVndCurrency(totalInterest),
          subText: undefined,
          icon: <TrendingDown className="h-5 w-5 text-amber-500" />,
        },
        {
          title: t("v2.loans.kpi.totalObligation", "Tổng tiền phải trả"),
          value: formatVndCurrency(totalObligation),
          subText: undefined,
          icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
        },
      ];

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}
    >
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <V2Text variant="caption" color="muted" className="font-medium">
              {card.title}
            </V2Text>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/40">
              {card.icon}
            </div>
          </div>
          <div className="mt-2">
            <V2Text
              as="p"
              variant="h3"
              weight="bold"
              className="tracking-tight"
            >
              {card.value}
            </V2Text>
            {card.subText && (
              <V2Text
                variant="caption"
                className="text-xs text-muted-foreground mt-0.5 block"
              >
                {card.subText}
              </V2Text>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
LoanKpiSummary.displayName = "LoanKpiSummary";
