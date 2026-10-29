import { useQuery } from "@tanstack/react-query";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { money } from "@/shared/utils/format";
import { BookOpen } from "lucide-react";

interface PostedAccountingSummaryProps {
  isPosted: boolean;
  journalEntryId?: string | null;
  postingDate?: string | null;
  emptyLabel?: string;
}

interface AccountAggregate {
  code: string;
  name: string;
  debit: number;
  credit: number;
}

function resolveJournalVoucherNo(
  journalEntry: any,
  journalEntryId?: string | null,
) {
  return (
    journalEntry?.voucherNo ||
    journalEntry?.voucher_no ||
    journalEntry?.entryNo ||
    journalEntry?.entry_no ||
    (journalEntryId ? journalEntryId.slice(0, 8) : "—")
  );
}

function toAccountMap(lines: any[]) {
  const accountMap: Record<string, AccountAggregate> = {};

  lines.forEach((line: any) => {
    const code =
      line?.account?.accountCode ||
      line?.account?.account_code ||
      line?.accountCode ||
      line?.account_code ||
      line?.accountId ||
      line?.account_id ||
      "—";

    if (!accountMap[code]) {
      accountMap[code] = {
        code,
        name: line?.account?.accountName || line?.account?.account_name || "",
        debit: 0,
        credit: 0,
      };
    }

    accountMap[code].debit += Number(line?.debit || 0);
    accountMap[code].credit += Number(line?.credit || 0);
  });

  return Object.values(accountMap);
}

export function PostedAccountingSummary({
  isPosted,
  journalEntryId,
  postingDate,
  emptyLabel = "Chưa có hạch toán kế toán nào.",
}: PostedAccountingSummaryProps) {
  const { data: journalEntry, isLoading } = useQuery({
    queryKey: ["journal-entry", journalEntryId],
    queryFn: () => accountingApi.getJournalEntryById(journalEntryId!),
    enabled: isPosted && !!journalEntryId,
  });

  if (!isPosted) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4 select-none">
        <div className="relative flex flex-col items-center mb-3">
          <BookOpen
            className="w-12 h-12"
            strokeWidth={1.8}
            style={{
              color: "#94a3b8",
              animation: "emptyFloat 3.5s ease-in-out infinite",
            }}
          />
          {/* Ground shadow — shrinks when icon floats up */}
          <div
            style={{
              width: 48,
              height: 7,
              marginTop: 4,
              borderRadius: "50%",
              background: "rgba(148,163,184,0.28)",
              filter: "blur(4px)",
              animation: "emptyShadow 3.5s ease-in-out infinite",
            }}
          />
        </div>
        <style>{`
          @keyframes emptyFloat {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-8px); }
          }
          @keyframes emptyShadow {
            0%, 100% { transform: scaleX(1);    opacity: 0.9; }
            50%       { transform: scaleX(0.5);  opacity: 0.4; }
          }
        `}</style>
        <p className="text-[13px] font-medium text-slate-400 text-center">
          {emptyLabel}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground">
        Đang tải dữ liệu hạch toán...
      </div>
    );
  }

  const rows = (journalEntry?.lines || []) as any[];
  const aggregates = toAccountMap(rows);
  const debitRows = aggregates.filter((acc) => acc.debit > 0);
  const creditRows = aggregates.filter((acc) => acc.credit > 0);
  const rowCount = Math.max(debitRows.length, creditRows.length, 1);
  const voucherNo = resolveJournalVoucherNo(journalEntry, journalEntryId);
  const totalDebit = debitRows.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = creditRows.reduce((sum, item) => sum + item.credit, 0);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/40 dark:bg-white/[0.02] border border-border-light dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Số phiếu:
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            {voucherNo}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Ngày:</span>
          <span className="font-mono font-medium text-foreground">
            {postingDate?.slice(0, 10) || "—"}
          </span>
        </div>
      </div>

      {aggregates.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border-light dark:border-white/[0.06] rounded-lg bg-muted/30">
          Chưa có dữ liệu bút toán.
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-lg border border-border-light dark:border-white/[0.06] bg-surface dark:bg-zinc-900/30">
          <div className="grid grid-cols-2 h-8 items-center border-b border-border-light dark:border-white/[0.05] bg-muted/50 dark:bg-white/[0.03]">
            <div className="h-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase border-r border-border-light dark:border-white/[0.04]">
              <span>NỢ</span>
              <span className="text-[10px] text-muted-foreground/70 font-normal lowercase">
                tài khoản & số tiền
              </span>
            </div>
            <div className="h-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <span>CÓ</span>
              <span className="text-[10px] text-muted-foreground/70 font-normal lowercase">
                tài khoản & số tiền
              </span>
            </div>
          </div>

          {Array.from({ length: rowCount }).map((_, index) => {
            const debit = debitRows[index];
            const credit = creditRows[index];
            return (
              <div
                key={`t-row-${index}`}
                className="grid grid-cols-2 h-[38px] border-b last:border-b-0 border-border-light/60 dark:border-white/[0.03] hover:bg-muted/40 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="h-full flex items-center justify-between px-3 text-xs border-r border-border-light dark:border-white/[0.04]">
                  {debit ? (
                    <>
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-muted/60 dark:bg-white/[0.06] text-foreground border border-border-light dark:border-white/[0.04] shrink-0"
                          title={debit.name}
                        >
                          {debit.code}
                        </span>
                        <span
                          className="text-xs text-muted-foreground truncate hidden sm:inline"
                          title={debit.name}
                        >
                          {debit.name}
                        </span>
                      </div>
                      <span className="tabular-nums font-mono font-medium text-xs text-foreground whitespace-nowrap shrink-0">
                        {money(debit.debit)}
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="h-full flex items-center justify-between px-3 text-xs">
                  {credit ? (
                    <>
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-muted/60 dark:bg-white/[0.06] text-foreground border border-border-light dark:border-white/[0.04] shrink-0"
                          title={credit.name}
                        >
                          {credit.code}
                        </span>
                        <span
                          className="text-xs text-muted-foreground truncate hidden sm:inline"
                          title={credit.name}
                        >
                          {credit.name}
                        </span>
                      </div>
                      <span className="tabular-nums font-mono font-medium text-xs text-foreground whitespace-nowrap shrink-0">
                        {money(credit.credit)}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-2 h-[38px] items-center border-t border-border-light dark:border-white/[0.06] bg-muted/30 dark:bg-zinc-900/40">
            <div className="h-full flex items-center justify-between px-3 border-r border-border-light dark:border-white/[0.04]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng Nợ:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {money(totalDebit)}
              </span>
            </div>
            <div className="h-full flex items-center justify-between px-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng Có:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {money(totalCredit)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
