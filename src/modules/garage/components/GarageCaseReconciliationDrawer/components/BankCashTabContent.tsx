import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link2, Sparkles } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  TableColumnHeaderFilter,
  TableSortState,
  TableColumnAlign,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { FilterButton } from "@/shared/components/FilterPanel";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { NetOffInput } from "./NetOffInput";
import type { BankCashTabContentProps } from "../types";

export function BankCashTabContent({
  vouchers,
  selectedBankItems,
  selectedIds,
  netOffAmounts,
  maxAmounts,
  currentSelectedBankTotal,
  bankDataTotal,
  bankDataTotalPages,
  bankPage,
  bankPageSize,
  isLoadingBank,
  bankDateFrom,
  bankDateTo,
  bankTableState,
  onSelectBankTxn,
  onSelectAllBankTxns,
  onBankAmountChange,
  onViewBankDetail,
  onSetBankPage,
  onSetBankPageSize,
  onSetBankDateFrom,
  onSetBankDateTo,
  onNavigateToInvoiceTab,
  settlementType,
  editMode = false,
  viewPreset = "all",
  onSelectAllSuggestions,
  suggestionsCount = 0,
  sourceType = "BANK",
}: BankCashTabContentProps) {
  void selectedBankItems;
  void maxAmounts;
  void currentSelectedBankTotal;
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);

  const renderBankHeaderFilter = (
    key: string,
    label: string,
    align: TableColumnAlign = TableColumnAlign.CENTER,
  ) => {
    const isSortedAsc = bankTableState.sorts[0] === key;
    const isSortedDesc = bankTableState.sorts[0] === `-${key}`;
    const sortState: TableSortState = isSortedAsc
      ? TableSortState.ASC
      : isSortedDesc
        ? TableSortState.DESC
        : TableSortState.NONE;

    return (
      <TableColumnHeaderFilter
        title={label}
        align={align}
        className="w-full justify-center"
        sortState={sortState}
        onSortChange={(state) => bankTableState.setSort(key, state)}
        searchValue={bankTableState.columnSearch[key] || ""}
        onSearchChange={(val) => {
          bankTableState.setColumnSearch(key, val);
          onSetBankPage(1);
        }}
        selectedFilters={bankTableState.columnFilters[key] || []}
        onFilterChange={(vals) => {
          bankTableState.setColumnFilter(key, vals);
          onSetBankPage(1);
        }}
        columnKey={key}
        allFilters={bankTableState.columnFilters}
        fetchOptions={async ({ columnKey, search, pageParam, filtersStr }) =>
          bankStatementApi.getColumnOptions(
            columnKey,
            search,
            pageParam,
            20,
            filtersStr,
            sourceType,
          )
        }
        queryKeyPrefix={`garage-reconciliation-${sourceType.toLowerCase()}-column-options`}
      />
    );
  };

  const isAllBankSelected =
    vouchers.length > 0 &&
    vouchers.every((row: any) => selectedIds.includes(row.id));

  const bankColumns: any[] = useMemo(() => {
    const cols: any[] = [];

    // Chỉ khi ở chế độ Chỉnh sửa (editMode) mới thêm cột Checkbox
    if (editMode) {
      cols.push({
        key: "selection",
        header: (
          <div
            className="flex items-center justify-center p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isAllBankSelected}
              onCheckedChange={(c: any) => onSelectAllBankTxns(!!c)}
            />
          </div>
        ),
        size: 40,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (row: any) => {
          const isSelected = selectedIds.includes(row.id);
          return (
            <div
              className="flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(c: any) => onSelectBankTxn(row, !!c)}
              />
            </div>
          );
        },
        sortable: false,
      });
    }

    // Cột STT
    cols.push({
      key: "stt",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      className: "text-center w-[40px] min-w-[40px]",
      headerClassName: "text-center w-[40px] min-w-[40px]",
      enableResizing: false,
      cell: (_: any, idx: number) => (
        <span className="w-full block text-center font-mono text-xs text-muted-foreground">
          {idx}
        </span>
      ),
    });

    cols.push(
      {
        key: "account",
        header: renderBankHeaderFilter(
          "account",
          sourceType === "CASH"
            ? t("cases.reconciliation.cashFund", "Sổ quỹ")
            : t("cases.reconciliation.bankSource", "Ngân hàng"),
        ),
        size: 130,
        cell: (row: any) => (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.bankName || "---"
                : row.cashBook?.name || "Sổ quỹ tiền mặt"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {row.sourceType === "BANK"
                ? row.bankAccount?.accountNumber || "Ngân hàng"
                : "Tiền mặt"}
            </span>
          </div>
        ),
      },
      {
        key: "transDate",
        dataIndex: "transDate",
        header: (
          <TableColumnHeaderFilter
            title={t("cases.reconciliation.date", "Ngày GD")}
            align={TableColumnAlign.CENTER}
            className="w-full justify-center"
            sortState={
              bankTableState.sorts[0] === "transDate"
                ? TableSortState.ASC
                : bankTableState.sorts[0] === "-transDate"
                  ? TableSortState.DESC
                  : TableSortState.NONE
            }
            onSortChange={(state) => bankTableState.setSort("transDate", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(bankDateFrom || bankDateTo)}
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={bankDateFrom}
                dateTo={bankDateTo}
                onChange={(from, to) => {
                  onSetBankDateFrom(from);
                  onSetBankDateTo(to);
                  onSetBankPage(1);
                }}
                onClose={close}
              />
            )}
          />
        ),
        cell: (row: any) => (
          <TableDateCell
            date={row.transDate}
            format="date"
            className="justify-end w-full font-mono text-xs text-slate-600 dark:text-slate-400"
          />
        ),
        size: 110,
        className: "text-right",
        sortable: false,
      },
      {
        key: "referenceNumber",
        header: renderBankHeaderFilter(
          "referenceNumber",
          t("cases.reconciliation.refNumber", "Tham chiếu"),
          TableColumnAlign.LEFT,
        ),
        size: 150,
        cell: (row: any) => {
          const hasLinkedInvoice =
            Number(row.netOffAmount || 0) > 0 ||
            Boolean(row.invoiceNo || row.linkedInvoiceNo);
          const invoiceNo = row.invoiceNo || row.linkedInvoiceNo;

          return (
            <div className="flex items-center gap-1.5 min-w-0">
              {row.referenceNumber ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline truncate cursor-pointer text-left font-mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewBankDetail(row.id);
                  }}
                  title={row.referenceNumber}
                >
                  {row.referenceNumber}
                </button>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}

              {hasLinkedInvoice && (
                <Tooltip
                  content={
                    invoiceNo
                      ? `Đã cấn trừ với HĐ số: ${invoiceNo}. Nhấn để chuyển sang Tab Hóa đơn`
                      : "Giao dịch này đã có cấn trừ hóa đơn. Nhấn để chuyển sang Tab Hóa đơn đối soát"
                  }
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToInvoiceTab(
                        settlementType === "RECEIPT" ? "OUT" : "IN",
                        invoiceNo,
                      );
                    }}
                    className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800 shrink-0 cursor-pointer"
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    <span>{invoiceNo ? `#${invoiceNo}` : "Xem HĐ"}</span>
                  </button>
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        key: "correspondentName",
        header: renderBankHeaderFilter(
          "correspondentName",
          t("cases.reconciliation.partner", "Đối tác"),
          TableColumnAlign.LEFT,
        ),
        size: 160,
        cell: (row: any) => (
          <span
            className="text-xs text-slate-700 dark:text-slate-300 truncate block font-medium"
            title={row.correspondentName || ""}
          >
            {row.correspondentName || "—"}
          </span>
        ),
      },
      {
        key: "description",
        dataIndex: "description",
        header: renderBankHeaderFilter(
          "description",
          t("cases.reconciliation.description", "Nội dung"),
          TableColumnAlign.LEFT,
        ),
        size: 240,
        cell: (row: any) => (
          <div
            className="whitespace-pre-wrap line-clamp-2 text-xs text-slate-600 dark:text-slate-300"
            title={row.description || ""}
          >
            {row.description || "—"}
          </div>
        ),
      },
      {
        key: "thu",
        header: renderBankHeaderFilter(
          "thu",
          t("cases.reconciliation.thu", "Thu"),
          TableColumnAlign.RIGHT,
        ),
        cell: (row: any) => {
          const credit = parseFloat(row.creditAmount) || 0;
          if (credit > 0)
            return (
              <span className="text-emerald-600 font-medium font-mono">
                +{money(credit)}
              </span>
            );
          return null;
        },
        className: "text-right",
        size: 120,
        sortable: false,
      },
      {
        key: "chi",
        header: renderBankHeaderFilter(
          "chi",
          t("cases.reconciliation.chi", "Chi"),
          TableColumnAlign.RIGHT,
        ),
        cell: (row: any) => {
          const debit = parseFloat(row.debitAmount) || 0;
          if (debit > 0)
            return (
              <span className="text-[#ea580c] font-medium font-mono">
                {money(debit)}
              </span>
            );
          return null;
        },
        className: "text-right",
        size: 120,
        sortable: false,
      },
      {
        key: "netOffAmount",
        header: renderBankHeaderFilter(
          "netOffAmount",
          t("cases.reconciliation.alreadyNetOff", "Đã cấn trừ"),
          TableColumnAlign.RIGHT,
        ),
        className: "text-right",
        headerClassName: "text-center",
        size: 120,
        cell: (row: any) => {
          const netOff = parseFloat(row.netOffAmount) || 0;
          if (netOff === 0) return "--";
          return (
            <span className="text-blue-600 font-medium font-mono">
              {money(netOff)}
            </span>
          );
        },
      },
    );

    cols.push({
      key: "remainingAmount",
      header: renderBankHeaderFilter(
        "remainingAmount",
        t("cases.reconciliation.remaining", "Còn lại"),
        TableColumnAlign.RIGHT,
      ),
      className: "text-right font-semibold",
      headerClassName: "text-center",
      size: 120,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = amount - netOff;
        if (remaining === 0)
          return <span className="text-emerald-600 font-medium">0</span>;
        return (
          <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">
            {money(remaining)}
          </span>
        );
      },
    });

    cols.push({
      key: "currentNetOff",
      header: renderBankHeaderFilter(
        "currentNetOff",
        t("cases.reconciliation.netOffNow", "Cấn trừ đợt này"),
        TableColumnAlign.RIGHT,
      ),
      className: "text-right",
      headerClassName: "text-center",
      size: 150,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        if (!editMode) {
          if (netOff > 0) {
            return (
              <span className="text-blue-600 font-medium font-mono">
                {money(netOff)}
              </span>
            );
          }
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <div className="p-0.5" onClick={(e) => e.stopPropagation()}>
            <NetOffInput
              initialValue={
                netOffAmounts[row.id] !== undefined ? netOffAmounts[row.id] : ""
              }
              maxAmount={remaining}
              onChange={(val: number) => onBankAmountChange(row, val)}
            />
          </div>
        );
      },
    });

    return cols;
  }, [
    editMode,
    isAllBankSelected,
    onSelectAllBankTxns,
    selectedIds,
    onSelectBankTxn,
    sourceType,
    bankTableState,
    t,
    bankDateFrom,
    bankDateTo,
    onSetBankDateFrom,
    onSetBankDateTo,
    onSetBankPage,
    onViewBankDetail,
    onNavigateToInvoiceTab,
    settlementType,
    netOffAmounts,
    onBankAmountChange,
  ]);

  return (
    <div className="space-y-3 pb-2">
      {/* DANH SÁCH GIAO DỊCH */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              {sourceType === "CASH"
                ? t(
                    "cases.financials.cashListTitle",
                    "Danh sách Sổ quỹ tiền mặt",
                  )
                : t(
                    "cases.financials.bankListTitle",
                    "Danh sách Sao kê ngân hàng",
                  )}
            </span>
            {bankDataTotal !== undefined && (
              <span className="text-xs font-normal text-muted-foreground lowercase">
                ({bankDataTotal} {t("records", "giao dịch")})
              </span>
            )}
          </div>
        }
        titleExtra={
          <div className="flex items-center gap-2">
            {viewPreset === "suggestions" &&
              suggestionsCount >= 2 &&
              editMode &&
              onSelectAllSuggestions && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSelectAllSuggestions}
                  className="h-6 text-[11px] px-2 gap-1 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" />
                  <span>
                    {t(
                      "cases.financials.selectAllSuggestions",
                      "Chọn tất cả gợi ý ({{count}})",
                      { count: suggestionsCount },
                    )}
                  </span>
                </Button>
              )}

            {bankTableState.activeFilterCount +
              (bankDateFrom || bankDateTo ? 1 : 0) >
              0 && (
              <FilterButton
                activeCount={
                  bankTableState.activeFilterCount +
                  (bankDateFrom || bankDateTo ? 1 : 0)
                }
                onClick={() => {}}
                onClear={() => {
                  bankTableState.resetFilters();
                  onSetBankDateFrom("");
                  onSetBankDateTo("");
                  onSetBankPage(1);
                }}
              />
            )}
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        className="mb-0 p-2.5 border border-slate-200/80 dark:border-slate-800"
        bodyClassName="p-0"
      >
        <div className="h-[calc(100vh-395px)] min-h-[260px] max-h-[calc(100vh-395px)] flex flex-col overflow-hidden">
          <StandardTable
            tableId="garage-reconciliation-bank-table"
            items={vouchers}
            columns={bankColumns}
            getRowKey={(row: any) => row.id}
            variant="spreadsheet"
            enableColumnResizing={true}
            loading={isLoadingBank}
            page={bankPage}
            pageSize={bankPageSize}
            total={bankDataTotal || 0}
            totalPages={bankDataTotalPages || 0}
            onPage={onSetBankPage}
            onPageSize={onSetBankPageSize}
            minWidth={1150}
            containerClassName="flex-1 min-h-0"
          />
        </div>
      </DrawerSection>
    </div>
  );
}
