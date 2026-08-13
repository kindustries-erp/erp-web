import React from "react";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { Loader2 } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";

interface PartnerTransactionsPopoverProps {
  correspondentAccount?: string;
  correspondentName?: string;
  globalStartDate?: string;
  globalEndDate?: string;
  globalBranchId?: string;
}

export function PartnerTransactionsPopover({
  correspondentAccount,
  correspondentName,
  globalStartDate,
  globalEndDate,
  globalBranchId,
}: PartnerTransactionsPopoverProps) {
  const { data: tableData, isFetching } = useQuery({
    queryKey: [
      "partner-transactions-popover",
      correspondentAccount,
      correspondentName,
      globalStartDate,
      globalEndDate,
      globalBranchId,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page: 1,
        pageSize: 100, // get up to 100 recent transactions
        sortBy: "transDate",
        sortOrder: "DESC",
        startDate: globalStartDate,
        endDate: globalEndDate,
        branchId: globalBranchId,
        correspondentAccount,
        correspondentName,
      }),
    enabled: !!correspondentAccount || !!correspondentName,
  });

  const renderCopyableText = (text: string | null | undefined) => {
    if (!text) return "—";
    return (
      <Tooltip content={<div className="whitespace-pre-wrap">{text}</div>}>
        <div className="w-full line-clamp-2 break-words whitespace-normal">
          {text}
        </div>
      </Tooltip>
    );
  };

  const items = tableData?.items || [];

  const totalDebit = items.reduce(
    (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
    0,
  );
  const totalCredit = items.reduce(
    (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
    0,
  );

  return (
    <div className="p-3 max-h-[400px] max-w-[800px] w-[800px] max-w-[90vw] overflow-auto">
      <h4 className="font-semibold text-sm mb-3 text-slate-800">
        Danh sách giao dịch:{" "}
        {correspondentName || correspondentAccount || "Khác"}
      </h4>
      {isFetching ? (
        <div className="flex justify-center items-center h-[200px] text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Đang tải dữ liệu...
        </div>
      ) : items.length > 0 ? (
        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead className="bg-slate-50 sticky top-0 shadow-[0_1px_0_0_var(--border-light)] z-10">
            <tr>
              <th className="px-2 py-2 border-b border-slate-200 text-slate-600 font-medium">
                TÀI KHOẢN
              </th>
              <th className="px-2 py-2 border-b border-slate-200 text-slate-600 font-medium">
                NGÀY GD
              </th>
              <th className="px-2 py-2 border-b border-slate-200 text-slate-600 font-medium">
                SỐ THAM CHIẾU
              </th>
              <th className="px-2 py-2 border-b border-slate-200 text-slate-600 font-medium w-[250px]">
                DIỄN GIẢI
              </th>
              <th className="px-2 py-2 border-b border-slate-200 text-slate-600 font-medium text-right">
                THU
              </th>
              <th className="px-2 py-2 border-b border-slate-200 text-slate-600 font-medium text-right">
                CHI
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row: any) => {
              const accountText =
                row.sourceType === "BANK"
                  ? row.bankAccount?.bankName
                    ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
                    : ""
                  : row.cashBook?.name || "";

              const credit = parseFloat(row.creditAmount) || 0;
              const debit = parseFloat(row.debitAmount) || 0;

              return (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-2 py-2 whitespace-normal break-words max-w-[150px]">
                    {renderCopyableText(accountText)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {formatGMT7(row.transDate, "date")}
                  </td>
                  <td className="px-2 py-2 whitespace-normal break-words font-medium text-primary max-w-[150px]">
                    {row.referenceNumber || "—"}
                  </td>
                  <td className="px-2 py-2 whitespace-normal break-words max-w-[250px]">
                    {renderCopyableText(row.description)}
                  </td>
                  <td className="px-2 py-2 text-right whitespace-nowrap">
                    {credit > 0 ? (
                      <span className="text-emerald-600 font-medium">
                        +{money(credit)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-2 text-right whitespace-nowrap">
                    {debit > 0 ? (
                      <span className="text-[#ea580c] font-medium">
                        {money(debit)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 sticky bottom-0 shadow-[0_-1px_0_0_var(--border-light)] z-10">
            <tr>
              <td
                colSpan={4}
                className="px-2 py-2 font-semibold text-right text-slate-700 border-t border-slate-200"
              >
                Tổng cộng
              </td>
              <td className="px-2 py-2 font-semibold text-right text-slate-700 border-t border-slate-200">
                {totalCredit > 0 ? (
                  <span className="text-emerald-600">
                    +{money(totalCredit)}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-2 py-2 font-semibold text-right text-slate-700 border-t border-slate-200">
                {totalDebit > 0 ? (
                  <span className="text-[#ea580c]">{money(totalDebit)}</span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div className="text-slate-500 text-sm italic text-center py-8">
          Không có dữ liệu giao dịch.
        </div>
      )}
    </div>
  );
}
