import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { formatVndCurrency, type LoanPaymentRecord } from "@/v2/core/loans";

interface LoanPaymentsTabTableProps {
  payments?: LoanPaymentRecord[];
  isMobile?: boolean;
}

export const LoanPaymentsTabTable: React.FC<LoanPaymentsTabTableProps> = ({
  payments = [],
  isMobile = false,
}) => {
  const { t } = useV2Translation();

  if (payments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <V2Text variant="body">
          {t(
            "v2.loans.emptyPayments",
            "Chưa có lượt thanh toán nào được ghi nhận.",
          )}
        </V2Text>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {payments.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border p-3 bg-card space-y-1.5 text-sm"
          >
            <div className="flex justify-between items-center font-medium">
              <span>
                Kỳ {p.periodNumber} • {p.paymentDate}
              </span>
              <span className="text-primary font-semibold font-mono">
                {formatVndCurrency(p.totalPaid)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground flex justify-between font-mono">
              <span>Gốc: {formatVndCurrency(p.principalPaid)}</span>
              <span>Lãi: {formatVndCurrency(p.interestPaid)}</span>
            </div>
            {p.paymentRef && (
              <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                Mã GD: {p.paymentRef}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground border-b border-border text-left">
          <tr>
            <th className="px-4 py-3">{t("v2.loans.table.period", "Kỳ")}</th>
            <th className="px-4 py-3">
              {t("v2.loans.table.paymentDate", "Ngày trả")}
            </th>
            <th className="px-4 py-3 text-right">
              {t("v2.loans.table.principalPaid", "Gốc đã trả")}
            </th>
            <th className="px-4 py-3 text-right">
              {t("v2.loans.table.interestPaid", "Lãi đã trả")}
            </th>
            <th className="px-4 py-3 text-right">
              {t("v2.loans.table.totalPaid", "Tổng tiền")}
            </th>
            <th className="px-4 py-3">{t("v2.loans.table.ref", "Mã GD")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-muted/40 transition-colors">
              <td className="px-4 py-2.5 font-medium">{p.periodNumber}</td>
              <td className="px-4 py-2.5 font-mono">{p.paymentDate}</td>
              <td className="px-4 py-2.5 text-right font-mono">
                {formatVndCurrency(p.principalPaid)}
              </td>
              <td className="px-4 py-2.5 text-right font-mono">
                {formatVndCurrency(p.interestPaid)}
              </td>
              <td className="px-4 py-2.5 text-right font-medium font-mono">
                {formatVndCurrency(p.totalPaid)}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {p.paymentRef || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
