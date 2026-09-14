import React, { useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  type DataTableColumn,
  createColumnHeaderFilter,
  TableColumnAlign,
} from "@/shared/components/DataTable";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

interface AllBankTransactionsTableProps {
  vouchers: any[];
  isLoading: boolean;
  selectedIds: string[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  dateFrom: string;
  dateTo: string;
  tableState: any;
  setPage: (p: number) => void;
  setPageSize: (ps: number) => void;
  onToggleRow: (row: any) => void;
  onViewDetail: (id: string) => void;
  setDateRange?: (from?: string, to?: string) => void;
}

export function AllBankTransactionsTable({
  vouchers,
  isLoading,
  selectedIds,
  page,
  pageSize,
  total,
  totalPages,
  dateFrom,
  dateTo,
  tableState,
  setPage,
  setPageSize,
  onToggleRow,
  onViewDetail,
  setDateRange,
}: AllBankTransactionsTableProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  const listHook = useMemo(
    () => ({
      ...tableState,
      dateFrom,
      dateTo,
      setDateRange: (from?: string, to?: string) => {
        if (setDateRange) {
          setDateRange(from, to);
        }
        setPage(1);
      },
      setSort: (key: string, state: any) => {
        tableState.setSort(key, state);
        setPage(1);
      },
      setColumnFilter: (key: string, vals: string[]) => {
        tableState.setColumnFilter(key, vals);
        setPage(1);
      },
      setColumnSearch: (key: string, val: string) => {
        tableState.setColumnSearch(key, val);
        setPage(1);
      },
    }),
    [tableState, dateFrom, dateTo, setDateRange, setPage],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: "voucher-netoff-bank-column-options",
        fetchOptions: ({
          columnKey,
          search,
          pageParam,
          pageSize: optPageSize,
          filtersStr,
        }) =>
          bankStatementApi.getColumnOptions(
            columnKey,
            search,
            pageParam,
            optPageSize || 20,
            filtersStr,
          ),
      }),
    [listHook],
  );

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "selection",
        header: "",
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (row) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedIds.includes(row.id)}
              onCheckedChange={() => onToggleRow(row)}
            />
          </div>
        ),
      },
      {
        key: "source",
        header: headerFilter(
          "source",
          t("selectedBankTable.colSource", "Nguồn"),
          {
            align: TableColumnAlign.LEFT,
          },
        ),
        size: 130,
        enableResizing: true,
        cell: (row) => (
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.bankName ||
                  row.bankName ||
                  t("selectedBankTable.sourceBank", "Ngân hàng")
                : row.cashBook?.name ||
                  t("selectedBankTable.sourceCash", "Sổ quỹ")}
            </span>
            <span className="text-[10.5px] text-muted-foreground font-mono truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.accountNumber || row.accountNumber || ""
                : t("selectedBankTable.cash", "Tiền mặt")}
            </span>
          </div>
        ),
      },
      {
        key: "transDate",
        header: headerFilter.date(
          "transDate",
          t("selectedBankTable.colTransDate", "Ngày GD"),
          {
            align: "center",
            className: "w-full justify-center",
          },
        ),
        size: 105,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (row) =>
          row.transDate ? format(new Date(row.transDate), "dd/MM/yyyy") : "—",
      },
      {
        key: "referenceNumber",
        header: headerFilter(
          "referenceNumber",
          t("selectedBankTable.colRef", "Tham chiếu"),
          {
            align: TableColumnAlign.LEFT,
            showBlankOption: true,
          },
        ),
        size: 180,
        enableResizing: true,
        cell: (row) =>
          row.referenceNumber ? (
            <Tooltip
              content={t("selectedBankTable.tooltipRef", {
                ref: row.referenceNumber,
                defaultValue: `Số tham chiếu: ${row.referenceNumber}`,
              })}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(row.id);
                }}
                className="font-mono font-semibold text-primary hover:underline cursor-pointer text-xs truncate max-w-full block text-left"
              >
                {row.referenceNumber}
              </button>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          ),
      },
      {
        key: "partnerName",
        header: headerFilter(
          "partnerName",
          t("selectedBankTable.colPartner", "Đối tác"),
          {
            align: TableColumnAlign.LEFT,
            showBlankOption: true,
          },
        ),
        size: 180,
        enableResizing: true,
        cell: (row) => {
          const name = row.partnerName || row.correspondentName;
          return name ? (
            <Tooltip content={name}>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-full">
                {name}
              </div>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        },
      },
      {
        key: "description",
        header: headerFilter(
          "description",
          t("selectedBankTable.colDescription", "Nội dung"),
          {
            align: TableColumnAlign.LEFT,
            showBlankOption: true,
          },
        ),
        size: 300,
        enableResizing: true,
        cell: (row) => (
          <Tooltip content={row.description || "—"}>
            <div className="text-xs text-slate-600 dark:text-slate-300 truncate cursor-default max-w-full">
              {row.description || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "creditAmount",
        header: headerFilter.amount(
          "creditAmount",
          t("selectedBankTable.natureCredit", "Thu"),
          {
            align: TableColumnAlign.RIGHT,
          },
        ),
        size: 130,
        enableResizing: true,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const val = parseFloat(row.creditAmount) || 0;
          return val > 0 ? (
            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
              +{money(val)}
            </span>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        },
      },
      {
        key: "debitAmount",
        header: headerFilter.amount(
          "debitAmount",
          t("selectedBankTable.natureDebit", "Chi"),
          {
            align: TableColumnAlign.RIGHT,
          },
        ),
        size: 130,
        enableResizing: true,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const val = parseFloat(row.debitAmount) || 0;
          return val > 0 ? (
            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
              {money(val)}
            </span>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        },
      },
      {
        key: "netOffAmount",
        header: headerFilter.amount(
          "netOffAmount",
          t("selectedBankTable.colNetOffAmount", "Đã cấn trừ"),
          {
            align: TableColumnAlign.RIGHT,
            showBlankOption: true,
          },
        ),
        size: 120,
        enableResizing: true,
        headerClassName: "text-right",
        className: "text-right font-mono text-xs text-muted-foreground",
        cell: (row) => {
          const val = parseFloat(row.netOffAmount) || 0;
          return val > 0 ? money(val) : "—";
        },
      },
    ],
    [selectedIds, headerFilter, t, onToggleRow, onViewDetail],
  );

  const summaryRow = useMemo(() => {
    const totalCredit = vouchers.reduce(
      (sum: number, v: any) => sum + (parseFloat(v.creditAmount) || 0),
      0,
    );
    const totalDebit = vouchers.reduce(
      (sum: number, v: any) => sum + (parseFloat(v.debitAmount) || 0),
      0,
    );
    return {
      creditAmount: (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
          +{money(totalCredit)}
        </span>
      ),
      debitAmount: (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
          {money(totalDebit)}
        </span>
      ),
    };
  }, [vouchers]);

  return (
    <div className="h-[calc(100vh-320px)] min-h-[300px] flex flex-col">
      <StandardTable
        tableId="voucher-netoff-selection-table"
        items={vouchers}
        columns={columns}
        getRowKey={(row: any) => row.id}
        variant="spreadsheet"
        enableColumnResizing={true}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={setPageSize}
        summaryRow={summaryRow}
        minWidth={1150}
        containerClassName="flex-1 min-h-0"
      />
    </div>
  );
}
