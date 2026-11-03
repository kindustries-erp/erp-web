import { DrawerRow } from "@/v2/shared/components";
import { formatDateTimeParts } from "@/v2/shared/components/atoms/v2-table-date-cell/v2TableDate";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { CashVoucherSummaryProps } from "./CashVoucherSummary.type";

/** Tóm tắt phiếu thu/chi ở tab Chi tiết: sổ quỹ, ngày, đối tượng, số tiền và tham chiếu */
export function CashVoucherSummary({
  transaction,
  t,
}: CashVoucherSummaryProps) {
  const empty = t("v2.bankStatements.cashDetail.labels.empty");
  const isReceipt = Number(transaction.creditAmount) > 0;
  const amount = isReceipt ? transaction.creditAmount : transaction.debitAmount;
  const date = formatDateTimeParts(transaction.transDate)?.date ?? empty;

  return (
    <div className="space-y-1">
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.labels.direction")}
        value={
          isReceipt
            ? t("v2.bankStatements.cashDetail.direction.in")
            : t("v2.bankStatements.cashDetail.direction.out")
        }
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.labels.source")}
        value={transaction.cashBook?.name || empty}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.labels.date")}
        value={date}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.labels.partner")}
        value={transaction.correspondentName?.trim() || empty}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.labels.amount")}
        value={formatAmount(Number(amount || 0))}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.labels.reference")}
        value={transaction.referenceNumber || empty}
        copyable={Boolean(transaction.referenceNumber)}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.labels.description")}
        value={transaction.description || empty}
      />
    </div>
  );
}
