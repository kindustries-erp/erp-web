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
  balanceQty: number;
  balanceValue: number;
}

interface FifoFlatTableProps {
  data: LedgerDisplayRow[];
  onOpenInvoice: (invoiceId: string) => void;
  tableState: ReturnType<typeof useTableColumnState>;
  totals: FifoFlatTableTotals;
  optionsMap?: Record<string, { label: string; value: string }[]>;
}

export function FifoFlatTable({
  data,
  onOpenInvoice,
  tableState,
  totals,
  optionsMap = {},
}: FifoFlatTableProps) {
  const { t } = useTranslation(["vinfastParts", "common"]);

  return (
    <div className="w-full overflow-x-auto overflow-y-visible border border-slate-200 rounded-md bg-white relative">
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
                hideFilterList={true}
                hideFooter={true}
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
              <TableColumnHeaderFilter
                title="Số HĐ"
                align="center"
                sortState={
                  tableState.sorts.includes("invoiceNo")
                    ? "asc"
                    : tableState.sorts.includes("-invoiceNo")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("invoiceNo", state)}
                searchValue={tableState.columnSearch["invoiceNo"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("invoiceNo", val)
                }
                filterOptions={optionsMap["invoiceNo"] || []}
                selectedFilters={tableState.columnFilters["invoiceNo"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("invoiceNo", vals)
                }
                isActive={!!tableState.columnFilters["invoiceNo"]?.length}
              />
            </TableHead>

            {/* IN */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <TableColumnHeaderFilter
                title="SL"
                align="right"
                sortState={
                  tableState.sorts.includes("inQty")
                    ? "asc"
                    : tableState.sorts.includes("-inQty")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("inQty", state)}
                searchValue={tableState.columnSearch["inQty"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("inQty", val)
                }
                filterOptions={optionsMap["inQty"] || []}
                selectedFilters={tableState.columnFilters["inQty"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("inQty", vals)
                }
                isActive={!!tableState.columnFilters["inQty"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Đơn giá"
                align="right"
                sortState={
                  tableState.sorts.includes("inUnitCost")
                    ? "asc"
                    : tableState.sorts.includes("-inUnitCost")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("inUnitCost", state)
                }
                searchValue={tableState.columnSearch["inUnitCost"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("inUnitCost", val)
                }
                filterOptions={optionsMap["inUnitCost"] || []}
                selectedFilters={tableState.columnFilters["inUnitCost"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("inUnitCost", vals)
                }
                isActive={!!tableState.columnFilters["inUnitCost"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Thành tiền"
                align="right"
                sortState={
                  tableState.sorts.includes("inTotal")
                    ? "asc"
                    : tableState.sorts.includes("-inTotal")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("inTotal", state)}
                searchValue={tableState.columnSearch["inTotal"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("inTotal", val)
                }
                filterOptions={optionsMap["inTotal"] || []}
                selectedFilters={tableState.columnFilters["inTotal"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("inTotal", vals)
                }
                isActive={!!tableState.columnFilters["inTotal"]?.length}
              />
            </TableHead>

            {/* OUT */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <TableColumnHeaderFilter
                title="SL"
                align="right"
                sortState={
                  tableState.sorts.includes("outQty")
                    ? "asc"
                    : tableState.sorts.includes("-outQty")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("outQty", state)}
                searchValue={tableState.columnSearch["outQty"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outQty", val)
                }
                filterOptions={optionsMap["outQty"] || []}
                selectedFilters={tableState.columnFilters["outQty"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outQty", vals)
                }
                isActive={!!tableState.columnFilters["outQty"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Đơn giá"
                align="right"
                sortState={
                  tableState.sorts.includes("outUnitCost")
                    ? "asc"
                    : tableState.sorts.includes("-outUnitCost")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("outUnitCost", state)
                }
                searchValue={tableState.columnSearch["outUnitCost"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outUnitCost", val)
                }
                filterOptions={optionsMap["outUnitCost"] || []}
                selectedFilters={tableState.columnFilters["outUnitCost"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outUnitCost", vals)
                }
                isActive={!!tableState.columnFilters["outUnitCost"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Thành tiền"
                align="right"
                sortState={
                  tableState.sorts.includes("outCogs")
                    ? "asc"
                    : tableState.sorts.includes("-outCogs")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("outCogs", state)}
                searchValue={tableState.columnSearch["outCogs"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outCogs", val)
                }
                filterOptions={optionsMap["outCogs"] || []}
                selectedFilters={tableState.columnFilters["outCogs"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outCogs", vals)
                }
                isActive={!!tableState.columnFilters["outCogs"]?.length}
              />
            </TableHead>

            {/* BALANCE */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-blue-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <TableColumnHeaderFilter
                title="SL"
                align="right"
                sortState={
                  tableState.sorts.includes("balanceQty")
                    ? "asc"
                    : tableState.sorts.includes("-balanceQty")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("balanceQty", state)
                }
                searchValue={tableState.columnSearch["balanceQty"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("balanceQty", val)
                }
                filterOptions={optionsMap["balanceQty"] || []}
                selectedFilters={tableState.columnFilters["balanceQty"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("balanceQty", vals)
                }
                isActive={!!tableState.columnFilters["balanceQty"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-blue-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Thành tiền"
                align="right"
                sortState={
                  tableState.sorts.includes("balanceValue")
                    ? "asc"
                    : tableState.sorts.includes("-balanceValue")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("balanceValue", state)
                }
                searchValue={tableState.columnSearch["balanceValue"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("balanceValue", val)
                }
                filterOptions={optionsMap["balanceValue"] || []}
                selectedFilters={tableState.columnFilters["balanceValue"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("balanceValue", vals)
                }
                isActive={!!tableState.columnFilters["balanceValue"]?.length}
              />
            </TableHead>

            {/* PERFORMANCE */}
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <TableColumnHeaderFilter
                title="SL"
                align="right"
                sortState={
                  tableState.sorts.includes("outQty")
                    ? "asc"
                    : tableState.sorts.includes("-outQty")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("outQty", state)}
                searchValue={tableState.columnSearch["outQty"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outQty", val)
                }
                filterOptions={optionsMap["outQty"] || []}
                selectedFilters={tableState.columnFilters["outQty"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outQty", vals)
                }
                isActive={!!tableState.columnFilters["outQty"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Đơn giá mua"
                align="right"
                sortState={
                  tableState.sorts.includes("outUnitCost")
                    ? "asc"
                    : tableState.sorts.includes("-outUnitCost")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("outUnitCost", state)
                }
                searchValue={tableState.columnSearch["outUnitCost"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outUnitCost", val)
                }
                filterOptions={optionsMap["outUnitCost"] || []}
                selectedFilters={tableState.columnFilters["outUnitCost"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outUnitCost", vals)
                }
                isActive={!!tableState.columnFilters["outUnitCost"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Giá mua"
                align="right"
                sortState={
                  tableState.sorts.includes("outCogs")
                    ? "asc"
                    : tableState.sorts.includes("-outCogs")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("outCogs", state)}
                searchValue={tableState.columnSearch["outCogs"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outCogs", val)
                }
                filterOptions={optionsMap["outCogs"] || []}
                selectedFilters={tableState.columnFilters["outCogs"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outCogs", vals)
                }
                isActive={!!tableState.columnFilters["outCogs"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)]">
              <TableColumnHeaderFilter
                title="Đơn giá bán"
                align="right"
                sortState={
                  tableState.sorts.includes("outSellPrice")
                    ? "asc"
                    : tableState.sorts.includes("-outSellPrice")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("outSellPrice", state)
                }
                searchValue={tableState.columnSearch["outSellPrice"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outSellPrice", val)
                }
                filterOptions={optionsMap["outSellPrice"] || []}
                selectedFilters={tableState.columnFilters["outSellPrice"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outSellPrice", vals)
                }
                isActive={!!tableState.columnFilters["outSellPrice"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)] min-w-[100px]">
              <TableColumnHeaderFilter
                title="Doanh thu"
                align="right"
                sortState={
                  tableState.sorts.includes("outRevenue")
                    ? "asc"
                    : tableState.sorts.includes("-outRevenue")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("outRevenue", state)
                }
                searchValue={tableState.columnSearch["outRevenue"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outRevenue", val)
                }
                filterOptions={optionsMap["outRevenue"] || []}
                selectedFilters={tableState.columnFilters["outRevenue"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outRevenue", vals)
                }
                isActive={!!tableState.columnFilters["outRevenue"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)] min-w-[100px]">
              <TableColumnHeaderFilter
                title="Lợi nhuận gộp"
                align="right"
                sortState={
                  tableState.sorts.includes("outProfit")
                    ? "asc"
                    : tableState.sorts.includes("-outProfit")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("outProfit", state)}
                searchValue={tableState.columnSearch["outProfit"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outProfit", val)
                }
                filterOptions={optionsMap["outProfit"] || []}
                selectedFilters={tableState.columnFilters["outProfit"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outProfit", vals)
                }
                isActive={!!tableState.columnFilters["outProfit"]?.length}
              />
            </TableHead>
            <TableHead className="px-3 py-2 border-t border-slate-200 font-medium text-right bg-purple-50/50 shadow-[0_1px_0_0_var(--border-light)] min-w-[60px]">
              <TableColumnHeaderFilter
                title="% LN"
                align="right"
                sortState={
                  tableState.sorts.includes("outMargin")
                    ? "asc"
                    : tableState.sorts.includes("-outMargin")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) => tableState.setSort("outMargin", state)}
                searchValue={tableState.columnSearch["outMargin"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("outMargin", val)
                }
                filterOptions={optionsMap["outMargin"] || []}
                selectedFilters={tableState.columnFilters["outMargin"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("outMargin", vals)
                }
                isActive={!!tableState.columnFilters["outMargin"]?.length}
              />
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
                      tooltip={[
                        row.invoiceNo,
                        row.partnerName,
                        row.partnerTaxCode,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                      enableCopy={false}
                      onDrawerClick={() => {
                        if (row.invoiceId) onOpenInvoice(row.invoiceId);
                      }}
                      className="text-slate-600 cursor-pointer justify-center w-full"
                    />
                  )}
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
              colSpan={3}
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
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 bg-blue-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
              <span className="underline">
                {totals.balanceQty?.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 bg-blue-50 shadow-[0_1px_0_0_var(--border-light)]">
              <span className="underline">{money(totals.balanceValue)}</span>
            </TableCell>

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
