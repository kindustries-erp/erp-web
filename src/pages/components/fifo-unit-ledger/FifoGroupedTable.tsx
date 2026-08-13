import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { money } from "@/shared/utils/format";
import { TableText } from "@/shared/components/DataTable/TableText";
import { FifoDisplayRow } from "./fifoTransform";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/shared/components/ui/table";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export interface FifoGroupedTableTotals {
  inQty: number;
  outQty: number;
  inValue: number;
  outValue: number;
  stockQty: number;
  stockValue: number;
  outRevenue: number;
}

interface FifoGroupedTableProps {
  data: FifoDisplayRow[];
  onOpenInvoice: (invoiceId: string) => void;
  tableState: ReturnType<typeof useTableColumnState>;
  filterOptions: {
    inQty: { label: string; value: string }[];
    inUnitCost: { label: string; value: string }[];
    outQty: { label: string; value: string }[];
    inTotal: { label: string; value: string }[];
    outCogs: { label: string; value: string }[];
    lotBalanceQty: { label: string; value: string }[];
    lotBalanceTotal: { label: string; value: string }[];
    outPrice: { label: string; value: string }[];
    outRevenue: { label: string; value: string }[];
    outProfitMargin: { label: string; value: string }[];
  };
  totals: FifoGroupedTableTotals;
}

