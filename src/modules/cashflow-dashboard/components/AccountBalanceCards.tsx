import { Skeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { useT } from "@/core/i18n";

export interface AccountBalanceCardProps {
  label: string;
  openingBalance?: number;
  totalCredit?: number;
  totalDebit?: number;
  currentBalance?: number;
  loading?: boolean;
}

export function AccountBalanceCard({
  label,
  openingBalance = 0,
  totalCredit = 0,
  totalDebit = 0,
  currentBalance = 0,
  loading,
}: AccountBalanceCardProps) {
  const t = useT();

  return (
    <div className="bg-surface border border-border rounded-xl card-shadow p-3 max-[480px]:p-2 flex flex-col justify-between">
      <div className="text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-2 text-[10px] truncate">
        {label}
      </div>

      {loading ? (
        <div className="space-y-2 mb-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-5 w-full rounded mt-2" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-[12px] mb-1">
            <span className="text-[color:var(--muted-fg)]">
              {t("cashflow.openingBalance", "Đầu kỳ")}:
            </span>
            <span className="font-medium text-foreground">
              {money(openingBalance)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[12px] mb-1">
            <span className="text-[color:var(--muted-fg)]">
              {t("cashflow.periodCredit", "Thu trong kỳ")}:
            </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              +{money(totalCredit)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[12px] mb-2">
            <span className="text-[color:var(--muted-fg)]">
              {t("cashflow.periodDebit", "Chi trong kỳ")}:
            </span>
            <span className="font-medium text-[#ea580c] dark:text-orange-400">
              -{money(totalDebit)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-2 mt-auto">
            <span className="text-[10px] font-semibold text-[color:var(--muted-fg)] uppercase">
              {t("cashflow.closingBalance", "Cuối kỳ")}:
            </span>
            <span className="font-bold text-[16px] text-foreground">
              {money(currentBalance)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export function AccountBalanceCards({
  bankAccounts = [],
  cashBooks = [],
  loading = false,
}: {
  bankAccounts: any[];
  cashBooks: any[];
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
      {bankAccounts.map((acc: any) => (
        <AccountBalanceCard
          key={acc.id}
          loading={loading}
          label={`${acc.bankName || acc.bankCode} - ${acc.accountNumber}`}
          openingBalance={acc.openingBalance}
          totalCredit={acc.totalCredit}
          totalDebit={acc.totalDebit}
          currentBalance={acc.currentBalance}
        />
      ))}
      {cashBooks.map((book: any) => (
        <AccountBalanceCard
          key={book.id}
          loading={loading}
          label={book.name}
          openingBalance={book.openingBalance}
          totalCredit={book.totalCredit}
          totalDebit={book.totalDebit}
          currentBalance={book.currentBalance}
        />
      ))}
    </div>
  );
}
