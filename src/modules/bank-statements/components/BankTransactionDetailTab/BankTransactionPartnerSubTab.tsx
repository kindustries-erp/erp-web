import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw, FileText, FilterX } from "lucide-react";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { toast } from "react-hot-toast";
import { money, formatGMT7 } from "@/shared/utils/format";
import { useBankTransactionPartnerLogic } from "./hooks/useBankTransactionPartnerLogic";
import { BankTransactionPartnerEmptyState } from "./components/BankTransactionPartnerEmptyState";

export interface BankTransactionPartnerSubTabProps {
  transaction: any | null;
  onSelectTransaction?: (id: string) => void;
}

const renderCopyableText = (
  text: string | null | undefined,
  tooltipLabel?: string,
) => {
  if (!text) return null;
  return (
    <Tooltip content={<div className="whitespace-pre-wrap">{text}</div>}>
      <div
        className="w-full line-clamp-2 break-words whitespace-normal cursor-pointer hover:opacity-80 active:opacity-50"
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text);
          toast.success(tooltipLabel || "Đã copy text");
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
};

export const BankTransactionPartnerSubTab = React.memo(
  function BankTransactionPartnerSubTab({
    transaction,
    onSelectTransaction,
  }: BankTransactionPartnerSubTabProps) {
    const { t } = useTranslation();
    const logic = useBankTransactionPartnerLogic({ transaction });

    const getSortState = useCallback(
      (columnKey: string) => {
        const current = logic.sorts[0];
        if (!current) return "none";
        if (current === columnKey) return "asc";
        if (current === `-${columnKey}`) return "desc";
        return "none";
      },
      [logic.sorts],
    );

    const formatAmtOption = (val: string | number) => {
      const n = Number(val || 0);
      if (isNaN(n)) return String(val);
      return n.toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    };

    const renderHeaderFilter = (columnKey: string, label: string) => {
      if (columnKey === "transDate") {
        return (
          <TableColumnHeaderFilter
            title={label}
            align="center"
            className="w-full justify-center"
            sortState={getSortState(columnKey)}
            onSortChange={(state) => logic.setSort(columnKey, state)}
            searchValue={logic.columnSearch[columnKey] || ""}
            onSearchChange={(val) => logic.setColumnSearch(columnKey, val)}
            selectedFilters={logic.columnFilters[columnKey] || []}
            onFilterChange={(vals) => logic.setColumnFilter(columnKey, vals)}
            columnKey={columnKey}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(logic.dateFrom || logic.dateTo)}
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={logic.dateFrom}
                dateTo={logic.dateTo}
                onChange={(from, to) => {
                  logic.setDateRange(from, to);
                }}
                onClose={close}
              />
            )}
          />
        );
      }

      let formatOptionLabel: ((val: string) => string) | undefined;
      if (
        ["thu", "chi", "netOffAmount", "remainingAmount"].includes(columnKey)
      ) {
        formatOptionLabel = formatAmtOption as any;
      }

      return (
        <TableColumnHeaderFilter
          title={label}
          align="center"
          className="w-full justify-center"
          sortState={getSortState(columnKey)}
          onSortChange={(state) => logic.setSort(columnKey, state)}
          searchValue={logic.columnSearch[columnKey] || ""}
          onSearchChange={(val) => logic.setColumnSearch(columnKey, val)}
          selectedFilters={logic.columnFilters[columnKey] || []}
          onFilterChange={(vals) => logic.setColumnFilter(columnKey, vals)}
          columnKey={columnKey}
          allFilters={logic.columnFilters}
          fetchOptions={logic.fetchColumnOptions}
          formatOptionLabel={formatOptionLabel}
          queryKeyPrefix={`bank-partner-options-${columnKey}`}
        />
      );
    };

    const columns = useMemo(
      () => [
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          minSize: 40,
          maxSize: 40,
          enableResizing: false,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className: "text-center w-[40px] min-w-[40px]",
          cell: (_: any, idx: number) => (
            <span className="w-full block text-center text-xs text-muted-foreground">
              {idx}
            </span>
          ),
        },
        {
          key: "transDate",
          header: renderHeaderFilter(
            "transDate",
            t("bankStatement.columns.transDate", {
              defaultValue: "Ngày GD",
            }),
          ),
          size: 110,
          cell: (row: any) => (
            <span className="text-xs font-mono">
              {formatGMT7(row.transDate, "date")}
            </span>
          ),
        },
        {
          key: "referenceNumber",
          header: renderHeaderFilter(
            "referenceNumber",
            t("bankStatement.columns.referenceNumber", {
              defaultValue: "Số tham chiếu",
            }),
          ),
          size: 150,
          cell: (row: any) => {
            const ref = row.referenceNumber || row.seqNo || "—";
            return (
              <TableText
                text={ref}
                onDrawerClick={
                  onSelectTransaction
                    ? (e) => {
                        e.stopPropagation();
                        onSelectTransaction(row.id);
                      }
                    : undefined
                }
                tooltip={ref}
                enableCopy={true}
                textClassName="font-mono text-xs font-medium text-primary hover:underline cursor-pointer"
              />
            );
          },
        },
        {
          key: "description",
          header: renderHeaderFilter(
            "description",
            t("bankStatement.columns.description", {
              defaultValue: "Diễn giải",
            }),
          ),
          size: 320,
          cell: (row: any) => renderCopyableText(row.description),
        },
        {
          key: "thu",
          header: renderHeaderFilter(
            "thu",
            t("bankStatement.columns.thu", { defaultValue: "Thu" }),
          ),
          size: 140,
          className: "text-right",
          headerClassName: "text-right",
          cell: (row: any) => {
            const credit = parseFloat(row.creditAmount) || 0;
            if (credit > 0) {
              return (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-xs">
                  +{money(credit)}
                </span>
              );
            }
            return <span className="text-muted-foreground/50 text-xs">—</span>;
          },
        },
        {
          key: "chi",
          header: renderHeaderFilter(
            "chi",
            t("bankStatement.columns.chi", { defaultValue: "Chi" }),
          ),
          size: 140,
          className: "text-right",
          headerClassName: "text-right",
          cell: (row: any) => {
            const debit = parseFloat(row.debitAmount) || 0;
            if (debit > 0) {
              return (
                <span className="text-[#ea580c] dark:text-orange-400 font-semibold font-mono text-xs">
                  -{money(debit)}
                </span>
              );
            }
            return <span className="text-muted-foreground/50 text-xs">—</span>;
          },
        },
        {
          key: "account",
          header: renderHeaderFilter(
            "account",
            t("bankStatement.columns.bankOrCash", {
              defaultValue: "Tài khoản nguồn",
            }),
          ),
          size: 170,
          cell: (row: any) => {
            const text =
              row.sourceType === "BANK"
                ? row.bankAccount?.bankName
                  ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
                  : ""
                : row.cashBook?.name || "";
            return renderCopyableText(text);
          },
        },
        {
          key: "netOffAmount",
          header: renderHeaderFilter(
            "netOffAmount",
            t("bankStatement.columns.netOffAmount", {
              defaultValue: "Đã cấn trừ",
            }),
          ),
          size: 130,
          className: "text-right",
          headerClassName: "text-right",
          cell: (row: any) => {
            const netOff = parseFloat(row.netOffAmount) || 0;
            if (netOff === 0)
              return <span className="text-muted-foreground text-xs">--</span>;
            return (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium font-mono text-xs">
                {money(netOff)}
              </span>
            );
          },
        },
        {
          key: "remainingAmount",
          header: renderHeaderFilter(
            "remainingAmount",
            t("bankStatement.columns.remainingAmount", {
              defaultValue: "Còn lại",
            }),
          ),
          size: 130,
          className: "text-right",
          headerClassName: "text-right",
          cell: (row: any) => {
            const credit = parseFloat(row.creditAmount) || 0;
            const debit = parseFloat(row.debitAmount) || 0;
            const amount = credit > 0 ? credit : debit;
            const netOff = parseFloat(row.netOffAmount) || 0;
            const remaining = amount - netOff;
            if (remaining === 0) {
              return (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs font-mono">
                  0
                </span>
              );
            }
            return (
              <span className="text-slate-700 dark:text-slate-300 font-medium text-xs font-mono">
                {money(remaining)}
              </span>
            );
          },
        },
      ],
      [logic, t, onSelectTransaction],
    );

    const summaryRow = useMemo(() => {
      if (!logic.items || logic.items.length === 0) return null;
      const totalCredit = logic.items.reduce(
        (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
        0,
      );
      const totalDebit = logic.items.reduce(
        (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
        0,
      );
      const totalNetOff = logic.items.reduce(
        (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
        0,
      );
      const totalRemaining = logic.items.reduce(
        (acc: number, curr: any) =>
          acc +
          (Math.max(
            parseFloat(curr.creditAmount) || 0,
            parseFloat(curr.debitAmount) || 0,
          ) -
            (parseFloat(curr.netOffAmount) || 0)),
        0,
      );

      return {
        transDate: null,
        thu: (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
            {money(totalCredit)}
          </span>
        ),
        chi: (
          <span className="text-[#ea580c] dark:text-orange-400 font-bold font-mono text-xs">
            {money(totalDebit)}
          </span>
        ),
        netOffAmount: (
          <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono text-xs">
            {money(totalNetOff)}
          </span>
        ),
        remainingAmount: (
          <span className="text-slate-800 dark:text-slate-200 font-bold font-mono text-xs">
            {money(totalRemaining)}
          </span>
        ),
      };
    }, [logic.items]);

    if (!logic.correspondentAccount && !logic.partnerName) {
      return <BankTransactionPartnerEmptyState />;
    }

    return (
      <div className="space-y-4 pb-4">
        <DrawerSection
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>
                {t("bankStatement.partnerTransactions", {
                  defaultValue: "Giao dịch liên quan đối tác",
                })}
              </span>
              {logic.total > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
                >
                  {logic.total}
                </Badge>
              )}
            </div>
          }
          titleExtra={
            <div className="flex items-center gap-2">
              {logic.activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logic.clearAllFilters}
                  className="h-6 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                >
                  <FilterX className="w-3 h-3 text-rose-500" />
                  <span>
                    {t("bankStatement.clearFilters", {
                      defaultValue: "Đặt lại",
                    })}{" "}
                    ({logic.activeFilterCount})
                  </span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => logic.refetch()}
                disabled={logic.isFetching}
                className="h-6 px-2 text-[11px] gap-1"
              >
                <RotateCcw
                  className={`w-3 h-3 ${logic.isFetching ? "animate-spin text-primary" : ""}`}
                />
                <span>
                  {t("bankStatement.refresh", { defaultValue: "Làm mới" })}
                </span>
              </Button>
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
        >
          <StandardTable
            variant="spreadsheet"
            items={logic.items}
            columns={columns}
            getRowKey={(row: any) =>
              row.id || `${row.transDate}-${row.referenceNumber}`
            }
            loading={logic.isFetching}
            page={logic.page}
            pageSize={logic.pageSize}
            total={logic.total}
            totalPages={logic.totalPages}
            onPage={logic.setPage}
            onPageSize={(newSize: number) => {
              logic.setPageSize(newSize);
              logic.setPage(1);
            }}
            summaryRow={summaryRow || undefined}
            emptyLabel={t("bankStatement.noTransactions", {
              defaultValue: "Không tìm thấy giao dịch nào của đối tác này",
            })}
          />
        </DrawerSection>
      </div>
    );
  },
);
