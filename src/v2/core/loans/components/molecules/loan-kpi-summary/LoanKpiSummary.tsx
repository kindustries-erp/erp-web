import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { LoanKpiSummaryProps } from "./LoanKpiSummary.type";
import { CalendarCheck, DollarSign, TrendingDown, Wallet } from "lucide-react";

function formatVnd(val: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(val);
}

export const LoanKpiSummary: React.FC<LoanKpiSummaryProps> = ({
  firstMonthDue,
  monthlyAverage,
  totalInterest,
  totalObligation,
  className = "",
}) => {
  const { t } = useV2Translation();

  const cards = [
    {
      title: t("v2.loans.kpi.firstMonthDue", "Thanh toán kỳ đầu"),
      value: formatVnd(firstMonthDue),
      icon: <CalendarCheck className="h-5 w-5 text-primary" />,
    },
    {
      title: t("v2.loans.kpi.monthlyAverage", "Trung bình hàng tháng"),
      value: formatVnd(monthlyAverage),
      icon: <Wallet className="h-5 w-5 text-primary" />,
    },
    {
      title: t("v2.loans.kpi.totalInterest", "Tổng lãi phải trả"),
      value: formatVnd(totalInterest),
      icon: <TrendingDown className="h-5 w-5 text-amber-500" />,
    },
    {
      title: t("v2.loans.kpi.totalObligation", "Tổng tiền phải trả"),
      value: formatVnd(totalObligation),
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
          </div>
        </div>
      ))}
    </div>
  );
};
LoanKpiSummary.displayName = "LoanKpiSummary";