export function FifoGroupedTable({
  data,
  onOpenInvoice,
  tableState,
  filterOptions,
  totals,
}: FifoGroupedTableProps) {
  const { t } = useTranslation(["vinfastParts", "common"]);

  return (
    <div className="w-full overflow-x-auto max-h-[440px] overflow-y-auto border border-slate-200 rounded-md bg-white relative">
      <Table className="w-full text-sm text-left whitespace-nowrap min-w-max border-collapse">
        <TableHeader className="sticky top-0 z-10 bg-slate-50 text-slate-700 shadow-[0_1px_0_0_var(--border-light)]">
          <TableRow className="hover:bg-transparent border-b-0">
            <TableHead
              rowSpan={2}
              className="px-3 py-2 border-r border-slate-200 font-semibold text-center w-10 bg-slate-100 shadow-[0_1px_0_0_var(--border-light)]"
            >
              #
            </TableHead>
            <TableHead
              colSpan={4}
              className="px-3 py-2 border-r border-slate-200 font-semibold text-center bg-orange-50 text-orange-800 shadow-[0_1px_0_0_var(--border-light)]"
            >
              {t("vinfastParts:INBOUND_GROUP", "NHẬP KHO")}
            </TableHead>
            <TableHead
              colSpan={6}
              className="px-3 py-2 border-r border-slate-200 font-semibold text-center bg-emerald-50 text-emerald-800 shadow-[0_1px_0_0_var(--border-light)]"
            >
              {t("vinfastParts:OUTBOUND_FIFO_GROUP", "XUẤT KHO - FIFO")}
            </TableHead>
            <TableHead
              colSpan={2}
              className="px-3 py-2 font-semibold text-center bg-blue-50 text-blue-800 shadow-[0_1px_0_0_var(--border-light)]"
            >
              {t("vinfastParts:STOCK_GROUP", "TỒN KHO")}
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent border-b-0 shadow-[0_1px_0_0_var(--border-light)]">
            {/* IN */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-center bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:date", "Ngày")}
                align="center"
                hideFilter={true}
                hideFooter={true}
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["inDate"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("inDate", val)
                }
                selectedFilters={[]}
                onFilterChange={() => {}}
                dateRangeSlot={({ close }) => {
                  const val = tableState.columnSearch["inDate"] || "";
                  const [from = "", to = ""] = val.split("|");
                  return (
                    <DateRangeColumnSlot
                      dateFrom={from}
                      dateTo={to}
                      onChange={(f, t) => {
                        const next = f || t ? `${f}|${t}` : "";
                        tableState.setColumnSearch("inDate", next);
                        close();
                      }}
                    />
                  );
                }}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px] min-w-[80px] max-w-[80px]">
              <TableColumnHeaderFilter
                title={t("common:qty", "SL")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["inQty"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("inQty", val)
                }
                filterOptions={filterOptions.inQty}
                selectedFilters={tableState.columnFilters["inQty"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("inQty", vals)
                }
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:unitPrice", "Đơn giá")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["inUnitCost"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("inUnitCost", val)
                }
                filterOptions={filterOptions.inUnitCost}
                selectedFilters={tableState.columnFilters["inUnitCost"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("inUnitCost", vals)
                }
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:totalAmount", "Thành tiền")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["inTotal"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("inTotal", val)
                }
                filterOptions={filterOptions.inTotal}
                selectedFilters={tableState.columnFilters["inTotal"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("inTotal", vals)
                }
              />
            </TableHead>
            {/* OUT */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-center bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:date", "Ngày")}
                align="center"
                hideFilter={true}
                hideFooter={true}
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["outDate"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outDate", val)
                }
                selectedFilters={[]}
                onFilterChange={() => {}}
                dateRangeSlot={({ close }) => {
                  const val = tableState.columnSearch["outDate"] || "";
                  const [from = "", to = ""] = val.split("|");
                  return (
                    <DateRangeColumnSlot
                      dateFrom={from}
                      dateTo={to}
                      onChange={(f, t) => {
                        const next = f || t ? `${f}|${t}` : "";
                        tableState.setColumnSearch("outDate", next);
                        close();
                      }}
                    />
                  );
                }}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px] min-w-[80px] max-w-[80px]">
              <TableColumnHeaderFilter
                title={t("common:qty", "SL")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["outQty"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outQty", val)
                }
                filterOptions={filterOptions.outQty}
                selectedFilters={tableState.columnFilters["outQty"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outQty", vals)
                }
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:unitPrice", "Đơn giá (vốn)")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["outCogs"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outCogs", val)
                }
                filterOptions={filterOptions.outCogs}
                selectedFilters={tableState.columnFilters["outCogs"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outCogs", vals)
                }
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:sellPrice", "Đơn giá (bán)")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["outPrice"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outPrice", val)
                }
                filterOptions={filterOptions.outPrice}
                selectedFilters={tableState.columnFilters["outPrice"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outPrice", vals)
                }
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:totalAmount", "Thành tiền")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["outRevenue"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outRevenue", val)
                }
                filterOptions={filterOptions.outRevenue}
                selectedFilters={tableState.columnFilters["outRevenue"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outRevenue", vals)
                }
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:profitMargin", "% LN")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["outProfitMargin"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outProfitMargin", val)
                }
                filterOptions={filterOptions.outProfitMargin}
                selectedFilters={
                  tableState.columnFilters["outProfitMargin"] || []
                }
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outProfitMargin", vals)
                }
              />
            </TableHead>
            {/* STOCK */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-blue-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px] min-w-[80px] max-w-[80px]">
              <TableColumnHeaderFilter
                title={t("common:qty", "SL")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["lotBalanceQty"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("lotBalanceQty", val)
                }
                filterOptions={filterOptions.lotBalanceQty}
                selectedFilters={
                  tableState.columnFilters["lotBalanceQty"] || []
                }
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("lotBalanceQty", vals)
                }
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-t border-slate-200 font-medium text-right bg-blue-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title={t("common:totalAmount", "Thành tiền")}
                align="right"
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["lotBalanceTotal"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("lotBalanceTotal", val)
                }
                filterOptions={filterOptions.lotBalanceTotal}
                selectedFilters={
                  tableState.columnFilters["lotBalanceTotal"] || []
                }
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("lotBalanceTotal", vals)
                }
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={11}
                className="px-4 py-8 text-center text-slate-500 italic"
              >
                {t("common:noData", "Không có dữ liệu")}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const rowKey = row.id;
              // If it's a sub-row (not first of group), IN cells are blank
              return (
                <TableRow
                  key={rowKey}
                  className={`border-b border-slate-100 transition-colors ${
                    row.isFirstOfGroup ? "border-t-2 border-t-slate-200" : ""
                  }`}
                >
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-center text-slate-400 tabular-nums bg-white">
                    {index + 1}
                  </TableCell>

                  {/* INBOUND COLUMNS */}
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-center bg-white">
                    {row.isFirstOfGroup && row.inDate ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span>
                          {format(new Date(row.inDate), "dd/MM/yyyy")}
                        </span>
                        {row.inInvoiceNo && (
                          <TableText
                            text={row.inInvoiceNo}
                            tooltip={row.inInvoiceNo}
                            enableCopy={false}
                            onDrawerClick={() => {
                              if (row.inInvoiceId)
                                onOpenInvoice(row.inInvoiceId);
                            }}
                            className="text-xs text-slate-500 cursor-pointer justify-center w-full"
                          />
                        )}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-700 tabular-nums bg-white w-[80px] min-w-[80px] max-w-[80px]">
                    {row.isFirstOfGroup && row.inQty
                      ? row.inQty.toLocaleString()
                      : ""}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-700 tabular-nums bg-white">
                    {row.isFirstOfGroup && row.inUnitCost != null
                      ? money(row.inUnitCost)
                      : ""}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-700 tabular-nums bg-white">
                    {row.isFirstOfGroup && row.inTotal != null
                      ? money(row.inTotal)
                      : ""}
                  </TableCell>

                  {/* OUTBOUND COLUMNS */}
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-center bg-white">
                    {row.outDate ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span>
                          {format(new Date(row.outDate), "dd/MM/yyyy")}
                        </span>
                        {row.outInvoiceNo && (
                          <TableText
                            text={row.outInvoiceNo}
                            tooltip={row.outInvoiceNo}
                            enableCopy={false}
                            onDrawerClick={() => {
                              if (row.outInvoiceId)
                                onOpenInvoice(row.outInvoiceId);
                            }}
                            className="text-xs text-slate-500 cursor-pointer justify-center w-full"
                          />
                        )}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-emerald-700 tabular-nums bg-white w-[80px] min-w-[80px] max-w-[80px]">
                    {row.outQty ? row.outQty.toLocaleString() : ""}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
                    {row.outQty && row.outCogs != null
                      ? money(row.outCogs / row.outQty)
                      : ""}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-700 tabular-nums bg-white">
                    {row.outPrice != null ? money(row.outPrice) : ""}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-emerald-700 tabular-nums bg-white">
                    {row.outRevenue != null ? money(row.outRevenue) : ""}
                  </TableCell>
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
                    {row.outProfitMargin != null
                      ? `${row.outProfitMargin.toFixed(1)}%`
                      : ""}
                  </TableCell>

                  {/* STOCK COLUMNS */}
                  <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 tabular-nums bg-white w-[80px] min-w-[80px] max-w-[80px]">
                    {row.lotBalanceQty.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-semibold text-blue-700 tabular-nums bg-white">
                    {money(row.lotBalanceTotal)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        <TableFooter className="sticky bottom-0 z-10 font-semibold bg-slate-50 border-t-2 border-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <TableRow className="hover:bg-slate-50">
            <TableCell
              colSpan={2}
              className="px-3 py-3 border-r border-slate-200 text-right uppercase text-slate-700"
            >
              {t("common:total", "Tổng cộng")}
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-slate-700 bg-orange-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px] min-w-[80px] max-w-[80px]">
              <span className="underline">{totals.inQty.toLocaleString()}</span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-orange-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-slate-700 bg-orange-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.inValue)}</span>
            </TableCell>

            {/* OUTBOUND FOOTER */}
            <TableCell className="px-3 py-2 border-r border-slate-200 text-center font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px] min-w-[80px] max-w-[80px]">
              <span className="underline">
                {totals.outQty.toLocaleString()}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.outRevenue)}</span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]">
              {totals.outRevenue > 0 ? (
                <span className="underline">
                  {(
                    ((totals.outRevenue - totals.outValue) /
                      totals.outRevenue) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              ) : null}
            </TableCell>

            {/* STOCK FOOTER */}
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 bg-blue-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px] min-w-[80px] max-w-[80px]">
              <span className="underline">
                {totals.stockQty.toLocaleString()}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2 text-right font-semibold text-blue-700 bg-blue-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.stockValue)}</span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
