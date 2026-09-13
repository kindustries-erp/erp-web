import { format } from "date-fns";
import { fmtQty, money } from "@/shared/utils/format";
import { TableText } from "@/shared/components/DataTable/TableText";
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
import { useT } from "@/core/i18n";
import type {
  InventoryLedgerRow,
  InventoryLedgerTotals,
} from "../utils/inventoryLedgerTransform";

interface InventoryFlatLedgerTableProps {
  data: InventoryLedgerRow[];
  tableState: ReturnType<typeof useTableColumnState>;
  totals: InventoryLedgerTotals;
  optionsMap?: Record<string, { label: string; value: string }[]>;
  onOpenDocument?: (docId: string, docType: string) => void;
  uomName?: string;
}

export function InventoryFlatLedgerTable({
  data,
  tableState,
  totals,
  optionsMap = {},
  onOpenDocument,
}: InventoryFlatLedgerTableProps) {
  const t = useT();

  return (
    <div className="w-full overflow-x-auto overflow-y-visible border border-border rounded-lg bg-card relative shadow-sm">
      <Table className="w-full text-sm text-left whitespace-nowrap min-w-max border-collapse">
        <TableHeader className="sticky top-0 z-10 table-header-glass text-foreground border-b border-border">
          <TableRow className="hover:bg-transparent border-b-0">
            <TableHead
              rowSpan={2}
              className="px-3 py-2 border-r border-border font-semibold text-center w-12 bg-slate-100/75 dark:bg-slate-800/75 text-slate-800 dark:text-slate-200 shadow-[0_1px_0_0_var(--border)]"
            >
              #
            </TableHead>
            <TableHead
              colSpan={2}
              className="px-3 py-2 border-r border-border font-semibold text-center bg-slate-100/75 dark:bg-slate-800/75 text-slate-800 dark:text-slate-200 shadow-[0_1px_0_0_var(--border)]"
            >
              {t("inventory.ledger.generalInfo", "THÔNG TIN CHUNG")}
            </TableHead>
            <TableHead
              colSpan={3}
              className="px-3 py-2 border-r border-border font-semibold text-center bg-orange-50/75 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 shadow-[0_1px_0_0_var(--border)]"
            >
              {t("inventory.ledger.inGroup", "NHẬP KHO")}
            </TableHead>
            <TableHead
              colSpan={3}
              className="px-3 py-2 border-r border-border font-semibold text-center bg-emerald-50/75 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-[0_1px_0_0_var(--border)]"
            >
              {t("inventory.ledger.outGroup", "XUẤT KHO")}
            </TableHead>
            <TableHead
              colSpan={2}
              className="px-3 py-2 border-r border-border font-semibold text-center bg-blue-50/75 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 shadow-[0_1px_0_0_var(--border)]"
            >
              {t("inventory.ledger.stockGroup", "TỒN KHO")}
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent border-b-0 shadow-[0_1px_0_0_var(--border)]">
            {/* THONG TIN CHUNG */}
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-center bg-slate-50 dark:bg-slate-900/60 shadow-[0_1px_0_0_var(--border)] min-w-[140px]">
              <TableColumnHeaderFilter
                title={t("common.date", "Ngày")}
                align="center"
                hideFilter={true}
                hideFilterList={true}
                hideFooter={true}
                sortState={
                  tableState.sorts.includes("transactionDate")
                    ? "asc"
                    : tableState.sorts.includes("-transactionDate")
                      ? "desc"
                      : "none"
                }
                onSortChange={(s) => tableState.setSort("transactionDate", s)}
                searchValue={tableState.columnSearch["transactionDate"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("transactionDate", val)
                }
                selectedFilters={[]}
                onFilterChange={() => {}}
                isActive={
                  !!tableState.columnSearch["transactionDate"]?.length ||
                  tableState.sorts.includes("transactionDate") ||
                  tableState.sorts.includes("-transactionDate")
                }
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
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-center bg-slate-50 dark:bg-slate-900/60 shadow-[0_1px_0_0_var(--border)] w-[200px] min-w-[200px] max-w-[200px]">
              <TableColumnHeaderFilter
                title={t("inventory.ledger.docNo", "Số phiếu")}
                align="center"
                sortState={
                  tableState.sorts.includes("documentNo")
                    ? "asc"
                    : tableState.sorts.includes("-documentNo")
                      ? "desc"
                      : "none"
                }
                onSortChange={(state) =>
                  tableState.setSort("documentNo", state)
                }
                searchValue={tableState.columnSearch["documentNo"] || ""}
                onSearchChange={(val) =>
                  tableState.setColumnSearch("documentNo", val)
                }
                filterOptions={optionsMap["documentNo"] || []}
                selectedFilters={tableState.columnFilters["documentNo"] || []}
                onFilterChange={(vals) =>
                  tableState.setColumnFilter("documentNo", vals)
                }
                isActive={
                  !!tableState.columnFilters["documentNo"]?.length ||
                  !!tableState.columnSearch["documentNo"]
                }
              />
            </TableHead>

            {/* NHẬP KHO */}
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-orange-50/60 dark:bg-orange-950/20 shadow-[0_1px_0_0_var(--border)] w-[90px]">
              <TableColumnHeaderFilter
                title={t("inventory.ledger.qty", "SL")}
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
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-orange-50/60 dark:bg-orange-950/20 shadow-[0_1px_0_0_var(--border)] min-w-[100px]">
              <span className="text-xs font-semibold text-muted-foreground block text-right pr-2">
                {t("inventory.ledger.unitPrice", "Đơn giá")}
              </span>
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-orange-50/60 dark:bg-orange-950/20 shadow-[0_1px_0_0_var(--border)] min-w-[110px]">
              <span className="text-xs font-semibold text-muted-foreground block text-right pr-2">
                {t("inventory.ledger.amount", "Thành tiền")}
              </span>
            </TableHead>

            {/* XUẤT KHO */}
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-emerald-50/60 dark:bg-emerald-950/20 shadow-[0_1px_0_0_var(--border)] w-[90px]">
              <TableColumnHeaderFilter
                title={t("inventory.ledger.qty", "SL")}
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
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-emerald-50/60 dark:bg-emerald-950/20 shadow-[0_1px_0_0_var(--border)] min-w-[100px]">
              <span className="text-xs font-semibold text-muted-foreground block text-right pr-2">
                {t("inventory.ledger.unitPrice", "Đơn giá")}
              </span>
            </TableHead>
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-emerald-50/60 dark:bg-emerald-950/20 shadow-[0_1px_0_0_var(--border)] min-w-[110px]">
              <span className="text-xs font-semibold text-muted-foreground block text-right pr-2">
                {t("inventory.ledger.amount", "Thành tiền")}
              </span>
            </TableHead>

            {/* TỒN KHO */}
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-blue-50/60 dark:bg-blue-950/20 shadow-[0_1px_0_0_var(--border)] w-[90px]">
              <TableColumnHeaderFilter
                title={t("inventory.ledger.qty", "SL")}
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
            <TableHead className="px-3 py-2 border-r border-t border-border font-medium text-right bg-blue-50/60 dark:bg-blue-950/20 shadow-[0_1px_0_0_var(--border)] min-w-[110px]">
              <span className="text-xs font-semibold text-muted-foreground block text-right pr-2">
                {t("inventory.ledger.balanceValue", "Giá trị tồn")}
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                {t(
                  "inventory.ledger.empty",
                  "Không có dữ liệu lịch sử xuất nhập kho.",
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={row.id} className="hover:bg-muted/40 group">
                <TableCell className="px-3 py-2 border-r border-border text-center text-xs text-muted-foreground">
                  {i + 1}
                </TableCell>

                {/* THÔNG TIN CHUNG */}
                <TableCell className="px-3 py-2 border-r border-border text-center font-mono text-xs">
                  {row.transactionDate
                    ? format(new Date(row.transactionDate), "dd/MM/yyyy HH:mm")
                    : "—"}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-border text-left w-[200px] max-w-[200px]">
                  {row.documentNo ? (
                    <TableText
                      text={row.documentNo}
                      tooltip={
                        <div className="flex flex-col gap-1 max-w-xs text-xs text-left">
                          <div className="font-semibold text-slate-100">
                            {row.documentNo}
                          </div>
                          {row.typeLabel && (
                            <div className="text-slate-300">
                              <span className="text-slate-400 font-medium">
                                Loại:{" "}
                              </span>
                              {row.typeLabel}
                            </div>
                          )}
                          {row.notes && (
                            <div className="text-slate-300">
                              <span className="text-slate-400 font-medium">
                                Ghi chú:{" "}
                              </span>
                              <span className="whitespace-pre-wrap">
                                {row.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      }
                      enableCopy={true}
                      onDrawerClick={(e) => {
                        e.stopPropagation();
                        if (
                          row.documentId &&
                          row.documentType &&
                          onOpenDocument
                        ) {
                          onOpenDocument(row.documentId, row.documentType);
                        }
                      }}
                      className="text-primary font-medium cursor-pointer"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                {/* NHẬP KHO */}
                <TableCell className="px-3 py-2 border-r border-border text-right font-medium text-orange-600 dark:text-orange-400 tabular-nums">
                  {row.inQty != null ? `+${fmtQty(row.inQty)}` : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-border text-right text-muted-foreground tabular-nums text-xs">
                  {row.inUnitCost != null ? money(row.inUnitCost) : "—"}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-border text-right text-muted-foreground tabular-nums text-xs">
                  {row.inTotal != null ? money(row.inTotal) : "—"}
                </TableCell>

                {/* XUẤT KHO */}
                <TableCell className="px-3 py-2 border-r border-border text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {row.outQty != null ? `-${fmtQty(row.outQty)}` : ""}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-border text-right text-muted-foreground tabular-nums text-xs">
                  {row.outUnitCost != null ? money(row.outUnitCost) : "—"}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-border text-right text-muted-foreground tabular-nums text-xs">
                  {row.outTotal != null ? money(row.outTotal) : "—"}
                </TableCell>

                {/* TỒN KHO */}
                <TableCell className="px-3 py-2 border-r border-border text-right font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {fmtQty(row.balanceQty)}
                </TableCell>
                <TableCell className="px-3 py-2 border-r border-border text-right text-muted-foreground tabular-nums text-xs">
                  {row.balanceTotal != null ? money(row.balanceTotal) : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        <TableFooter className="sticky bottom-0 z-10 font-semibold table-footer-glass border-t-2 border-border shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
          <TableRow className="hover:bg-transparent bg-transparent">
            <TableCell
              colSpan={3}
              className="px-3 py-2.5 border-r border-border text-right uppercase text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              {t("common.total", "TỔNG CỘNG")}
            </TableCell>

            {/* IN TOTALS */}
            <TableCell className="px-3 py-2 border-r border-border text-right font-semibold text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30">
              <span className="underline">+{fmtQty(totals.inQty)}</span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-border text-right bg-orange-50 dark:bg-orange-950/30 text-muted-foreground text-xs">
              —
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-border text-right bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 text-xs">
              {totals.inTotal > 0 ? money(totals.inTotal) : "—"}
            </TableCell>

            {/* OUT TOTALS */}
            <TableCell className="px-3 py-2 border-r border-border text-right font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
              <span className="underline">-{fmtQty(totals.outQty)}</span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-border text-right bg-emerald-50 dark:bg-emerald-950/30 text-muted-foreground text-xs">
              —
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-border text-right bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs">
              {totals.outTotal > 0 ? money(totals.outTotal) : "—"}
            </TableCell>

            {/* BALANCE TOTALS */}
            <TableCell className="px-3 py-2 border-r border-border text-right font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30">
              <span className="underline">{fmtQty(totals.balanceQty)}</span>
            </TableCell>
            <TableCell className="px-3 py-2 border-r border-border text-right bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs">
              {totals.balanceTotal > 0 ? money(totals.balanceTotal) : "—"}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
