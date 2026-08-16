import { useMemo, useState } from "react";
import { DownloadCloud, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TablePagination } from "@/shared/components/TablePagination";
import { fmtQty } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import type { InventoryMovement } from "../api/inventoryCoreApi";
import {
  buildInventoryLedgerRows,
  buildInventoryTrendData,
  exportInventoryLedgerToExcel,
  type InventoryLedgerRow,
  type InventoryLedgerTotals,
} from "../utils/inventoryLedgerTransform";
import { InventoryItemTrendChart } from "./InventoryItemTrendChart";
import { InventoryFlatLedgerTable } from "./InventoryFlatLedgerTable";

interface InventoryStockLedgerSectionProps {
  itemId: string;
  loading: boolean;
  error: string | null;
  movements?: InventoryMovement[];
  itemInfo: {
    sku: string;
    itemName: string;
    uom?: string;
  };
  onOpenDocument?: (docId: string, docType: string) => void;
}

export function InventoryStockLedgerSection({
  itemId,
  loading,
  error,
  movements = [],
  itemInfo,
  onOpenDocument,
}: InventoryStockLedgerSectionProps) {
  const t = useT();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tableId = `inventory-flat-ledger-${itemId}`;
  const tableState = useTableColumnState(tableId);

  // 1. Build chronological ledger rows
  const allRows = useMemo(() => {
    return buildInventoryLedgerRows(movements);
  }, [movements]);

  // 2. Build trend chart data
  const trendData = useMemo(() => {
    return buildInventoryTrendData(allRows);
  }, [allRows]);

  // 3. Filter & Sort logic
  const getFilteredByOthers = (colToSkip: string) => {
    let result = [...allRows];

    // Date range filter
    if (colToSkip !== "transactionDate") {
      const dateRange = tableState.columnSearch["transactionDate"];
      if (dateRange) {
        const [from, to] = dateRange.split("|");
        if (from || to) {
          result = result.filter((r) => {
            if (!r.transactionDate) return false;
            const d = r.transactionDate.split("T")[0];
            const matchesFrom = !from || d >= from;
            const matchesTo = !to || d <= to;
            return matchesFrom && matchesTo;
          });
        }
      }
    }

    // Column Search
    Object.entries(tableState.columnSearch).forEach(([col, searchVal]) => {
      if (!searchVal || col === "transactionDate" || col === colToSkip) return;
      result = result.filter((e) => {
        const val = e[col as keyof InventoryLedgerRow];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(searchVal.toLowerCase());
      });
    });

    // Column Filters (dropdown selections)
    Object.entries(tableState.columnFilters).forEach(([col, selectedVals]) => {
      if (!selectedVals || !selectedVals.length || col === colToSkip) return;
      result = result.filter((e) => {
        const val = e[col as keyof InventoryLedgerRow];
        let formattedVal = String(val ?? "");
        if (col === "inQty" || col === "outQty" || col === "balanceQty") {
          formattedVal = val != null ? fmtQty(Number(val)) : "";
        }
        return selectedVals.includes(formattedVal);
      });
    });

    return result;
  };

  const optionsMap = useMemo(() => {
    const map: Record<string, { label: string; value: string }[]> = {};

    const docRows = getFilteredByOthers("documentNo");
    const docSet = new Set<string>();
    docRows.forEach((r) => r.documentNo && docSet.add(r.documentNo));
    map["documentNo"] = Array.from(docSet)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v }));

    const noteRows = getFilteredByOthers("notes");
    const noteSet = new Set<string>();
    noteRows.forEach((r) => {
      if (r.notes) noteSet.add(r.notes);
      else if (r.typeLabel) noteSet.add(r.typeLabel);
    });
    map["notes"] = Array.from(noteSet)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v }));

    const inQtyRows = getFilteredByOthers("inQty");
    const inQtySet = new Set<number>();
    inQtyRows.forEach((r) => r.inQty != null && inQtySet.add(r.inQty));
    map["inQty"] = Array.from(inQtySet)
      .sort((a, b) => a - b)
      .map((v) => ({ label: fmtQty(v), value: fmtQty(v) }));

    const outQtyRows = getFilteredByOthers("outQty");
    const outQtySet = new Set<number>();
    outQtyRows.forEach((r) => r.outQty != null && outQtySet.add(r.outQty));
    map["outQty"] = Array.from(outQtySet)
      .sort((a, b) => a - b)
      .map((v) => ({ label: fmtQty(v), value: fmtQty(v) }));

    const balanceQtyRows = getFilteredByOthers("balanceQty");
    const balanceQtySet = new Set<number>();
    balanceQtyRows.forEach((r) => balanceQtySet.add(r.balanceQty));
    map["balanceQty"] = Array.from(balanceQtySet)
      .sort((a, b) => a - b)
      .map((v) => ({ label: fmtQty(v), value: fmtQty(v) }));

    return map;
  }, [allRows, tableState.columnSearch, tableState.columnFilters]);

  const filteredRows = useMemo(() => {
    const result = getFilteredByOthers("");

    // Sort
    if (tableState.sorts.length > 0) {
      const sortStr = tableState.sorts[0];
      const isDesc = sortStr.startsWith("-");
      const col = isDesc ? sortStr.substring(1) : sortStr;

      result.sort((a: any, b: any) => {
        let valA = a[col];
        let valB = b[col];

        if (col === "transactionDate") {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else if (
          col === "inQty" ||
          col === "outQty" ||
          col === "balanceQty" ||
          col === "inTotal" ||
          col === "outTotal" ||
          col === "balanceTotal"
        ) {
          valA = Number(valA || 0);
          valB = Number(valB || 0);
        } else if (typeof valA === "string" && typeof valB === "string") {
          return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }

        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    } else {
      // Default: latest movements on top
      result.reverse();
    }

    return result;
  }, [
    allRows,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
  ]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const totals = useMemo<InventoryLedgerTotals>(() => {
    // Latest chronological balance
    const latestRow = [...allRows].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime(),
    )[0];

    return filteredRows.reduce(
      (acc, r) => {
        acc.inQty += r.inQty || 0;
        acc.inTotal += r.inTotal || 0;
        acc.outQty += r.outQty || 0;
        acc.outTotal += r.outTotal || 0;
        return acc;
      },
      {
        inQty: 0,
        inTotal: 0,
        outQty: 0,
        outTotal: 0,
        balanceQty: latestRow?.balanceQty || 0,
        balanceTotal: latestRow?.balanceTotal || 0,
      },
    );
  }, [filteredRows, allRows]);

  const activeFilterCount = tableState.activeFilterCount;

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-12 flex flex-col items-center justify-center text-sm text-muted-foreground my-2 shadow-sm border border-border">
        <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
        {t("inventory.history.loading", "Đang tải lịch sử xuất nhập kho...")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 flex items-center justify-center text-sm text-destructive my-2 shadow-sm">
        <AlertCircle className="mr-2 h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Trend Chart */}
      <InventoryItemTrendChart
        trendData={trendData}
        chartHeight={200}
        uomName={itemInfo.uom}
      />

      {/* 2. Flat Multi-tier Ledger Table */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2">
            <span>{t("inventory.history.title", "Lịch sử xuất nhập kho")}</span>
            <span className="text-xs font-normal text-muted-foreground">
              (
              {filteredRows.length < allRows.length
                ? `${filteredRows.length}/${allRows.length}`
                : allRows.length}{" "}
              {t("inventory.history.transactions", "giao dịch")})
            </span>
          </div>
        }
        titleExtra={
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <FilterButton
                activeCount={activeFilterCount}
                onClick={() => {}}
                onClear={() => tableState.resetFilters()}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 bg-card hover:bg-muted text-foreground border-border shadow-xs"
              onClick={() =>
                exportInventoryLedgerToExcel(filteredRows, itemInfo)
              }
              disabled={allRows.length === 0}
            >
              <DownloadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t("inventory.history.exportExcel", "Xuất Excel")}</span>
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <InventoryFlatLedgerTable
            data={paginatedRows}
            tableState={tableState}
            totals={totals}
            optionsMap={optionsMap}
            onOpenDocument={onOpenDocument}
            uomName={itemInfo.uom}
          />

          {filteredRows.length > 0 && (
            <TablePagination
              page={page}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              total={filteredRows.length}
              totalPages={Math.ceil(filteredRows.length / pageSize)}
              onPage={setPage}
              onPageSize={(s: number) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          )}
        </div>
      </DrawerSection>
    </div>
  );
}
