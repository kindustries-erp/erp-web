import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Combobox } from "@/shared/components/Combobox";
import { Button } from "@/shared/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { money } from "@/shared/utils/format";
import { DatePicker } from "@/shared/components/DatePicker";

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface PostingLineData {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

import { type usePosting } from "./usePosting";

export interface PostingSectionProps {
  journalEntryId?: string | null;
  isPosted: boolean;

  postingState: ReturnType<typeof usePosting>;

  // Defaults for pre-fill
  defaultDate?: string;
  defaultDescription?: string;

  // We accept a function or a list of lines. If a function is provided,
  // we pass the resolved chartOfAccounts to it so it can map prefixes to IDs.
  getDefaultLines?: (
    accountOptions: { value: string; label: string }[],
  ) => PostingLineData[];

  // Validation
  validationAmount?: number;

  // Handlers
  onUnpost?: () => void;
  unposting?: boolean;
  editMode?: boolean;
  autoBalanceOnAddLine?: boolean;
}

export function PostingSection({
  journalEntryId,
  isPosted,
  postingState,
  defaultDate,
  defaultDescription,
  getDefaultLines,
  onUnpost,
  unposting,
  editMode,
  autoBalanceOnAddLine,
}: PostingSectionProps) {
  // Fetch Chart of Accounts (global, no branch required)
  const { data: chartOfAccounts, isLoading: isLoadingCoA } = useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: () => accountingApi.getChartOfAccounts(),
  });

  // Fetch Journal Entry if posted
  const { data: journalEntry } = useQuery({
    queryKey: ["journal-entry", journalEntryId],
    queryFn: () => accountingApi.getJournalEntryById(journalEntryId!),
    enabled: !!journalEntryId,
  });

  const accountOptions = useMemo(() => {
    const list = Array.isArray(chartOfAccounts)
      ? chartOfAccounts
      : chartOfAccounts?.items || [];
    return list.map((a: any) => ({
      value: a.id,
      label: `${a.accountCode} - ${a.accountName}`,
    }));
  }, [chartOfAccounts]);

  const {
    postingDate,
    setPostingDate,
    description,
    setDescription,
    lines,
    setLines,
    totalDebit,
    totalCredit,
    isBalanced,
    isDirty,
    setIsDirty,
    addLine,
    removeLine,
    updateLine,
    setAllState,
  } = postingState;

  const handleAddLine = () => {
    if (!autoBalanceOnAddLine) {
      addLine();
      return;
    }

    const diff = Number((totalDebit - totalCredit).toFixed(2));
    const amount = Math.abs(diff);
    const fallbackDesc =
      description ||
      lines.find((line) => !!line.description)?.description ||
      "";

    addLine({
      debit: diff < 0 ? amount : 0,
      credit: diff > 0 ? amount : 0,
      description: fallbackDesc,
    });
  };

  // Initialize or re-initialize data based on status
  useEffect(() => {
    if (journalEntry) {
      const lineMap = new Map();
      (journalEntry.lines || []).forEach((l: any) => {
        const accId = l.accountId || (l.account ? l.account.id : "");
        if (!lineMap.has(accId)) {
          lineMap.set(accId, {
            id: l.id || createClientId(),
            accountId: accId,
            debit: 0,
            credit: 0,
            description: l.description || "",
          });
        }
        const item = lineMap.get(accId);
        item.debit += Number(l.debit) || 0;
        item.credit += Number(l.credit) || 0;
      });

      setAllState({
        postingDate: journalEntry.entryDate?.slice(0, 10) || "",
        description: journalEntry.description || "",
        lines: Array.from(lineMap.values()),
      });
      setIsDirty(false);
    } else if (!journalEntry && !isDirty && !isLoadingCoA) {
      setPostingDate(defaultDate || new Date().toISOString().slice(0, 10));
      setDescription(defaultDescription || "");

      if (getDefaultLines) {
        setLines(getDefaultLines(accountOptions));
      }
    }
  }, [
    isPosted,
    journalEntry,
    defaultDate,
    defaultDescription,
    isDirty,
    isLoadingCoA,
    accountOptions,
    editMode,
  ]);

  // Chỉ validate cân bằng Nợ = Có, không ép phải bằng invoiceTotal (hạch toán có thể là một phần)
  // const isValid =
  //   lines.length > 0 && lines.every((l) => !!l.accountId) && isBalanced;

  // View Mode (Single T-Account)
  if (editMode === false) {
    if (!isPosted) {
      return (
        <div className="p-8 text-center text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-md">
          Chưa hạch toán
        </div>
      );
    }

    const debitLines = lines.filter((l) => l.debit > 0);
    const creditLines = lines.filter((l) => l.credit > 0);

    const resolveAccountCode = (accountId: string) => {
      const option = accountOptions.find((a: any) => a.value === accountId);
      if (!option) return accountId;
      // Extract the code from "133 - Thuế GTGT..."
      const match = option.label.split(" - ");
      return match[0] || accountId;
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 mr-2">Ngày hạch toán:</span>
            <span className="font-medium">{postingDate || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500 mr-2">Diễn giải chung:</span>
            <span className="font-medium">{description || "—"}</span>
          </div>
        </div>

        {lines.length > 0 ? (
          <div className="mt-2 flex justify-center">
            <div className="border border-gray-300 rounded-sm overflow-hidden text-sm w-full max-w-2xl shadow-sm">
              <div className="flex divide-x divide-gray-300">
                <div className="flex-1 bg-white">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-1 font-bold text-center text-gray-700 text-[13px]">
                    NỢ
                  </div>
                  <div className="px-3 py-2 min-h-[3rem] space-y-1.5">
                    {debitLines.map((l) => (
                      <div
                        key={l.id}
                        className="flex justify-between items-center text-gray-700 text-[13px]"
                      >
                        <span
                          className="font-medium truncate pr-2"
                          title={resolveAccountCode(l.accountId)}
                        >
                          {resolveAccountCode(l.accountId)}
                        </span>
                        <span className="whitespace-nowrap">
                          {money(l.debit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 bg-white">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-1 font-bold text-center text-gray-700 text-[13px]">
                    CÓ
                  </div>
                  <div className="px-3 py-2 min-h-[3rem] space-y-1.5">
                    {creditLines.map((l) => (
                      <div
                        key={l.id}
                        className="flex justify-between items-center text-gray-700 text-[13px]"
                      >
                        <span
                          className="font-medium truncate pr-2"
                          title={resolveAccountCode(l.accountId)}
                        >
                          {resolveAccountCode(l.accountId)}
                        </span>
                        <span className="whitespace-nowrap">
                          {money(l.credit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex divide-x divide-gray-300 border-t border-gray-300 bg-gray-50">
                <div className="flex-1 px-3 py-1.5 text-right">
                  <span className="font-bold text-emerald-700 text-[13px]">
                    Tổng Nợ: {totalDebit > 0 ? money(totalDebit) : "0 đ"}
                  </span>
                </div>
                <div className="flex-1 px-3 py-1.5 text-right">
                  <span className="font-bold text-emerald-700 text-[13px]">
                    Tổng Có: {totalCredit > 0 ? money(totalCredit) : "0 đ"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic mt-4">
            Chưa có dữ liệu hạch toán.
          </div>
        )}
      </div>
    );
  }

  // Edit Mode (Table)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày hạch toán
          </label>
          <DatePicker
            value={postingDate}
            onChange={(date: string) => {
              setPostingDate(date);
              setIsDirty(true);
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diễn giải chung
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setIsDirty(true);
            }}
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
          />
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left font-medium w-[30%]">
                Tài khoản
              </th>
              <th className="px-3 py-2 text-right font-medium w-[20%]">Nợ</th>
              <th className="px-3 py-2 text-right font-medium w-[20%]">Có</th>
              <th className="px-3 py-2 text-left font-medium w-[25%]">
                Diễn giải
              </th>
              <th className="px-3 py-2 w-[5%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lines.map((line: any) => (
              <tr key={line.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 max-w-[220px]">
                  <Combobox
                    options={accountOptions}
                    value={line.accountId}
                    onChange={(val) => updateLine(line.id, "accountId", val)}
                    placeholder="-- Chọn --"
                    className="w-full"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    className="w-full h-8 px-2 text-right border rounded"
                    value={
                      line.debit
                        ? new Intl.NumberFormat("vi-VN").format(line.debit)
                        : ""
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\D/g, ""));
                      updateLine(line.id, "debit", val);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    className="w-full h-8 px-2 text-right border rounded"
                    value={
                      line.credit
                        ? new Intl.NumberFormat("vi-VN").format(line.credit)
                        : ""
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\D/g, ""));
                      updateLine(line.id, "credit", val);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    className="w-full h-8 px-2 border rounded"
                    value={line.description}
                    onChange={(e) =>
                      updateLine(line.id, "description", e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                    onClick={() => removeLine(line.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t font-medium">
            <tr>
              <td className="px-3 py-2 text-right">Tổng cộng:</td>
              <td
                className={`px-3 py-2 text-right ${!isBalanced ? "text-red-600" : "text-green-600"}`}
              >
                {money(totalDebit)}
              </td>
              <td
                className={`px-3 py-2 text-right ${!isBalanced ? "text-red-600" : "text-green-600"}`}
              >
                {money(totalCredit)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddLine}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Thêm dòng
        </Button>
      </div>

      {!isPosted && !isBalanced && (
        <p className="text-sm text-red-500 mt-2">
          * Tổng Nợ và Tổng Có phải bằng nhau.
        </p>
      )}

      {isPosted && onUnpost && !editMode && (
        <div className="flex justify-end mt-4">
          <Button variant="danger" onClick={onUnpost} disabled={unposting}>
            {unposting ? "Đang xử lý..." : "Bỏ hạch toán"}
          </Button>
        </div>
      )}
    </div>
  );
}
