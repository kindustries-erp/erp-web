import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui";
import { formatVndCurrency, type LoanPaymentRecord } from "@/v2/core/loans";
import { LoanPaymentMobileCard } from "./LoanPaymentMobileCard";

interface LoanPaymentsTabTableProps {
  payments?: LoanPaymentRecord[];
  isMobile?: boolean;
  onEdit?: (p: LoanPaymentRecord) => void;
  onDelete?: (p: LoanPaymentRecord) => void;
}

export const LoanPaymentsTabTable: React.FC<LoanPaymentsTabTableProps> = ({
  payments = [],
  isMobile = false,
  onEdit,
  onDelete,
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
          <LoanPaymentMobileCard
            key={p.id}
            payment={p}
            onEdit={onEdit}
            onDelete={onDelete}
          />
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
            {(onEdit || onDelete) && (
              <TableHead className="h-auto px-4 py-3 text-right">
                {t("v2.common.actions", "Thao tác")}
              </TableHead>
            )}
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
              {(onEdit || onDelete) && (
                <TableCell className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onEdit && (
                      <V2Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onEdit(p)}
                      >
                        {t("v2.common.edit", "Sửa")}
                      </V2Button>
                    )}
                    {onDelete && (
                      <V2Button
                        variant="ghost"
                        size="xs"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(p)}
                      >
                        {t("v2.common.delete", "Xóa")}
                      </V2Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
LoanPaymentsTabTable.displayName = "LoanPaymentsTabTable";
