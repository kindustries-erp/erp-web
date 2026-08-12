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
import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { format } from "date-fns";
import { money } from "@/shared/utils/format";
import { useMemo, useState } from "react";

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
  const [outPage, setOutPage] = useState(1);
  const [inPageSize, setInPageSize] = useState(5);
  const [outPageSize, setOutPageSize] = useState(5);
  const [invoiceIdToOpen, setInvoiceIdToOpen] = useState<string | null>(null);

  const inTableState = useTableColumnState("vinfast-parts-in-history");
  const outTableState = useTableColumnState("vinfast-parts-out-history");

  const filterAndSortEntries = (
    data: LedgerEntry[],
    tableState: ReturnType<typeof useTableColumnState>,
  ) => {
    let result = [...data];
    if (tableState.columnSearch["transactionDate"]?.length) {
      // Implement basic date filter if needed, or skip for now since it's exact match string filter in generic columnSearch.
      // Usually date uses DateRangeColumnSlot which sets columnFilters
      const dates = tableState.columnFilters["transactionDate"] as any;
      if (dates && dates.from && dates.to) {
        result = result.filter((e) => {
          const d = new Date(e.transactionDate).getTime();
          return d >= dates.from && d <= dates.to;
        });
      }
    }

    // search text
    const searchInvoice = tableState.columnSearch["invoiceNo"];
    if (searchInvoice) {
      result = result.filter((e) =>
        e.invoiceNo?.toLowerCase().includes(searchInvoice.toLowerCase()),
      );
    }

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
          />
        ),
        cell: (row: LedgerEntry) =>
          format(new Date(row.transactionDate), "dd/MM/yyyy"),
        align: "center",
        width: 100,
      },
      {
        key: "invoiceNo",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:INVOICE", "Hóa đơn")}
            align="center"
            isActive={!!inTableState.columnSearch["invoiceNo"]?.length}
            hideFooter={true}
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
      },
      {
        key: "qty",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:QTY", "SL")}
            align="right"
            hideFilter={true}
            hideFooter={true}
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
            selectedFilters={inTableState.columnFilters["qty"] || []}
            onFilterChange={(vals) => inTableState.setColumnFilter("qty", vals)}
          />
        ),
        cell: (row: LedgerEntry) => {
          const prefix = row.isAdjustment && row.adjSign === -1 ? "-" : "";
          return (
            <span className="font-medium">
              {prefix}
              {Number(row.qty).toLocaleString()}
            </span>
          );
        },
        align: "right",
      },
      {
        key: "unitCost",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:UNIT_COST", "Giá nhập")}
            align="right"
            hideFilter={true}
            hideFooter={true}
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
            selectedFilters={inTableState.columnFilters["unitCost"] || []}
            onFilterChange={(vals) =>
              inTableState.setColumnFilter("unitCost", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => money(Number(row.unitCost)),
        align: "right",
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
          />
        ),
        cell: (row: LedgerEntry) =>
          format(new Date(row.transactionDate), "dd/MM/yyyy"),
        align: "center",
        width: 100,
      },
      {
        key: "invoiceNo",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:INVOICE", "Hóa đơn")}
            align="center"
            isActive={!!outTableState.columnSearch["invoiceNo"]?.length}
            hideFooter={true}
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
      },
      {
        key: "qty",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:QTY", "SL")}
            align="right"
            hideFilter={true}
            hideFooter={true}
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
            selectedFilters={outTableState.columnFilters["qty"] || []}
            onFilterChange={(vals) =>
              outTableState.setColumnFilter("qty", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => {
          const prefix = row.isAdjustment && row.adjSign === -1 ? "-" : "";
          return (
            <span className="font-medium">
              {prefix}
              {Number(row.qty).toLocaleString()}
            </span>
          );
        },
        align: "right",
      },
      {
        key: "calculatedUnitCost",
        header: () => (
          <TableColumnHeaderFilter
            title={t("vinfastParts:FIFO_COST", "Giá vốn (FIFO)")}
            align="right"
            hideFilter={true}
            hideFooter={true}
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
            selectedFilters={
              outTableState.columnFilters["calculatedUnitCost"] || []
            }
            onFilterChange={(vals) =>
              outTableState.setColumnFilter("calculatedUnitCost", vals)
            }
          />
        ),
        cell: (row: LedgerEntry) => money(Number(row.calculatedUnitCost || 0)),
        align: "right",
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
        title={t(
          "vinfastParts:FIFO_TRACE_LEDGER",
          "Lịch sử luân chuyển FIFO (Ledger)",
        )}
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
            <div className="grid grid-cols-2 gap-4">
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
                  containerClassName="h-auto overflow-y-auto"
                  page={inPage}
                  pageSize={inPageSize}
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
                  containerClassName="h-auto overflow-y-auto"
                  page={outPage}
                  pageSize={outPageSize}
                  onPage={setOutPage}
                  onPageSize={setOutPageSize}
                  total={outEntries.length}
                  totalPages={Math.ceil(outEntries.length / outPageSize)}
                />
              </DrawerSection>
            </div>

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
            </DrawerSection>
            <DrawerSection
              title={t("vinfastParts:STOCK_SUMMARY", "Tổng hợp kho")}
            >
              <DrawerRow
                label={t("vinfastParts:TOTAL_IN", "Tổng Nhập")}
                value={
                  <span className="text-green-600 font-semibold">
                    {Number(catalogData?.qtyIn || 0).toLocaleString()}
                  </span>
                }
              />
              <DrawerRow
                label={t("vinfastParts:TOTAL_OUT", "Tổng Xuất")}
                value={
                  <span className="text-red-600 font-semibold">
                    {Number(catalogData?.qtyOut || 0).toLocaleString()}
                  </span>
                }
              />
              <DrawerRow
                label={t("vinfastParts:BALANCE", "Tồn cuối")}
                value={
                  <span className="text-xl font-bold">
                    {Number(catalogData?.qtyBalance || 0).toLocaleString()}
                  </span>
                }
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
