import React from "react";
import { FifoUnitLedgerSection } from "./fifo-unit-ledger/FifoUnitLedgerSection";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { FilterButton } from "@/shared/components/FilterPanel";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { format } from "date-fns";
import { money } from "@/shared/utils/format";
import { useMemo, useState } from "react";
import { VinfastPartTrendChart } from "../VinfastPartsDashboardPage";

interface LedgerEntry {
  id: string;
  direction: "IN" | "OUT";
  qty: string;
  unitCost: string;
  preVatAmount: string;
  transactionDate: string;
  isAdjustment: boolean;
  adjSign: number;
  invoiceId: string;
  invoiceNo: string;
  invoiceDate: string;
  buyerName: string;
  sellerName: string;
  licensePlate: string;
  calculatedCogs?: number;
  calculatedUnitCost?: number;
}

interface VinfastPartsStockDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  sku: string;
  catalogData?: any;
}

export function VinfastPartsStockDetailDrawer({
  open,
  onClose,
  sku,
  catalogData,
}: VinfastPartsStockDetailDrawerProps) {
  const { t } = useTranslation(["vinfastParts", "reports", "common"]);
  const { data: entriesData, isLoading: loading } = useQuery({
    queryKey: ["vinfast-parts", "ledger-history", sku],
    queryFn: async () => {
      const res = await api.get(`/api/v1/vinfast-parts/ledger/${sku}`);
      return res.data as LedgerEntry[];
    },
    enabled: open && !!sku,
  });

  const entries = entriesData || [];
  const inEntriesAll = entries.filter((e) => e.direction === "IN");
  const outEntriesAll = entries.filter((e) => e.direction === "OUT");

  const [inPage, setInPage] = useState(1);
  const [inPageSize, setInPageSize] = useState(4);
  const [outPage, setOutPage] = useState(1);
  const [outPageSize, setOutPageSize] = useState(4);
  const [invoiceIdToOpen, setInvoiceIdToOpen] = useState<string | null>(null);

  const inTableState = useTableColumnState("vinfast-parts-in-history");
  const outTableState = useTableColumnState("vinfast-parts-out-history");

  const filterAndSortEntries = (
    data: LedgerEntry[],
    tableState: ReturnType<typeof useTableColumnState>,
    colToSkip?: string,
  ) => {
    let result = [...data];
    if (
      colToSkip !== "transactionDate" &&
      tableState.columnSearch["transactionDate"]?.length
    ) {
      const dateRange = tableState.columnSearch["transactionDate"];
      if (dateRange) {
        const [from, to] = dateRange.split("|");
        if (from || to) {
          result = result.filter((e) => {
            if (!e.transactionDate) return false;
            const rDate = new Date(e.transactionDate).getTime();
            if (from && rDate < new Date(from).getTime()) return false;
            if (to && rDate > new Date(to).getTime() + 86400000 - 1)
              return false;
            return true;
          });
        }
      }
    }

    Object.entries(tableState.columnSearch).forEach(([col, searchVal]) => {
      if (!searchVal || col === "transactionDate" || col === colToSkip) return;
      result = result.filter((e) => {
        const val = e[col as keyof LedgerEntry];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(searchVal.toLowerCase());
      });
    });

    Object.entries(tableState.columnFilters).forEach(([col, selectedVals]) => {
      if (!selectedVals || !selectedVals.length || col === colToSkip) return;
      result = result.filter((e) => {
        const val = e[col as keyof LedgerEntry];
        let formattedVal = String(val || "");
        if (col === "qty") {
          const prefix = e.isAdjustment && e.adjSign === -1 ? "-" : "";
          formattedVal = `${prefix}${Number(e.qty || 0).toLocaleString()}`;
        } else if (col === "unitCost" || col === "calculatedUnitCost") {
          formattedVal = money(Number(val || 0));
        }
        return selectedVals.includes(formattedVal);
      });
    });

    if (tableState.sorts.length > 0) {
      const sortStr = tableState.sorts[0];
      const direction = sortStr.startsWith("-") ? "desc" : "asc";
      const column = sortStr.replace("-", "");
      result.sort((a, b) => {
        let valA: any = a[column as keyof LedgerEntry];
        let valB: any = b[column as keyof LedgerEntry];

        if (
          column === "qty" ||
          column === "unitCost" ||
          column === "calculatedUnitCost"
        ) {
          valA = Number(valA || 0);
          valB = Number(valB || 0);
        }

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  };

  const inEntries = filterAndSortEntries(inEntriesAll, inTableState);
  const paginatedInEntries = useMemo(() => {
    const start = (inPage - 1) * inPageSize;
    return inEntries.slice(start, start + inPageSize);
  }, [inEntries, inPage, inPageSize]);

  const outEntries = filterAndSortEntries(outEntriesAll, outTableState);
  const paginatedOutEntries = useMemo(() => {
    const start = (outPage - 1) * outPageSize;
    return outEntries.slice(start, start + outPageSize);
  }, [outEntries, outPage, outPageSize]);

  const totalInQty = useMemo(() => {
    return inEntries.reduce((sum, item) => {
      const q = Number(item.qty || 0);
      const sign = item.isAdjustment && item.adjSign === -1 ? -1 : 1;
      return sum + q * sign;
    }, 0);
  }, [inEntries]);

  const totalOutQty = useMemo(() => {
    return outEntries.reduce((sum, item) => {
      const q = Number(item.qty || 0);
      const sign = item.isAdjustment && item.adjSign === -1 ? -1 : 1;
      return sum + q * sign;
    }, 0);
  }, [outEntries]);

  const inInvoiceOptions = useMemo(() => {
    const opts = new Set<string>();
    const filtered = filterAndSortEntries(
      inEntriesAll,
      inTableState,
      "invoiceNo",
    );
    filtered.forEach((r) => r.invoiceNo && opts.add(r.invoiceNo));
    return Array.from(opts)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v }));
  }, [inEntriesAll, inTableState]);

  const inQtyOptions = useMemo(() => {
    const opts = new Set<number>();
    const filtered = filterAndSortEntries(inEntriesAll, inTableState, "qty");
    filtered.forEach((r) => {
      const prefix = r.isAdjustment && r.adjSign === -1 ? -1 : 1;
      const num = prefix * Number(r.qty || 0);
      opts.add(num);
    });
    return Array.from(opts)
      .sort((a, b) => a - b)
      .map((v) => {
        const str = v.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        return { label: str, value: str };
      });
  }, [inEntriesAll, inTableState]);

  const inUnitCostOptions = useMemo(() => {
    const opts = new Set<number>();
    const filtered = filterAndSortEntries(
      inEntriesAll,
      inTableState,
      "unitCost",
    );
    filtered.forEach((r) => opts.add(Number(r.unitCost || 0)));
    return Array.from(opts)
      .sort((a, b) => a - b)
      .map((v) => ({ label: money(v), value: money(v) }));
  }, [inEntriesAll, inTableState]);

  const outInvoiceOptions = useMemo(() => {
    const opts = new Set<string>();
    const filtered = filterAndSortEntries(
      outEntriesAll,
      outTableState,
      "invoiceNo",
    );
    filtered.forEach((r) => r.invoiceNo && opts.add(r.invoiceNo));
    return Array.from(opts)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v }));
  }, [outEntriesAll, outTableState]);

  const outQtyOptions = useMemo(() => {
    const opts = new Set<number>();
    const filtered = filterAndSortEntries(outEntriesAll, outTableState, "qty");
    filtered.forEach((r) => {
      const prefix = r.isAdjustment && r.adjSign === -1 ? -1 : 1;
      const num = prefix * Number(r.qty || 0);
      opts.add(num);
    });
    return Array.from(opts)
      .sort((a, b) => a - b)
      .map((v) => {
        const str = v.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        return { label: str, value: str };
      });
  }, [outEntriesAll, outTableState]);

  const outCalculatedUnitCostOptions = useMemo(() => {
    const opts = new Set<number>();
    const filtered = filterAndSortEntries(
      outEntriesAll,
      outTableState,
      "calculatedUnitCost",
    );
    filtered.forEach((r) => opts.add(Number(r.calculatedUnitCost || 0)));
    return Array.from(opts)
      .sort((a, b) => a - b)
      .map((v) => ({ label: money(v), value: money(v) }));
  }, [outEntriesAll, outTableState]);

  const inColumns = useMemo<DataTableColumn<LedgerEntry>[]>(
    () => [
      {
        key: "transactionDate",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:DATE", "Ngày")}
            align="center"
            isActive={!!inTableState.columnSearch["transactionDate"]?.length}
            hideFilter={true}
            hideFooter={true}
            sortState={
              inTableState.sorts.includes("transactionDate")
                ? "asc"
                : inTableState.sorts.includes("-transactionDate")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) =>
              inTableState.setSort("transactionDate", state)
            }
            searchValue={inTableState.columnSearch["transactionDate"] || ""}
            onSearchChange={(val) =>
              inTableState.setColumnSearch("transactionDate", val)
            }
            selectedFilters={
              inTableState.columnFilters["transactionDate"] || []
            }
            onFilterChange={(vals) =>
              inTableState.setColumnFilter("transactionDate", vals)
            }
            dateRangeSlot={({ close }) => {
              const val = inTableState.columnSearch["transactionDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    const next = f || t ? `${f}|${t}` : "";
                    inTableState.setColumnSearch("transactionDate", next);
                    close();
                  }}
                />
              );
            }}
          />
        ),
        cell: (row: LedgerEntry) =>
          format(new Date(row.transactionDate), "dd/MM/yyyy"),
        align: "center",
        size: 100,
        enableResizing: true,
      },
      {
        key: "invoiceNo",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:INVOICE", "Hóa đơn")}
            align="center"
            isActive={!!inTableState.columnSearch["invoiceNo"]?.length}
            sortState={
              inTableState.sorts.includes("invoiceNo")
                ? "asc"
                : inTableState.sorts.includes("-invoiceNo")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => inTableState.setSort("invoiceNo", state)}
            searchValue={inTableState.columnSearch["invoiceNo"] || ""}
            onSearchChange={(val) =>
              inTableState.setColumnSearch("invoiceNo", val)
            }
            filterOptions={inInvoiceOptions}
            selectedFilters={inTableState.columnFilters["invoiceNo"] || []}
            onFilterChange={(vals) =>
              inTableState.setColumnFilter("invoiceNo", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => (
          <TableText
            text={row.invoiceNo}
            tooltip={true}
            enableCopy={true}
            onDrawerClick={() => setInvoiceIdToOpen(row.invoiceId)}
          />
        ),
        align: "center",
        size: 120,
        enableResizing: true,
      },
      {
        key: "qty",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:QTY", "SL")}
            align="right"
            sortState={
              inTableState.sorts.includes("qty")
                ? "asc"
                : inTableState.sorts.includes("-qty")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => inTableState.setSort("qty", state)}
            searchValue={inTableState.columnSearch["qty"] || ""}
            onSearchChange={(val) => inTableState.setColumnSearch("qty", val)}
            filterOptions={inQtyOptions}
            selectedFilters={inTableState.columnFilters["qty"] || []}
            onFilterChange={(vals) => inTableState.setColumnFilter("qty", vals)}
          />
        ),
        cell: (row: LedgerEntry) => {
          const prefix = row.isAdjustment && row.adjSign === -1 ? "-" : "";
          return (
            <span className="font-medium w-full text-right block pr-1">
              {prefix}
              {Number(row.qty).toLocaleString()}
            </span>
          );
        },
        align: "right",
        size: 80,
        enableResizing: true,
      },
      {
        key: "unitCost",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:UNIT_COST", "Giá nhập")}
            align="right"
            sortState={
              inTableState.sorts.includes("unitCost")
                ? "asc"
                : inTableState.sorts.includes("-unitCost")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => inTableState.setSort("unitCost", state)}
            searchValue={inTableState.columnSearch["unitCost"] || ""}
            onSearchChange={(val) =>
              inTableState.setColumnSearch("unitCost", val)
            }
            filterOptions={inUnitCostOptions}
            selectedFilters={inTableState.columnFilters["unitCost"] || []}
            onFilterChange={(vals) =>
              inTableState.setColumnFilter("unitCost", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => (
          <span className="w-full text-right block pr-1">
            {money(Number(row.unitCost || 0))}
          </span>
        ),
        align: "right",
        size: 120,
        enableResizing: true,
      },
    ],
    [inTableState, t, setInvoiceIdToOpen],
  );

  const outColumns = useMemo<DataTableColumn<LedgerEntry>[]>(
    () => [
      {
        key: "transactionDate",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:DATE", "Ngày")}
            align="center"
            isActive={!!outTableState.columnSearch["transactionDate"]?.length}
            hideFilter={true}
            hideFooter={true}
            sortState={
              outTableState.sorts.includes("transactionDate")
                ? "asc"
                : outTableState.sorts.includes("-transactionDate")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) =>
              outTableState.setSort("transactionDate", state)
            }
            searchValue={outTableState.columnSearch["transactionDate"] || ""}
            onSearchChange={(val) =>
              outTableState.setColumnSearch("transactionDate", val)
            }
            selectedFilters={
              outTableState.columnFilters["transactionDate"] || []
            }
            onFilterChange={(vals) =>
              outTableState.setColumnFilter("transactionDate", vals)
            }
            dateRangeSlot={({ close }) => {
              const val = outTableState.columnSearch["transactionDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    const next = f || t ? `${f}|${t}` : "";
                    outTableState.setColumnSearch("transactionDate", next);
                    close();
                  }}
                />
              );
            }}
          />
        ),
        cell: (row: LedgerEntry) =>
          format(new Date(row.transactionDate), "dd/MM/yyyy"),
        align: "center",
        size: 100,
        enableResizing: true,
      },
      {
        key: "invoiceNo",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:INVOICE", "Hóa đơn")}
            align="center"
            isActive={!!outTableState.columnSearch["invoiceNo"]?.length}
            sortState={
              outTableState.sorts.includes("invoiceNo")
                ? "asc"
                : outTableState.sorts.includes("-invoiceNo")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => outTableState.setSort("invoiceNo", state)}
            searchValue={outTableState.columnSearch["invoiceNo"] || ""}
            onSearchChange={(val) =>
              outTableState.setColumnSearch("invoiceNo", val)
            }
            filterOptions={outInvoiceOptions}
            selectedFilters={outTableState.columnFilters["invoiceNo"] || []}
            onFilterChange={(vals) =>
              outTableState.setColumnFilter("invoiceNo", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => (
          <TableText
            text={row.invoiceNo}
            tooltip={true}
            enableCopy={true}
            onDrawerClick={() => setInvoiceIdToOpen(row.invoiceId)}
          />
        ),
        align: "center",
        size: 120,
        enableResizing: true,
      },
      {
        key: "qty",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:QTY", "SL")}
            align="right"
            sortState={
              outTableState.sorts.includes("qty")
                ? "asc"
                : outTableState.sorts.includes("-qty")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => outTableState.setSort("qty", state)}
            searchValue={outTableState.columnSearch["qty"] || ""}
            onSearchChange={(val) => outTableState.setColumnSearch("qty", val)}
            filterOptions={outQtyOptions}
            selectedFilters={outTableState.columnFilters["qty"] || []}
            onFilterChange={(vals) =>
              outTableState.setColumnFilter("qty", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => {
          const prefix = row.isAdjustment && row.adjSign === -1 ? "-" : "";
          return (
            <span className="font-medium w-full text-right block pr-1">
              {prefix}
              {Number(row.qty).toLocaleString()}
            </span>
          );
        },
        align: "right",
        size: 80,
        enableResizing: true,
      },
      {
        key: "calculatedUnitCost",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:FIFO_COST", "Giá vốn (FIFO)")}
            align="right"
            sortState={
              outTableState.sorts.includes("calculatedUnitCost")
                ? "asc"
                : outTableState.sorts.includes("-calculatedUnitCost")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) =>
              outTableState.setSort("calculatedUnitCost", state)
            }
            searchValue={outTableState.columnSearch["calculatedUnitCost"] || ""}
            onSearchChange={(val) =>
              outTableState.setColumnSearch("calculatedUnitCost", val)
            }
            filterOptions={outCalculatedUnitCostOptions}
            selectedFilters={
              outTableState.columnFilters["calculatedUnitCost"] || []
            }
            onFilterChange={(vals) =>
              outTableState.setColumnFilter("calculatedUnitCost", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => (
          <span className="w-full text-right block pr-1">
            {money(Number(row.calculatedUnitCost || 0))}
          </span>
        ),
        align: "right",
        size: 120,
        enableResizing: true,
      },
    ],
    [outTableState, t, setInvoiceIdToOpen],
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={t("vinfastParts:FIFO_TRACE_LEDGER", "Lịch sử xuất nhập kho")}
        subtitle={`${sku} - ${catalogData?.name || ""}`}
        titleExtra={
          <Badge
            variant={
              catalogData?.vehicleType === "CAR" ? "default" : "secondary"
            }
          >
            {catalogData?.vehicleType === "CAR"
              ? t("vinfastParts:CAR", "Ô tô")
              : t("vinfastParts:MOTORBIKE", "Xe máy")}
          </Badge>
        }
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        actions={[{ label: t("common:close", "Đóng"), onClick: onClose }]}
        leftPanel={
          <div className="flex flex-col gap-6">
            <VinfastPartTrendChart
              title={t("vinfastParts:TREND", "Biểu đồ biến động")}
              vehicleType="all"
              filterState={{}}
              groupBy="day"
              itemCode={sku}
              chartHeight={148}
            />
            <FifoUnitLedgerSection sku={sku} />
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-4">
            <DrawerSection
              title={t("vinfastParts:PART_INFO", "Thông tin phụ tùng")}
            >
              <DrawerRow
                label={t("vinfastParts:PART_SKU", "Mã phụ tùng")}
                value={<span className="font-semibold">{sku}</span>}
              />
              <DrawerRow
                label={t("vinfastParts:UOM", "Đơn vị tính")}
                value={catalogData?.uom}
              />
              <DrawerRow
                label={t("vinfastParts:PART_NAME", "Tên phụ tùng")}
                value={catalogData?.name}
              />
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center justify-center p-2 bg-orange-50/50 rounded-md">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {t("vinfastParts:TOTAL_IN", "Tổng Nhập")}
                  </span>
                  <span className="font-semibold text-orange-700 text-base">
                    {Number(catalogData?.qtyIn || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-emerald-50/50 rounded-md">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {t("vinfastParts:TOTAL_OUT", "Tổng Xuất")}
                  </span>
                  <span className="font-semibold text-emerald-700 text-base">
                    {Number(catalogData?.qtyOut || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-blue-50/50 rounded-md border border-blue-100">
                  <span className="text-[11px] font-medium text-blue-600/80 uppercase tracking-wider mb-1">
                    {t("vinfastParts:BALANCE", "Tồn cuối")}
                  </span>
                  <span className="font-bold text-blue-700 text-lg">
                    {Number(catalogData?.qtyBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </DrawerSection>
            <DrawerSection
              title={t("vinfastParts:IN_HISTORY", "Lịch sử Nhập (IN)")}
              titleExtra={
                inTableState.activeFilterCount > 0 ? (
                  <FilterButton
                    activeCount={inTableState.activeFilterCount}
                    onClick={() => {}}
                    onClear={inTableState.resetFilters}
                  />
                ) : null
              }
            >
              <DataTable
                variant="spreadsheet"
                enableColumnResizing={true}
                columns={inColumns as any}
                items={paginatedInEntries}
                loading={loading}
                emptyLabel={t(
                  "vinfastParts:NO_DATA_IN",
                  "Không có dữ liệu nhập",
                )}
                containerClassName="h-auto overflow-y-auto max-h-[240px]"
                summaryRow={{
                  invoiceNo: (
                    <div className="text-right w-full font-semibold pr-2">
                      {t("vinfastParts:TOTAL", "Tổng cộng")}:
                    </div>
                  ),
                  qty: (
                    <div className="text-right font-semibold text-emerald-600 tabular-nums">
                      {totalInQty.toLocaleString()}
                    </div>
                  ),
                }}
                page={inPage}
                pageSize={inPageSize}
                pageSizeOptions={[4, 10, 20, 50]}
                paginationClassName="justify-center"
                onPage={setInPage}
                onPageSize={setInPageSize}
                total={inEntries.length}
                totalPages={Math.ceil(inEntries.length / inPageSize)}
              />
            </DrawerSection>

            <DrawerSection
              title={t("vinfastParts:OUT_HISTORY", "Lịch sử Xuất (OUT)")}
              titleExtra={
                outTableState.activeFilterCount > 0 ? (
                  <FilterButton
                    activeCount={outTableState.activeFilterCount}
                    onClick={() => {}}
                    onClear={outTableState.resetFilters}
                  />
                ) : null
              }
            >
              <DataTable
                variant="spreadsheet"
                enableColumnResizing={true}
                columns={outColumns as any}
                items={paginatedOutEntries}
                loading={loading}
                emptyLabel={t(
                  "vinfastParts:NO_DATA_OUT",
                  "Không có dữ liệu xuất",
                )}
                containerClassName="h-auto overflow-y-auto max-h-[240px]"
                summaryRow={{
                  invoiceNo: (
                    <div className="text-right w-full font-semibold pr-2">
                      {t("vinfastParts:TOTAL", "Tổng cộng")}:
                    </div>
                  ),
                  qty: (
                    <div className="text-right font-semibold text-rose-600 tabular-nums">
                      {totalOutQty.toLocaleString()}
                    </div>
                  ),
                }}
                page={outPage}
                pageSize={outPageSize}
                pageSizeOptions={[4, 10, 20, 50]}
                paginationClassName="justify-center"
                onPage={setOutPage}
                onPageSize={setOutPageSize}
                total={outEntries.length}
                totalPages={Math.ceil(outEntries.length / outPageSize)}
              />
            </DrawerSection>
          </div>
        }
      />
      <ErpInvoiceStandaloneDrawer
        isOpen={!!invoiceIdToOpen}
        invoiceId={invoiceIdToOpen}
        onClose={() => setInvoiceIdToOpen(null)}
      />
    </>
  );
}
