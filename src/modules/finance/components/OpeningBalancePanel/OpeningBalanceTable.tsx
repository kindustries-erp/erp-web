import { cn } from "@/shared/utils";
import { formatGMT7 } from "@/shared/utils/format";
import { Panel } from "@/shared/components/Panel";
import { Skeleton } from "@/shared/components/Skeleton";
import type {
  OpeningBalance,
  CashFund,
} from "@/modules/finance/api/financeApi";
import type {
  ChartOfAccount,
  CompanyBankAccount,
} from "@/modules/accounting/api/catalogApi";
import { fmt, IconEdit, IconPlus, IconTrash } from "./helpers";

export function OpeningBalanceTable(props: any) {
  const {
    t,
    type,
    items,
    loading,
    fetchError,
    coaItems,
    funds,
    bankAccounts,
    onAdd,
    onEdit,
    onDelete,
  } = props as {
    t: any;
    type: "CASH" | "BANK";
    items: OpeningBalance[];
    loading: boolean;
    fetchError: string | null;
    coaItems: ChartOfAccount[];
    funds: CashFund[];
    bankAccounts: CompanyBankAccount[];
    onAdd: () => void;
    onEdit: (b: OpeningBalance) => void;
    onDelete: (b: OpeningBalance) => void;
  };
  const coaLabel = (id: string) => {
    const c = coaItems.find((x) => x.id === id);
    return c ? `${c.account_code} — ${c.account_name}` : id || "—";
  };
  const label4thCol = type === "CASH" ? "Quỹ" : "Ngân hàng";
  return (
    <Panel
      title={t("voucher.openingBalance.title")}
      extra={
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:opacity-70 transition-opacity cursor-pointer"
        >
          <IconPlus /> {t("voucher.openingBalance.addBtn")}
        </button>
      }
    >
      <div className="overflow-x-auto rounded-[8px] border border-border">
        <table className="w-full border-collapse" style={{ minWidth: 580 }}>
          <thead>
            <tr>
              {[
                t("voucher.openingBalance.colPeriod"),
                t("voucher.openingBalance.colDate"),
                t("voucher.openingBalance.colAcc"),
                label4thCol,
                t("voucher.openingBalance.colDebit"),
                t("voucher.openingBalance.colCredit"),
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]",
                    i === 6 && "w-[60px]",
                    (i === 4 || i === 5) && "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}>
                  {[16, 20, 36, 24, 20, 20, 0].map((w, j) => (
                    <td
                      key={j}
                      className="px-[10px] py-[10px] border-b border-[color:var(--border-light)]"
                    >
                      {w > 0 && <Skeleton className={`h-3 w-${w}`} />}
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && fetchError && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-xs text-[color:var(--warn-fg)] py-6"
                >
                  {fetchError}
                </td>
              </tr>
            )}
            {!loading && !fetchError && items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-xs text-[color:var(--faint)] py-6"
                >
                  {t("voucher.openingBalance.noData")}
                </td>
              </tr>
            )}
            {items.map((b) => (
              <tr key={b.id} className="hover:bg-surface-hover">
                <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] font-mono text-[color:var(--muted-fg)]">
                  {b.fiscal_period}
                </td>
                <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  {formatGMT7(b.balance_date, "date")}
                </td>
                <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)]">
                  {coaLabel(b.account_id)}
                </td>
                <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)]">
                  {type === "CASH"
                    ? (funds.find((f) => f.id === b.cash_fund_id)?.fund_name ??
                      "—")
                    : (bankAccounts.find(
                        (a) => a.id === b.company_bank_account_id,
                      )?.bank_name ?? "—")}
                </td>
                <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] text-right font-mono text-[color:var(--approve-fg)]">
                  {fmt(b.debit_amount)}
                </td>
                <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] text-right font-mono">
                  {fmt(b.credit_amount)}
                </td>
                <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)]">
                  <div className="flex gap-[5px] justify-end">
                    <button
                      title={t("voucher.table.btnEdit")}
                      onClick={() => onEdit(b)}
                      className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
                    >
                      <IconEdit />
                    </button>
                    <button
                      title={t("voucher.table.btnDelete")}
                      onClick={() => onDelete(b)}
                      className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
