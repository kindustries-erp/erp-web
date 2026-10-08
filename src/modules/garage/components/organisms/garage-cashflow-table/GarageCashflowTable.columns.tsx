import React from "react";
import { Landmark, Wallet, CreditCard, Banknote, FileText } from "lucide-react";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import type { DataTableColumn } from "@/shared/components/DataTable/types";
import { formatNumber } from "@/modules/garage/components/organisms/garage-case-preview/GarageCasePreview.helper";
import type { GarageCashflowItem } from "@/modules/garage/api/garageCashflowApi";
import type { ColumnContext } from "./GarageCashflowTable.type";

export function buildGarageCashflowColumns(
  ctx: ColumnContext,
): DataTableColumn<GarageCashflowItem>[] {
  const {
    t,
    tableState,
    dateRanges,
    onDateRangeChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    fetchCashflowColumnOptions,
    onOpenCase,
  } = ctx;

  const commonOptionProps = {
    queryKeyPrefix: "garage-cashflow-column-options",
    fetchOptions: fetchCashflowColumnOptions,
    allFilters: tableState.columnFilters,
    enableSelectAllMatching: true,
  };

  const getSort = (key: string) =>
    tableState.sorts.includes(key)
      ? "asc"
      : tableState.sorts.includes(`-${key}`)
        ? "desc"
        : "none";

  const makeHdr = (
    key: string,
    title: string,
    opts: {
      align?: "left" | "center" | "right";
      hideFilter?: boolean;
      dateRangeSlot?: (props: { close: () => void }) => React.ReactNode;
      isActive?: boolean;
    } = {},
  ) => (
    <TableColumnHeaderFilter
      title={title}
      columnKey={key}
      sortState={getSort(key)}
      onSortChange={(state) => onSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => onSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => onFilterChange(key, vals)}
      align={opts.align || "center"}
      hideFilter={opts.hideFilter}
      dateRangeSlot={opts.dateRangeSlot}
      isActive={opts.isActive}
      {...(!opts.hideFilter ? commonOptionProps : {})}
    />
  );

  return [
    {
      key: "stt",
      header: "#",
      size: 40,
      cell: (_item, index) => (
        <div className="text-center text-xs text-muted-foreground">{index}</div>
      ),
    },
    {
      key: "transDate",
      header: makeHdr(
        "transDate",
        t("cases.cashflow.colDate", "Ngày phát sinh"),
        {
          hideFilter: true,
          isActive: Boolean(
            dateRanges["transDate"]?.from || dateRanges["transDate"]?.to,
          ),
          dateRangeSlot: ({ close }) => (
            <DateRangeColumnSlot
              dateFrom={dateRanges["transDate"]?.from || ""}
              dateTo={dateRanges["transDate"]?.to || ""}
              onChange={(from, to) => {
                onDateRangeChange("transDate", { from, to });
                close();
              }}
              onClose={close}
            />
          ),
        },
      ),
      size: 115,
      cell: (item) => (
        <div className="text-xs font-mono text-muted-foreground text-center">
          {item.transDate || "---"}
        </div>
      ),
    },
    {
      key: "settlementType",
      header: makeHdr(
        "settlementType",
        t("cases.cashflow.colType", "Loại thu/chi"),
      ),
      size: 115,
      cell: (item) => {
        const isReceipt = item.settlementType === "RECEIPT";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
              isReceipt
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            }`}
          >
            {isReceipt ? (
              <Landmark className="w-3 h-3" />
            ) : (
              <Wallet className="w-3 h-3" />
            )}
            {isReceipt
              ? t("cases.cashflow.receipt", "Thu tiền")
              : t("cases.cashflow.payment", "Chi tiền")}
          </span>
        );
      },
    },
    {
      key: "paymentMethod",
      header: makeHdr(
        "paymentMethod",
        t("cases.cashflow.colMethod", "Hình thức"),
      ),
      size: 120,
      cell: (item) => {
        const isBank = item.paymentMethod === "BANK_TRANSFER";
        const isPos = item.paymentMethod === "POS";
        return (
          <div className="flex items-center gap-1.5 text-xs">
            {isBank ? (
              <Landmark className="w-3 h-3 text-emerald-600" />
            ) : isPos ? (
              <CreditCard className="w-3 h-3 text-amber-600" />
            ) : (
              <Banknote className="w-3 h-3 text-muted-foreground" />
            )}
            <span>
              {isBank
                ? t("cases.cashflow.methodBank", "Chuyển khoản")
                : isPos
                  ? t("cases.cashflow.methodPos", "Quẹt thẻ POS")
                  : t("cases.cashflow.methodCash", "Tiền mặt")}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      header: makeHdr(
        "amount",
        t("cases.cashflow.colAmount", "Số tiền (VNĐ)"),
        { align: "right" },
      ),
      size: 130,
      className: "text-right",
      cell: (item) => {
        const isReceipt = item.settlementType === "RECEIPT";
        return (
          <div
            className={`text-right text-xs font-semibold tabular-nums ${isReceipt ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}
          >
            {isReceipt ? "+" : "-"}
            {formatNumber(Number(item.amount || 0))} ₫
          </div>
        );
      },
    },
    {
      key: "partnerName",
      header: makeHdr(
        "partnerName",
        t("cases.cashflow.colPartner", "Người nộp / nhận"),
        { align: "left" },
      ),
      size: 160,
      cell: (item) => (
        <TableText
          text={item.partnerName || "---"}
          className="text-xs font-medium"
        />
      ),
    },
    {
      key: "caseCode",
      header: makeHdr(
        "caseCode",
        t("cases.cashflow.colCase", "Số phiếu dịch vụ"),
      ),
      size: 150,
      cell: (item) => {
        if (!item.caseCode)
          return (
            <span className="text-xs text-muted-foreground italic">
              {t("cases.cashflow.noCase", "Chi phí chung")}
            </span>
          );
        return (
          <button
            type="button"
            onClick={() =>
              item.caseId && onOpenCase?.(item.caseId, item.caseCode!)
            }
            className="flex flex-col items-start hover:underline text-left text-xs text-foreground font-semibold"
          >
            <span className="flex items-center gap-1 text-primary">
              <FileText className="w-3 h-3" />
              {item.caseCode}
            </span>
            {item.licensePlate && (
              <span className="text-[10px] text-muted-foreground">
                {item.licensePlate}
              </span>
            )}
          </button>
        );
      },
    },
    {
      key: "bankTransaction",
      header: makeHdr(
        "bankTransaction",
        t("cases.cashflow.colBankTxn", "Sao kê tham chiếu"),
        { hideFilter: true },
      ),
      size: 180,
      cell: (item) => {
        const bt = item.bankTransaction;
        if (!bt)
          return <span className="text-xs text-muted-foreground/60">---</span>;
        return (
          <div className="flex flex-col text-xs text-muted-foreground max-w-[180px]">
            <span className="truncate font-mono text-[11px] text-foreground">
              {bt.description || "GD Ngân hàng"}
            </span>
            <span className="text-[10px] tabular-nums">
              {formatNumber(bt.amount)} ₫ • {bt.transDate || ""}
            </span>
          </div>
        );
      },
    },
    {
      key: "receiptNumber",
      header: makeHdr(
        "receiptNumber",
        t("cases.cashflow.colReceipt", "Số chứng từ"),
      ),
      size: 120,
      cell: (item) => (
        <span className="text-xs font-mono">{item.receiptNumber || "---"}</span>
      ),
    },
    {
      key: "note",
      header: makeHdr("note", t("cases.cashflow.colNote", "Ghi chú"), {
        align: "left",
      }),
      size: 180,
      cell: (item) => (
        <TableText
          text={item.note || "---"}
          className="text-xs text-muted-foreground"
        />
      ),
    },
  ];
}
