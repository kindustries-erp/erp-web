import React from "react";
import {
  TableColumnHeaderFilter,
  TableSortState,
  TableColumnAlign,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { money } from "@/shared/utils/format";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  InvoiceNoCell,
  InvoicePlateCell,
} from "./GarageReconciliationInvoicesTable.cells";
import type { BuildInvoiceColumnsOptions } from "./GarageReconciliationInvoicesTable.type";

export function buildReconciliationInvoiceColumns(
  opt: BuildInvoiceColumnsOptions,
): any[] {
  const {
    invoiceDirection,
    editMode,
    isAllSelected,
    selectedMap,
    tableState,
    dateFrom,
    dateTo,
    t,
  } = opt;
  const prefix = `garage-reconciliation-invoices-${invoiceDirection.toLowerCase()}-column-options`;

  const renderFilter = (
    key: string,
    label: string,
    align = TableColumnAlign.LEFT,
    isAmount = false,
  ) => {
    const isAsc = tableState.sorts[0] === key;
    const isDesc = tableState.sorts[0] === `-${key}`;
    const sortState = isAsc
      ? TableSortState.ASC
      : isDesc
        ? TableSortState.DESC
        : TableSortState.NONE;

    return (
      <TableColumnHeaderFilter
        title={label}
        align={align}
        className="w-full justify-center"
        sortState={sortState}
        onSortChange={(state) => tableState.setSort(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => {
          tableState.setColumnSearch(key, val);
          opt.onPageReset();
        }}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => {
          tableState.setColumnFilter(key, vals);
          opt.onPageReset();
        }}
        columnKey={key}
        allFilters={tableState.columnFilters}
        queryKeyPrefix={prefix}
        enableSelectAllMatching={!isAmount}
        showBlankOption={!isAmount}
        formatOptionLabel={isAmount ? (v) => money(Number(v)) : undefined}
        fetchOptions={async ({ columnKey, search, pageParam, filtersStr }) => {
          const res = await erpInvoicesCoreApi.getColumnOptions(
            columnKey,
            search,
            pageParam,
            20,
            filtersStr,
            invoiceDirection,
          );
          return {
            items: res.items.map((i) =>
              typeof i === "string" ? { label: i, value: i } : i,
            ),
            total: res.total,
            next: res.page < res.totalPages ? res.page + 1 : null,
          };
        }}
      />
    );
  };

  const cols: any[] = [];
  if (editMode) {
    cols.push({
      key: "selection",
      header: (
        <div
          className="flex items-center justify-center p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(c: any) => opt.onSelectAll(!!c)}
          />
        </div>
      ),
      size: 40,
      className: "text-center w-[40px] min-w-[40px]",
      headerClassName: "text-center w-[40px] min-w-[40px]",
      enableResizing: false,
      cell: (inv: ErpInvoice) => (
        <div
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={!!selectedMap[inv.id]}
            onCheckedChange={() => opt.onToggle(inv)}
          />
        </div>
      ),
    });
  }

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
      key: "invoiceDate",
      header: (
        <TableColumnHeaderFilter
          title={t("cases.reconciliation.invoiceDate", "Ngày HĐ")}
          align={TableColumnAlign.CENTER}
          className="w-full justify-center"
          sortState={
            tableState.sorts[0] === "invoiceDate"
              ? TableSortState.ASC
              : tableState.sorts[0] === "-invoiceDate"
                ? TableSortState.DESC
                : TableSortState.NONE
          }
          onSortChange={(state) => tableState.setSort("invoiceDate", state)}
          searchValue=""
          onSearchChange={() => {}}
          selectedFilters={[]}
          onFilterChange={() => {}}
          hideFilter={true}
          hideFooter={true}
          isActive={Boolean(dateFrom || dateTo)}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={dateFrom || ""}
              dateTo={dateTo || ""}
              onChange={(from, to) => {
                opt.onDateFromChange(from);
                opt.onDateToChange(to);
                opt.onPageReset();
              }}
              onClose={close}
            />
          )}
        />
      ),
      size: 110,
      cell: (inv: ErpInvoice) => (
        <TableDateCell
          date={inv.invoiceDate}
          format="date"
          className="justify-end w-full font-mono text-xs text-slate-600 dark:text-slate-400"
        />
      ),
      className: "text-right",
    },
    {
      key: "invoiceNo",
      header: renderFilter(
        "invoiceNo",
        t("cases.reconciliation.invoiceNo", "Số HĐ"),
        TableColumnAlign.LEFT,
      ),
      size: 130,
      cell: (inv: ErpInvoice) => (
        <InvoiceNoCell
          inv={inv}
          onViewDetail={opt.onViewDetail}
          onPreviewPdf={opt.onPreviewPdf}
          t={t}
        />
      ),
    },
    {
      key: "serialNo",
      header: renderFilter(
        "serialNo",
        t("cases.reconciliation.serialNo", "Ký hiệu"),
        TableColumnAlign.LEFT,
      ),
      size: 95,
      cell: (inv: ErpInvoice) => (
        <span className="text-xs font-mono text-slate-500">
          {inv.serialNo || "—"}
        </span>
      ),
    },
    {
      key: "partnerName",
      header: renderFilter(
        "partnerName",
        invoiceDirection === "OUT"
          ? t("cases.reconciliation.buyerName", "Bên mua")
          : t("cases.reconciliation.sellerName", "Bên bán"),
        TableColumnAlign.LEFT,
      ),
      size: 200,
      cell: (inv: ErpInvoice) => {
        const name =
          invoiceDirection === "OUT"
            ? inv.buyerName || inv.buyerPersonalName || "—"
            : inv.sellerName || "—";
        return (
          <span
            className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate block"
            title={name}
          >
            {name}
          </span>
        );
      },
    },
    {
      key: "licensePlate",
      header: renderFilter(
        "licensePlate",
        t("cases.reconciliation.licensePlateCol", "Biển số xe"),
        TableColumnAlign.CENTER,
      ),
      size: 110,
      cell: (inv: ErpInvoice) => (
        <InvoicePlateCell licensePlate={inv.licensePlate} />
      ),
    },
    {
      key: "description",
      header: renderFilter(
        "description",
        t("cases.reconciliation.description", "Diễn giải"),
        TableColumnAlign.LEFT,
      ),
      size: 230,
      cell: (inv: ErpInvoice) => (
        <div
          className="whitespace-pre-wrap line-clamp-2 text-xs text-slate-600 dark:text-slate-300"
          title={inv.description || ""}
        >
          {inv.description || "—"}
        </div>
      ),
    },
    {
      key: "preVatAmount",
      header: renderFilter(
        "preVatAmount",
        t("cases.reconciliation.preVatAmount", "Trước GTGT"),
        TableColumnAlign.RIGHT,
        true,
      ),
      size: 120,
      cell: (inv: ErpInvoice) => (
        <span className="text-xs font-mono text-slate-700 dark:text-slate-300 tabular-nums">
          {money(inv.preVatAmount)}
        </span>
      ),
      className: "text-right",
    },
    {
      key: "vatAmount",
      header: renderFilter(
        "vatAmount",
        t("cases.reconciliation.vatAmount", "Thuế GTGT"),
        TableColumnAlign.RIGHT,
        true,
      ),
      size: 110,
      cell: (inv: ErpInvoice) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
          {money(inv.vatAmount)}
        </span>
      ),
      className: "text-right",
    },
    {
      key: "totalAmount",
      header: renderFilter(
        "totalAmount",
        t("cases.reconciliation.totalAmount", "Thành tiền"),
        TableColumnAlign.RIGHT,
        true,
      ),
      size: 130,
      cell: (inv: ErpInvoice) => (
        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
          {money(inv.totalAmount)}
        </span>
      ),
      className: "text-right",
    },
  );

  return cols;
}
