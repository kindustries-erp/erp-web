import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { money } from "@/shared/utils/format";
import { TableText } from "@/shared/components/DataTable/TableText";
import { LedgerDisplayRow } from "./fifoTransform";
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

export interface FifoFlatTableTotals {
  inQty: number;
  outQty: number;
  inValue: number;
  outValue: number;
  outRevenue: number;
  outProfit: number;
}

interface FifoFlatTableProps {
  data: LedgerDisplayRow[];
  onOpenInvoice: (invoiceId: string) => void;
  tableState: ReturnType<typeof useTableColumnState>;
  totals: FifoFlatTableTotals;
}

export function FifoFlatTable({
  data,
  onOpenInvoice,
  tableState,
  totals,
}: FifoFlatTableProps) {
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
              colSpan={3}
              className="px-3 py-2 border-r border-slate-200 font-semibold text-center bg-slate-100 shadow-[0_1px_0_0_var(--border-light)]"
            >
              THÔNG TIN CHUNG
            </TableHead>
            <TableHead
              colSpan={3}
              className="px-3 py-2 border-r border-slate-200 font-semibold text-center bg-orange-50 text-orange-800 shadow-[0_1px_0_0_var(--border-light)]"
            >
              {t("vinfastParts:INBOUND_GROUP", "NHẬP KHO")}
            </TableHead>
            <TableHead
              colSpan={3}
              className="px-3 py-2 border-r border-slate-200 font-semibold text-center bg-emerald-50 text-emerald-800 shadow-[0_1px_0_0_var(--border-light)]"
            >
              {t("vinfastParts:OUTBOUND_FIFO_GROUP", "XUẤT KHO - FIFO")}
            </TableHead>
            <TableHead
              colSpan={2}
              className="px-3 py-2 border-r border-slate-200 font-semibold text-center bg-blue-50 text-blue-800 shadow-[0_1px_0_0_var(--border-light)]"
            >
              {t("vinfastParts:STOCK_GROUP", "TỒN KHO")}
            </TableHead>
            <TableHead
              colSpan={7}
              className="px-3 py-2 font-semibold text-center bg-purple-50 text-purple-800 shadow-[0_1px_0_0_var(--border-light)]"
            >
              HIỆU QUẢ KINH DOANH
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent border-b-0 shadow-[0_1px_0_0_var(--border-light)]">
            {/* THONG TIN CHUNG */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-center bg-slate-50 shadow-[0_1px_0_0_var(--border-light)] min-w-[100px]">
              <TableColumnHeaderFilter
                title={t("common:date", "Ngày")}
                align="center"
                hideFilter={true}
                hideSort={true}
                sortState="none"
                onSortChange={() => {}}
                searchValue={tableState.columnSearch["transactionDate"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("transactionDate", val)
                }
                selectedFilters={[]}
                onFilterChange={() => {}}
                dateRangeSlot={({ close }) => {
                  const val = tableState.columnSearch["transactionDate"] || "";
                  const [from = "", to = ""] = val.split("|");
                  return (
                    <DateRangeColumnSlot
                      dateFrom={from}
                      dateTo={to}
                      onChange={(f, t) => {
                        const next = f || t ? `${f}|${t}` : "";
                        tableState.setColumnSearch("transactionDate", next);
                        close();
                      }}
                    />
                  );
                }}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-center bg-slate-50 shadow-[0_1px_0_0_var(--border-light)]">
              Số HĐ
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-center bg-slate-50 shadow-[0_1px_0_0_var(--border-light)] min-w-[200px]">
              Đối tác
            </TableHead>

            {/* IN */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              SL
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Đơn giá
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Thành tiền
            </TableHead>

            {/* OUT */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              SL
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Đơn giá
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Thành tiền
            </TableHead>

            {/* BALANCE */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-blue-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              SL
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-blue-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Thành tiền
            </TableHead>

            {/* PERFORMANCE */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              SL
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Đơn giá mua
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Giá mua
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Đơn giá bán
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Giá bán
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              Lợi nhuận
            </TableHead>
            <TableHead className="px-3 py-2 border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              % LN
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={17}
                className="text-center py-6 text-slate-500"
              >
                {t("common:noData", "Không có dữ liệu")}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={row.id} className="hover:bg-slate-50 group">
                <TableCell className="px-3 py-2 border-r border-slate-200 text-center text-slate-400">
                  {i + 1}
                </TableCell>

                {/* THÔNG TIN CHUNG */}
                <TableCell className="px-3 py-2 border-r border-slate-200 text-center bg-white">
                  {row.transactionDate
                    ? format(new Date(row.transactionDate), "dd/MM/yyyy")
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-center bg-white">
                  {row.invoiceNo && (
                    <TableText
                      text={row.invoiceNo}
                      tooltip={row.invoiceNo}
                      enableCopy={false}
                      onDrawerClick={() => {
                        if (row.invoiceId) onOpenInvoice(row.invoiceId);
                      }}
                      className="text-slate-600 cursor-pointer justify-center w-full"
                    />
                  )}
                </TableCell>
                <TableCell
                  className="px-3 py-2 border-r border-slate-200 text-left bg-white text-slate-600 max-w-[250px] truncate"
                  title={row.partnerName}
                >
                  {row.partnerName}
                </TableCell>

                {/* INBOUND */}
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-700 tabular-nums bg-white w-[80px]">
                  {row.inQty
                    ? row.inQty.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-700 tabular-nums bg-white">
                  {row.inUnitCost != null ? money(row.inUnitCost) : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-700 tabular-nums bg-white">
                  {row.inTotal != null ? money(row.inTotal) : ""}
                </TableCell>

                {/* OUTBOUND */}
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-emerald-700 tabular-nums bg-white w-[80px]">
                  {row.outQty
                    ? row.outQty.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
                  {row.outCogs != null && row.outQty
                    ? money(row.outCogs / row.outQty)
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-emerald-700 tabular-nums bg-white">
                  {row.outCogs != null ? money(row.outCogs) : ""}
                </TableCell>

                {/* BALANCE */}
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 tabular-nums bg-white w-[80px]">
                  {row.balanceQty.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 tabular-nums bg-white">
                  {money(row.balanceValue)}
                </TableCell>

                {/* PERFORMANCE */}
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-purple-700 tabular-nums bg-white w-[80px]">
                  {row.outQty
                    ? row.outQty.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
                  {row.outUnitCost != null && row.direction === "OUT"
                    ? money(row.outUnitCost)
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
                  {row.outCogs != null && row.direction === "OUT"
                    ? money(row.outCogs)
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
                  {row.outSellPrice != null && row.direction === "OUT"
                    ? money(row.outSellPrice)
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
                  {row.outRevenue != null && row.direction === "OUT"
                    ? money(row.outRevenue)
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-purple-700 tabular-nums bg-white">
                  {row.outProfit != null && row.direction === "OUT"
                    ? money(row.outProfit)
                    : ""}
                </TableCell>
                <TableCell className="px-3 py-2 text-right text-slate-600 tabular-nums bg-white">
                  {row.outMargin != null && row.direction === "OUT"
                    ? `${row.outMargin.toFixed(1)}%`
                    : ""}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter className="sticky bottom-0 z-10 font-semibold bg-slate-50 border-t-2 border-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <TableRow className="hover:bg-slate-50">
            <TableCell
              colSpan={4}
              className="px-3 py-3 border-r border-slate-200 text-right uppercase text-slate-700"
            >
              {t("common:total", "Tổng cộng")}
            </TableCell>

            {/* IN TOTALS */}
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-slate-700 bg-orange-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <span className="underline">
                {totals.inQty.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-orange-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-slate-700 bg-orange-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.inValue)}</span>
            </TableCell>

            {/* OUT TOTALS */}
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <span className="underline">
                {totals.outQty.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.outValue)}</span>
            </TableCell>

            {/* STOCK TOTALS */}
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-blue-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-blue-50 shadow-[0_1px_0_0_var(--border-light)]" />

            {/* PERF TOTALS */}
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <span className="underline">
                {totals.outQty.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.outValue)}</span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]" />
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.outRevenue)}</span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.outProfit)}</span>
            </TableCell>
            <TableCell className="px-3 py-2 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
              {totals.outRevenue > 0 ? (
                <span className="underline">
                  {((totals.outProfit / totals.outRevenue) * 100).toFixed(1)}%
                </span>
              ) : null}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
