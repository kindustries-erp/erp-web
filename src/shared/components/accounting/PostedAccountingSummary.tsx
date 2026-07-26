import { useQuery } from "@tanstack/react-query";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { money } from "@/shared/utils/format";

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
      <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
        {emptyLabel}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-xs text-gray-500">Đang tải dữ liệu hạch toán...</div>
    );
  }

  const rows = (journalEntry?.lines || []) as any[];
  const aggregates = toAccountMap(rows);
  const debitRows = aggregates.filter((acc) => acc.debit > 0);
  const creditRows = aggregates.filter((acc) => acc.credit > 0);
  const rowCount = Math.max(debitRows.length, creditRows.length, 1);
  const voucherNo = resolveJournalVoucherNo(journalEntry, journalEntryId);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium mb-1 text-gray-700">
          Số phiếu nhật ký chung
        </div>
        <div className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          {voucherNo}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Ngày: {postingDate?.slice(0, 10) || "—"}
        </div>
      </div>

      {aggregates.length === 0 ? (
        <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
          Chưa có dữ liệu bút toán.
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-md border border-gray-300 bg-white">
          <div className="grid grid-cols-2 border-b border-gray-300 bg-gray-50">
            <div className="px-3 py-2 text-center text-xs font-bold tracking-wide text-gray-700 border-r border-gray-300">
              NỢ
            </div>
            <div className="px-3 py-2 text-center text-xs font-bold tracking-wide text-gray-700">
              CÓ
            </div>
          </div>

          {Array.from({ length: rowCount }).map((_, index) => {
            const debit = debitRows[index];
            const credit = creditRows[index];
            return (
              <div
                key={`t-row-${index}`}
                className="grid grid-cols-2 border-b last:border-b-0 border-gray-200"
              >
                <div className="border-r border-gray-200 px-2.5 py-2 text-xs min-h-[42px]">
                  {debit ? (
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-semibold text-gray-700"
                        title={debit.name}
                      >
                        {debit.code}
                      </span>
                      <span className="tabular-nums text-gray-700 whitespace-nowrap">
                        {money(debit.debit)}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="px-2.5 py-2 text-xs min-h-[42px]">
                  {credit ? (
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-semibold text-gray-700"
                        title={credit.name}
                      >
                        {credit.code}
                      </span>
                      <span className="tabular-nums text-gray-700 whitespace-nowrap">
                        {money(credit.credit)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-2 border-t border-gray-300 bg-gray-50">
            <div className="px-2.5 py-2 text-right text-xs font-semibold text-emerald-700 border-r border-gray-300">
              Tổng Nợ:{" "}
              {money(debitRows.reduce((sum, item) => sum + item.debit, 0))}
            </div>
            <div className="px-2.5 py-2 text-right text-xs font-semibold text-emerald-700">
              Tổng Có:{" "}
              {money(creditRows.reduce((sum, item) => sum + item.credit, 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
