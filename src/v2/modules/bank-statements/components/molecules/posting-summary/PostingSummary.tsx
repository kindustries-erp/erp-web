import { DrawerRow } from "@/v2/shared/components";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { PostingSummaryProps } from "./PostingSummary.type";

/** Tóm tắt bút toán đã ghi sổ: trạng thái, số bút toán, tổng Nợ/Có và số dư theo từng tài khoản */
export function PostingSummary({
  summary,
  isPosted,
  journalNo,
  accountLabel,
  t,
}: PostingSummaryProps) {
  const empty = t("v2.bankStatements.cashDetail.labels.empty");

  if (!isPosted || !summary) {
    return (
      <p className="py-2 text-sm text-muted-fg">
        {t("v2.bankStatements.cashDetail.posting.notPosted")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.posting.status")}
        value={t("v2.bankStatements.cashDetail.posting.posted")}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.posting.journalNo")}
        value={journalNo || empty}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.posting.totalDebit")}
        value={formatAmount(summary.totalDebit)}
      />
      <DrawerRow
        label={t("v2.bankStatements.cashDetail.posting.totalCredit")}
        value={formatAmount(summary.totalCredit)}
      />
      <ul className="space-y-1 pt-1 text-xs">
        {summary.accounts.map((a) => (
          <li
            key={a.accountId}
            className="flex justify-between gap-2 tabular-nums"
          >
            <span className="truncate">{accountLabel(a.accountId)}</span>
            <span>
              {a.debit ? `Nợ ${formatAmount(a.debit)}` : ""}
              {a.credit ? `Có ${formatAmount(a.credit)}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
