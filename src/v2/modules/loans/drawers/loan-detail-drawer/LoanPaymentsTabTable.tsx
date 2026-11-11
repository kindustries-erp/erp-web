import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui";
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
              <V2Text as="span">
                {t("v2.loans.table.period", "Kỳ")} {p.periodNumber} •{" "}
                {p.paymentDate}
              </V2Text>
              <V2Text
                as="span"
                className="text-primary font-semibold font-mono"
              >
                {formatVndCurrency(p.totalPaid)}
              </V2Text>
            </div>
            <div className="text-xs text-muted-foreground flex justify-between font-mono">
              <V2Text as="span" variant="caption">
                {t("v2.loans.table.principalPaid", "Gốc đã trả")}:{" "}
                {formatVndCurrency(p.principalPaid)}
              </V2Text>
              <V2Text as="span" variant="caption">
                {t("v2.loans.table.interestPaid", "Lãi đã trả")}:{" "}
                {formatVndCurrency(p.interestPaid)}
              </V2Text>
            </div>
            {p.paymentRef && (
              <V2Text
                variant="caption"
                className="text-muted-foreground pt-1 border-t border-border/50 block"
              >
                {t("v2.loans.table.ref", "Mã GD")}: {p.paymentRef}
              </V2Text>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table className="text-sm">
        <TableHeader className="bg-muted text-muted-foreground border-b border-border text-left">
          <TableRow className="hover:bg-muted">
            <TableHead className="h-auto px-4 py-3">
              {t("v2.loans.table.period", "Kỳ")}
            </TableHead>
            <TableHead className="h-auto px-4 py-3">
              {t("v2.loans.table.paymentDate", "Ngày trả")}
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-right">
              {t("v2.loans.table.principalPaid", "Gốc đã trả")}
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-right">
              {t("v2.loans.table.interestPaid", "Lãi đã trả")}
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-right">
              {t("v2.loans.table.totalPaid", "Tổng tiền")}
            </TableHead>
            <TableHead className="h-auto px-4 py-3">
              {t("v2.loans.table.ref", "Mã GD")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {payments.map((p) => (
            <TableRow
              key={p.id}
              className="hover:bg-muted/40 transition-colors"
            >
              <TableCell className="px-4 py-2.5 font-medium">
                {p.periodNumber}
              </TableCell>
              <TableCell className="px-4 py-2.5 font-mono">
                {p.paymentDate}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-right font-mono">
                {formatVndCurrency(p.principalPaid)}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-right font-mono">
                {formatVndCurrency(p.interestPaid)}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-right font-medium font-mono">
                {formatVndCurrency(p.totalPaid)}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">
                {p.paymentRef || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
