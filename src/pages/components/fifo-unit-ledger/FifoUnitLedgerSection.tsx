import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FilterButton } from "@/shared/components/FilterPanel";
import { money } from "@/shared/utils/format";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useFifoUnitLedger, FifoUnitRow } from "./useFifoUnitLedger";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";

interface FifoUnitLedgerSectionProps {
  sku: string;
}

export function FifoUnitLedgerSection({ sku }: FifoUnitLedgerSectionProps) {
  const { t } = useTranslation(["vinfastParts", "reports", "common"]);
  const [invoiceIdToOpen, setInvoiceIdToOpen] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useFifoUnitLedger(sku, true);
  const rows = data?.data || [];

  const tableState = useTableColumnState("fifo-unit-ledger");

  const inInvoiceOptions = useMemo(() => {
    const opts = new Set<string>();
    rows.forEach((r: FifoUnitRow) => r.inInvoiceNo && opts.add(r.inInvoiceNo));
    return Array.from(opts).map((v) => ({ label: v, value: v }));
  }, [rows]);

  const outInvoiceOptions = useMemo(() => {
    const opts = new Set<string>();
    rows.forEach(
      (r: FifoUnitRow) => r.outInvoiceNo && opts.add(r.outInvoiceNo),
    );
    return Array.from(opts).map((v) => ({ label: v, value: v }));
  }, [rows]);

  const inUnitCostOptions = useMemo(() => {
    const opts = new Set<number>();
    rows.forEach(
      (r: FifoUnitRow) => r.inUnitCost != null && opts.add(r.inUnitCost),
    );
    return Array.from(opts).map((v) => ({ label: money(v), value: String(v) }));
  }, [rows]);

  const outPriceOptions = useMemo(() => {
    const opts = new Set<number>();
    rows.forEach(
      (r: FifoUnitRow) => r.outPrice != null && opts.add(r.outPrice),
    );
    return Array.from(opts).map((v) => ({ label: money(v), value: String(v) }));
  }, [rows]);

  const profitOptions = useMemo(() => {
    const opts = new Set<number>();
    rows.forEach((r: FifoUnitRow) => r.profit != null && opts.add(r.profit));
    return Array.from(opts).map((v) => ({ label: money(v), value: String(v) }));
  }, [rows]);

  const columns = useMemo<DataTableColumn<FifoUnitRow>[]>(
    () => [
      {
        key: "index",
        header: () => <div className="text-center w-full">#</div>,
        cell: (_, idx) => (
          <span className="text-center block w-full">{idx}</span>
        ),
        size: 40,
        enableResizing: false,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
      },
      {
        key: "inDate",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:IN_DATE", "Ngày nhập")}
            align="center"
            isActive={!!tableState.columnSearch["inDate"]?.length}
            hideFilter={true}
            hideFooter={true}
            sortState={
              tableState.sorts.includes("inDate")
                ? "asc"
                : tableState.sorts.includes("-inDate")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => tableState.setSort("inDate", state)}
            searchValue={tableState.columnSearch["inDate"] || ""}
            onSearchChange={(val) => tableState.setColumnSearch("inDate", val)}
            selectedFilters={tableState.columnFilters["inDate"] || []}
            onFilterChange={(vals) =>
              tableState.setColumnFilter("inDate", vals)
            }
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
        ),
        cell: (item) => (
          <TableDateCell
            date={item.inDate}
            className="justify-end w-full"
            format="date"
          />
        ),
        className: "text-right",
        enableResizing: true,
        size: 150,
      },
      {
        key: "inInvoiceNo",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:IN_INVOICE_NO", "Số HĐ vào")}
            align="center"
            isActive={!!tableState.columnFilters["inInvoiceNo"]?.length}
            sortState={
              tableState.sorts.includes("inInvoiceNo")
                ? "asc"
                : tableState.sorts.includes("-inInvoiceNo")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => tableState.setSort("inInvoiceNo", state)}
            searchValue={tableState.columnSearch["inInvoiceNo"] || ""}
            onSearchChange={(val) =>
              tableState.setColumnSearch("inInvoiceNo", val)
            }
            filterOptions={inInvoiceOptions}
            selectedFilters={tableState.columnFilters["inInvoiceNo"] || []}
            onFilterChange={(vals) =>
              tableState.setColumnFilter("inInvoiceNo", vals)
            }
          />
        ),
        cell: (item) => (
          <TableText
            text={item.inInvoiceNo}
            enableCopy={true}
            tooltip={true}
            onDrawerClick={(e) => {
              e.stopPropagation();
              setInvoiceIdToOpen(item.inInvoiceId);
            }}
          />
        ),
        enableResizing: true,
        size: 150,
      },
      {
        key: "outDate",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:OUT_DATE", "Ngày xuất")}
            align="center"
            isActive={!!tableState.columnSearch["outDate"]?.length}
            hideFilter={true}
            hideFooter={true}
            sortState={
              tableState.sorts.includes("outDate")
                ? "asc"
                : tableState.sorts.includes("-outDate")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => tableState.setSort("outDate", state)}
            searchValue={tableState.columnSearch["outDate"] || ""}
            onSearchChange={(val) => tableState.setColumnSearch("outDate", val)}
            selectedFilters={tableState.columnFilters["outDate"] || []}
            onFilterChange={(vals) =>
              tableState.setColumnFilter("outDate", vals)
            }
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
        ),
        cell: (item) => {
          if (!item.outDate) return null;
          return (
            <TableDateCell
              date={item.outDate}
              className="justify-end w-full"
              format="date"
            />
          );
        },
        className: "text-right",
        enableResizing: true,
        size: 150,
      },
      {
        key: "outInvoiceNo",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:OUT_INVOICE_NO", "Số HĐ ra")}
            align="center"
            isActive={!!tableState.columnFilters["outInvoiceNo"]?.length}
            sortState={
              tableState.sorts.includes("outInvoiceNo")
                ? "asc"
                : tableState.sorts.includes("-outInvoiceNo")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => tableState.setSort("outInvoiceNo", state)}
            searchValue={tableState.columnSearch["outInvoiceNo"] || ""}
            onSearchChange={(val) =>
              tableState.setColumnSearch("outInvoiceNo", val)
            }
            filterOptions={outInvoiceOptions}
            selectedFilters={tableState.columnFilters["outInvoiceNo"] || []}
            onFilterChange={(vals) =>
              tableState.setColumnFilter("outInvoiceNo", vals)
            }
          />
        ),
        cell: (item) => {
          if (!item.outInvoiceNo) return null;
          return (
            <TableText
              text={item.outInvoiceNo}
              enableCopy={true}
              tooltip={true}
              onDrawerClick={(e) => {
                e.stopPropagation();
                if (item.outInvoiceId) {
                  setInvoiceIdToOpen(item.outInvoiceId);
                }
              }}
            />
          );
        },
        enableResizing: true,
        size: 150,
      },
      {
        key: "inUnitCost",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:COST_PRICE", "Giá vốn")}
            align="center"
            isActive={!!tableState.columnFilters["inUnitCost"]?.length}
            sortState={
              tableState.sorts.includes("inUnitCost")
                ? "asc"
                : tableState.sorts.includes("-inUnitCost")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => tableState.setSort("inUnitCost", state)}
            searchValue={tableState.columnSearch["inUnitCost"] || ""}
            onSearchChange={(val) =>
              tableState.setColumnSearch("inUnitCost", val)
            }
            filterOptions={inUnitCostOptions}
            selectedFilters={tableState.columnFilters["inUnitCost"] || []}
            onFilterChange={(vals) =>
              tableState.setColumnFilter("inUnitCost", vals)
            }
          />
        ),
        cell: (item) => (
          <div className="tabular-nums font-semibold text-right text-red-500 w-full">
            {money(item.inUnitCost)}
          </div>
        ),
        enableResizing: true,
        size: 200,
      },
      {
        key: "outPrice",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:SELLING_PRICE", "Giá bán (trước VAT)")}
            align="center"
            isActive={!!tableState.columnFilters["outPrice"]?.length}
            sortState={
              tableState.sorts.includes("outPrice")
                ? "asc"
                : tableState.sorts.includes("-outPrice")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => tableState.setSort("outPrice", state)}
            searchValue={tableState.columnSearch["outPrice"] || ""}
            onSearchChange={(val) =>
              tableState.setColumnSearch("outPrice", val)
            }
            filterOptions={outPriceOptions}
            selectedFilters={tableState.columnFilters["outPrice"] || []}
            onFilterChange={(vals) =>
              tableState.setColumnFilter("outPrice", vals)
            }
          />
        ),
        cell: (item) => {
          if (item.outPrice == null) return null;
          return (
            <div className="tabular-nums font-semibold text-right text-emerald-600 w-full">
              {money(item.outPrice)}
            </div>
          );
        },
        enableResizing: true,
        size: 200,
      },
      {
        key: "profit",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:PROFIT", "Lợi nhuận")}
            align="center"
            isActive={!!tableState.columnFilters["profit"]?.length}
            sortState={
              tableState.sorts.includes("profit")
                ? "asc"
                : tableState.sorts.includes("-profit")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => tableState.setSort("profit", state)}
            searchValue={tableState.columnSearch["profit"] || ""}
            onSearchChange={(val) => tableState.setColumnSearch("profit", val)}
            filterOptions={profitOptions}
            selectedFilters={tableState.columnFilters["profit"] || []}
            onFilterChange={(vals) =>
              tableState.setColumnFilter("profit", vals)
            }
          />
        ),
        cell: (item) => {
          if (item.profit == null) return null;
          return (
            <div
              className={`tabular-nums font-semibold text-right w-full ${item.profit < 0 ? "text-red-500" : "text-emerald-600"}`}
            >
              {item.profit > 0 ? "+" : ""}
              {money(item.profit)}
            </div>
          );
        },
        enableResizing: true,
        size: 200,
      },
    ],
    [tableState],
  );

  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Text search
    if (tableState.columnSearch["inInvoiceNo"]) {
      const q = tableState.columnSearch["inInvoiceNo"].toLowerCase();
      result = result.filter((r: FifoUnitRow) =>
        r.inInvoiceNo?.toLowerCase().includes(q),
      );
    }
    if (tableState.columnSearch["outInvoiceNo"]) {
      const q = tableState.columnSearch["outInvoiceNo"].toLowerCase();
      result = result.filter((r: FifoUnitRow) =>
        r.outInvoiceNo?.toLowerCase().includes(q),
      );
    }
    if (tableState.columnSearch["inUnitCost"]) {
      const q = tableState.columnSearch["inUnitCost"].toLowerCase();
      result = result.filter(
        (r: FifoUnitRow) =>
          r.inUnitCost != null && String(r.inUnitCost).includes(q),
      );
    }
    if (tableState.columnSearch["outPrice"]) {
      const q = tableState.columnSearch["outPrice"].toLowerCase();
      result = result.filter(
        (r: FifoUnitRow) =>
          r.outPrice != null && String(r.outPrice).includes(q),
      );
    }
    if (tableState.columnSearch["profit"]) {
      const q = tableState.columnSearch["profit"].toLowerCase();
      result = result.filter(
        (r: FifoUnitRow) => r.profit != null && String(r.profit).includes(q),
      );
    }

    // Date range filter for inDate
    const inDateRange = tableState.columnSearch["inDate"];
    if (inDateRange) {
      const [from, to] = inDateRange.split("|");
      if (from || to) {
        result = result.filter((r: FifoUnitRow) => {
          if (!r.inDate) return false;
          const rDate = new Date(r.inDate).getTime();
          if (from && rDate < new Date(from).getTime()) return false;
          // To date should include the end of the day if it's just a date
          if (to && rDate > new Date(to).getTime() + 86400000 - 1) return false;
          return true;
        });
      }
    }

    // Date range filter for outDate
    const outDateRange = tableState.columnSearch["outDate"];
    if (outDateRange) {
      const [from, to] = outDateRange.split("|");
      if (from || to) {
        result = result.filter((r: FifoUnitRow) => {
          if (!r.outDate) return false;
          const rDate = new Date(r.outDate).getTime();
          if (from && rDate < new Date(from).getTime()) return false;
          if (to && rDate > new Date(to).getTime() + 86400000 - 1) return false;
          return true;
        });
      }
    }

    // Checkbox filters
    if (tableState.columnFilters["inInvoiceNo"]?.length) {
      result = result.filter(
        (r: FifoUnitRow) =>
          r.inInvoiceNo &&
          tableState.columnFilters["inInvoiceNo"].includes(r.inInvoiceNo),
      );
    }
    if (tableState.columnFilters["outInvoiceNo"]?.length) {
      result = result.filter(
        (r: FifoUnitRow) =>
          r.outInvoiceNo &&
          tableState.columnFilters["outInvoiceNo"].includes(r.outInvoiceNo),
      );
    }
    if (tableState.columnFilters["inUnitCost"]?.length) {
      result = result.filter(
        (r: FifoUnitRow) =>
          r.inUnitCost != null &&
          tableState.columnFilters["inUnitCost"].includes(String(r.inUnitCost)),
      );
    }
    if (tableState.columnFilters["outPrice"]?.length) {
      result = result.filter(
        (r: FifoUnitRow) =>
          r.outPrice != null &&
          tableState.columnFilters["outPrice"].includes(String(r.outPrice)),
      );
    }
    if (tableState.columnFilters["profit"]?.length) {
      result = result.filter(
        (r: FifoUnitRow) =>
          r.profit != null &&
          tableState.columnFilters["profit"].includes(String(r.profit)),
      );
    }

    // Sorting
    if (tableState.sorts.length > 0) {
      result.sort((a, b) => {
        for (const sort of tableState.sorts) {
          const isDesc = sort.startsWith("-");
          const field = isDesc ? sort.substring(1) : sort;
          const aVal = a[field as keyof FifoUnitRow];
          const bVal = b[field as keyof FifoUnitRow];

          if (aVal == null && bVal == null) continue;
          if (aVal == null) return isDesc ? 1 : -1;
          if (bVal == null) return isDesc ? -1 : 1;

          if (aVal < bVal) return isDesc ? 1 : -1;
          if (aVal > bVal) return isDesc ? -1 : 1;
        }
        return 0;
      });
    }

    return result;
  }, [
    rows,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
  ]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const summaryRow = useMemo(() => {
    const totalOutPrice = filteredRows.reduce(
      (acc, curr: FifoUnitRow) => acc + (curr.outPrice || 0),
      0,
    );
    const totalProfit = filteredRows.reduce(
      (acc, curr: FifoUnitRow) => acc + (curr.profit || 0),
      0,
    );

    return {
      outPrice: (
        <div className="tabular-nums font-semibold text-right text-blue-600 w-full">
          {money(totalOutPrice)}
        </div>
      ),
      profit: (
        <div
          className={`tabular-nums font-semibold text-right ${totalProfit < 0 ? "text-red-500" : "text-emerald-600"}`}
        >
          {totalProfit > 0 ? "+" : ""}
          {money(totalProfit)}
        </div>
      ),
    };
  }, [filteredRows]);

  const activeFilterCount = tableState.activeFilterCount;

  return (
    <>
      <DrawerSection
        title={t(
          "vinfastParts:FIFO_UNIT_LEDGER_DETAIL",
          "Chi tiết luân chuyển từng sản phẩm",
        )}
        titleExtra={
          activeFilterCount > 0 ? (
            <FilterButton
              activeCount={activeFilterCount}
              onClick={() => {}}
              onClear={() => tableState.resetFilters()}
            />
          ) : undefined
        }
      >
        <DataTable
          variant="spreadsheet"
          enableColumnResizing={true}
          columns={columns as any}
          items={paginatedRows}
          loading={isLoading}
          emptyLabel={t("vinfastParts:NO_DATA", "Không có dữ liệu")}
          containerClassName="max-h-[440px] overflow-y-auto"
          summaryRow={summaryRow}
          page={page}
          pageSize={pageSize}
          onPage={setPage}
          onPageSize={setPageSize}
          total={filteredRows.length}
          totalPages={Math.ceil(filteredRows.length / pageSize)}
        />
      </DrawerSection>
      <ErpInvoiceStandaloneDrawer
        isOpen={!!invoiceIdToOpen}
        invoiceId={invoiceIdToOpen}
        onClose={() => setInvoiceIdToOpen(null)}
      />
    </>
  );
}
