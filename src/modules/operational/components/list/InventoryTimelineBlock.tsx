import { useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { fmtQty, formatGMT7 } from "@/shared/utils/format";
import type {
  InventoryMovementsPayload,
  InventoryMovement,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { InvoiceDateRangeSlot } from "@/modules/erp-invoices-core/components/InvoiceDateRangeSlot";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { FilterButton } from "@/shared/components/FilterPanel";
import { DrawerSection } from "@/shared/components/DrawerModal";

interface InventoryTimelineBlockProps {
  itemId: string;
  loadingId: string | null;
  error: string | null;
  data?: InventoryMovementsPayload;
  onOpenDocument?: (docId: string, docType: string) => void;
  containerClassName?: string;
}

/**
 * Block hiển thị lịch sử xuất nhập kho theo timeline cho 1 item.
 * Extracted từ OperationalListPage.tsx (dòng 142–262).
 */
export function InventoryTimelineBlock({
  itemId,
  loadingId,
  error,
  data,
  onOpenDocument,
  containerClassName = "max-h-[200px] overflow-y-auto",
}: InventoryTimelineBlockProps) {
  const t = useT();
  const isLoading = loadingId === itemId;

  const tableId = `timeline-table-${itemId}`;
  const tableState = useTableColumnState(tableId);
  const movements = data?.movements;

  const sortedMovements = useMemo(() => {
    if (!movements) return [];
    let list = [...movements];

    // Search
    if (tableState.columnSearch["documentNo"]) {
      const q = tableState.columnSearch["documentNo"].toLowerCase();
      list = list.filter((m) => m.documentNo?.toLowerCase().includes(q));
    }
    if (tableState.columnSearch["notes"]) {
      const q = tableState.columnSearch["notes"].toLowerCase();
      list = list.filter((m) => m.notes?.toLowerCase().includes(q));
    }

    // Filter by options (selectedFilters)
    if (tableState.columnFilters["type"]?.length) {
      const filters = tableState.columnFilters["type"];
      list = list.filter((m) => {
        const isAdj = m.documentType === "INVENTORY_ADJUSTMENT";
        const isIn = Number(m.qtyIn || 0) > 0;
        const typeStr = isAdj ? "ADJ" : isIn ? "IN" : "OUT";
        return filters.includes(typeStr);
      });
    }
    if (tableState.columnFilters["documentNo"]?.length) {
      const filters = tableState.columnFilters["documentNo"];
      list = list.filter((m) => m.documentNo && filters.includes(m.documentNo));
    }
    if (tableState.columnFilters["notes"]?.length) {
      const filters = tableState.columnFilters["notes"];
      list = list.filter((m) => m.notes && filters.includes(m.notes));
    }
    const timeFilter = tableState.columnFilters["time"];
    if (timeFilter && timeFilter.length >= 2) {
      const from = timeFilter[0];
      const to = timeFilter[1];
      if (from) {
        list = list.filter(
          (m) => m.transactionDate && m.transactionDate >= from,
        );
      }
      if (to) {
        list = list.filter(
          (m) => m.transactionDate && m.transactionDate <= to + "T23:59:59Z",
        );
      }
    }
    if (tableState.columnFilters["change"]?.length) {
      const filters = tableState.columnFilters["change"];
      list = list.filter((m) => {
        const c = Number(m.qtyIn || 0) > 0 ? `+${m.qtyIn}` : `-${m.qtyOut}`;
        return filters.includes(c);
      });
    }
    if (tableState.columnFilters["balance"]?.length) {
      const filters = tableState.columnFilters["balance"];
      list = list.filter(
        (m) => m.balanceAfter && filters.includes(String(m.balanceAfter)),
      );
    }

    // Sort
    if (tableState.sorts.length > 0) {
      const sort = tableState.sorts[0];
      const isDesc = sort.startsWith("-");
      const field = isDesc ? sort.substring(1) : sort;

      list.sort((a: any, b: any) => {
        let valA = a[field];
        let valB = b[field];

        if (field === "time") {
          valA = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
          valB = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
        } else if (field === "change") {
          valA =
            Number(a.qtyIn || 0) > 0 ? Number(a.qtyIn) : -Number(a.qtyOut || 0);
          valB =
            Number(b.qtyIn || 0) > 0 ? Number(b.qtyIn) : -Number(b.qtyOut || 0);
        } else if (field === "type") {
          valA = Number(a.qtyIn || 0) > 0 ? "in" : "out";
          valB = Number(b.qtyIn || 0) > 0 ? "in" : "out";
        }

        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    } else {
      list.reverse();
    }
    return list;
  }, [
    movements,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
  ]);

  const getSortState = (field: string) =>
    tableState.sorts.includes(field)
      ? "asc"
      : tableState.sorts.includes(`-${field}`)
        ? "desc"
        : "none";

  const docOptions = useMemo(() => {
    if (!movements) return [];
    const uniqueDocs = Array.from(
      new Set(movements.map((m) => m.documentNo).filter(Boolean)),
    );
    return uniqueDocs.map((d) => ({ label: d as string, value: d as string }));
  }, [movements]);

  const noteOptions = useMemo(() => {
    if (!movements) return [];
    const uniqueNotes = Array.from(
      new Set(movements.map((m) => m.notes).filter(Boolean)),
    );
    return uniqueNotes.map((n) => ({ label: n as string, value: n as string }));
  }, [movements]);

  const changeOptions = useMemo(() => {
    if (!movements) return [];
    const uniqueChanges = Array.from(
      new Set(
        movements.map((m) => {
          const c = Number(m.qtyIn || 0) > 0 ? `+${m.qtyIn}` : `-${m.qtyOut}`;
          return c;
        }),
      ),
    );
    return uniqueChanges.map((c) => ({ label: c, value: c }));
  }, [movements]);

  const balanceOptions = useMemo(() => {
    if (!movements) return [];
    const uniqueBalances = Array.from(
      new Set(movements.map((m) => m.balanceAfter).filter(Boolean)),
    );
    return uniqueBalances.map((b) => ({ label: String(b), value: String(b) }));
  }, [movements]);

  const timelineColumns: DataTableColumn<InventoryMovement>[] = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: InventoryMovement, idx: number) => (
          <span className="text-muted-foreground text-xs">{idx}</span>
        ),
      },
      {
        key: "time",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.history.time")}
            align="center"
            sortState={getSortState("time")}
            onSortChange={(s) => tableState.setSort("time", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={
              !!(
                tableState.columnFilters["time"]?.[0] ||
                tableState.columnFilters["time"]?.[1]
              )
            }
            dateRangeSlot={({ close }) => (
              <InvoiceDateRangeSlot
                dateFrom={tableState.columnFilters["time"]?.[0] || ""}
                dateTo={tableState.columnFilters["time"]?.[1] || ""}
                onChange={(from, to) => {
                  tableState.setColumnFilter("time", [from, to]);
                  close();
                }}
                onClose={close}
              />
            )}
          />
        ),
        className: "text-center",
        headerClassName: "text-center",
        size: 200,
        cell: (m) => {
          if (!m.transactionDate) return "—";
          const dateTime = formatGMT7(m.transactionDate, "datetime-sec");
          const [datePart = "", timePart = ""] = dateTime.split(" ");
          return (
            <div className="flex flex-col text-center">
              <span className="text-sm text-gray-900">{datePart}</span>
              <span className="text-xs text-gray-500">{timePart}</span>
            </div>
          );
        },
      },
      {
        key: "type",
        header: (
          <TableColumnHeaderFilter
            title={t("Loại")}
            align="center"
            sortState={getSortState("type")}
            onSortChange={(s) => tableState.setSort("type", s)}
            searchValue={tableState.columnSearch["type"] || ""}
            onSearchChange={(v) => tableState.setColumnSearch("type", v)}
            selectedFilters={tableState.columnFilters["type"] || []}
            onFilterChange={(v) => tableState.setColumnFilter("type", v)}
            isActive={
              (tableState.columnFilters["type"]?.length ?? 0) > 0 ||
              !!tableState.columnSearch["type"]
            }
            filterOptions={[
              { label: "Nhập kho", value: "IN" },
              { label: "Xuất kho", value: "OUT" },
              { label: "Điều chỉnh kho", value: "ADJ" },
            ]}
          />
        ),
        headerClassName: "text-center",
        className: "text-center",
        size: 120,
        cell: (m) => {
          const isIn = Number(m.qtyIn || 0) > 0;
          const isAdjustment = m.documentType === "INVENTORY_ADJUSTMENT";

          let icon;
          let title;

          if (isAdjustment) {
            icon = <SlidersHorizontal className="h-4 w-4 text-blue-600" />;
            title = t("Điều chỉnh kho");
          } else if (isIn) {
            icon = <PackagePlus className="h-4 w-4 text-emerald-600" />;
            title = t("Nhập kho");
          } else {
            icon = <PackageMinus className="h-4 w-4 text-orange-600" />;
            title = t("Xuất kho");
          }

          return (
            <div className="flex justify-center items-center">
              <span title={title} className="flex-shrink-0">
                {icon}
              </span>
            </div>
          );
        },
      },
      {
        key: "documentNo",
        header: (
          <TableColumnHeaderFilter
            title={t("Số phiếu")}
            align="center"
            sortState={getSortState("documentNo")}
            onSortChange={(s) => tableState.setSort("documentNo", s)}
            searchValue={tableState.columnSearch["documentNo"] || ""}
            onSearchChange={(v) => tableState.setColumnSearch("documentNo", v)}
            selectedFilters={tableState.columnFilters["documentNo"] || []}
            onFilterChange={(v) => tableState.setColumnFilter("documentNo", v)}
            isActive={
              (tableState.columnFilters["documentNo"]?.length ?? 0) > 0 ||
              !!tableState.columnSearch["documentNo"]
            }
            filterOptions={docOptions}
          />
        ),
        headerClassName: "text-center",
        className: "text-left align-middle",
        size: 200,
        enableResizing: true,
        cell: (m) => {
          if (!m.documentNo) return "—";
          return (
            <div className="flex items-center gap-2 w-full">
              <TableText
                text={m.documentNo}
                enableCopy={true}
                tooltip={true}
                onDrawerClick={(e) => {
                  e.stopPropagation();
                  if (m.documentId && m.documentType && onOpenDocument) {
                    onOpenDocument(m.documentId, m.documentType);
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        key: "notes",
        header: (
          <TableColumnHeaderFilter
            title={t("Ghi chú")}
            align="center"
            sortState={getSortState("notes")}
            onSortChange={(s) => tableState.setSort("notes", s)}
            searchValue={tableState.columnSearch["notes"] || ""}
            onSearchChange={(v) => tableState.setColumnSearch("notes", v)}
            selectedFilters={tableState.columnFilters["notes"] || []}
            onFilterChange={(v) => tableState.setColumnFilter("notes", v)}
            isActive={
              (tableState.columnFilters["notes"]?.length ?? 0) > 0 ||
              !!tableState.columnSearch["notes"]
            }
            filterOptions={noteOptions}
          />
        ),
        headerClassName: "text-center",
        className: "text-left align-middle",
        enableResizing: true,
        size: 250,
        cell: (m) => {
          if (!m.notes) return null;
          return (
            <Tooltip content={m.notes} side="top">
              <span className="inline-block max-w-[250px] truncate text-xs text-muted-foreground cursor-help">
                {m.notes}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "change",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.history.change")}
            align="center"
            sortState={getSortState("change")}
            onSortChange={(s) => tableState.setSort("change", s)}
            searchValue={tableState.columnSearch["change"] || ""}
            onSearchChange={(v) => tableState.setColumnSearch("change", v)}
            selectedFilters={tableState.columnFilters["change"] || []}
            onFilterChange={(v) => tableState.setColumnFilter("change", v)}
            isActive={
              (tableState.columnFilters["change"]?.length ?? 0) > 0 ||
              !!tableState.columnSearch["change"]
            }
            filterOptions={changeOptions}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        size: 120,
        cell: (m) => {
          const isIn = Number(m.qtyIn || 0) > 0;
          const qty = isIn ? m.qtyIn : m.qtyOut;
          return (
            <span
              className={
                isIn
                  ? "inline-block w-full text-right text-sm tabular-nums font-medium text-emerald-600"
                  : "inline-block w-full text-right text-sm tabular-nums font-medium text-amber-600"
              }
            >
              {isIn ? "+" : "-"}
              {fmtQty(qty)}
            </span>
          );
        },
      },
      {
        key: "balance",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.history.balance")}
            align="center"
            sortState={getSortState("balanceAfter")}
            onSortChange={(s) => tableState.setSort("balanceAfter", s)}
            searchValue={tableState.columnSearch["balance"] || ""}
            onSearchChange={(v) => tableState.setColumnSearch("balance", v)}
            selectedFilters={tableState.columnFilters["balance"] || []}
            onFilterChange={(v) => tableState.setColumnFilter("balance", v)}
            isActive={
              (tableState.columnFilters["balance"]?.length ?? 0) > 0 ||
              !!tableState.columnSearch["balance"]
            }
            filterOptions={balanceOptions}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        size: 120,
        cell: (m) => (
          <span className="inline-block w-full text-right text-sm tabular-nums font-medium text-foreground">
            {fmtQty(m.balanceAfter)}
          </span>
        ),
      },
    ],
    [
      t,
      tableState.columnFilters,
      tableState.columnSearch,
      tableState.sorts,
      docOptions,
      noteOptions,
      changeOptions,
      balanceOptions,
    ],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-6 sm:p-8 flex items-center justify-center text-sm text-muted-foreground my-2 shadow-sm border border-border">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("inventory.history.loading")}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-6 flex items-center justify-center text-sm text-red-700 my-2 shadow-sm">
        <AlertCircle className="mr-2 h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <DrawerSection
      title={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full justify-between pr-4 mt-2 sm:mt-0">
          <div className="flex items-center gap-3">
            <span className="shrink-0 mb-2 sm:mb-0">
              {t("Lịch sử xuất nhập kho")} (
              {sortedMovements.length < (movements?.length || 0)
                ? `${sortedMovements.length}/${movements?.length || 0}`
                : movements?.length || 0}
              )
            </span>
          </div>
        </div>
      }
      titleExtra={
        <div className="flex items-center gap-2">
          <FilterButton
            onClick={() => {}}
            activeCount={tableState.activeFilterCount}
            onClear={() => tableState.resetFilters()}
          />
        </div>
      }
    >
      <StandardTable
        tableId={`timeline-table-${itemId}`}
        items={sortedMovements}
        columns={timelineColumns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        enableColumnResizing={true}
        enableRowSelection={false}
        enableColumnVisibility={false}
        emptyLabel={t("inventory.history.empty")}
        minWidth={600}
        containerClassName={containerClassName}
      />
    </DrawerSection>
  );
}
