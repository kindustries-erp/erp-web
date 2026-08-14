import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DownloadCloud } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TablePagination } from "@/shared/components/TablePagination";

import { useFifoUnitLedger } from "./useFifoUnitLedger";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { VinfastPartsStockExportDrawer } from "../VinfastPartsStockExportDrawer";
import { FifoFlatTable, FifoFlatTableTotals } from "./FifoFlatTable";
import { buildFlatLedgerRows } from "./fifoTransform";

interface FifoUnitLedgerSectionProps {
  sku: string;
}

export function FifoUnitLedgerSection({ sku }: FifoUnitLedgerSectionProps) {
  const { t } = useTranslation(["vinfastParts", "reports", "common"]);
  const [invoiceIdToOpen, setInvoiceIdToOpen] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useFifoUnitLedger(sku, true);
  const rows = data || [];

  const displayRows = useMemo(() => {
    return buildFlatLedgerRows(rows);
  }, [rows]);

  const tableState = useTableColumnState("fifo-unit-ledger");
  const [exportOpen, setExportOpen] = useState(false);

  const buildBaseQuery = () => {
    return {
      columnFilters: JSON.stringify({ sku: [sku] }),
    };
  };

  const getFilteredByOthers = (colToSkip: string) => {
    let result = [...displayRows];

    // date
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

    Object.entries(tableState.columnSearch).forEach(([col, searchVal]) => {
      if (!searchVal || col === "transactionDate" || col === colToSkip) return;
      result = result.filter((e) => {
        const val = e[col as keyof typeof e];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(searchVal.toLowerCase());
      });
    });

    Object.entries(tableState.columnFilters).forEach(([col, selectedVals]) => {
      if (!selectedVals || !selectedVals.length || col === colToSkip) return;
      result = result.filter((e) => {
        const val = e[col as keyof typeof e];
        let formattedVal = String(val || "");
        if (col === "inQty" || col === "outQty" || col === "balanceQty") {
          formattedVal = Number(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          });
        } else if (
          col === "inTotal" ||
          col === "outCogs" ||
          col === "balanceValue" ||
          col === "outRevenue" ||
          col === "outProfit" ||
          col === "inUnitCost" ||
          col === "outUnitCost" ||
          col === "outSellPrice"
        ) {
          formattedVal = Number(val || 0).toLocaleString() + " ₫";
        } else if (col === "outMargin") {
          formattedVal = Number(val || 0).toFixed(1) + "%";
        }
        return selectedVals.includes(formattedVal);
      });
    });

    return result;
  };

  const optionsMap = useMemo(() => {
    const map: Record<string, { label: string; value: string }[]> = {};

    const invoiceRows = getFilteredByOthers("invoiceNo");
    const invSet = new Set<string>();
    invoiceRows.forEach((r) => r.invoiceNo && invSet.add(r.invoiceNo));
    map["invoiceNo"] = Array.from(invSet)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v }));

    const partnerRows = getFilteredByOthers("partnerName");
    const partSet = new Set<string>();
    partnerRows.forEach((r) => r.partnerName && partSet.add(r.partnerName));
    map["partnerName"] = Array.from(partSet)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v }));

    const inQtyRows = getFilteredByOthers("inQty");
    const inQtySet = new Set<number>();
    inQtyRows.forEach((r) => r.inQty != null && inQtySet.add(r.inQty));
    map["inQty"] = Array.from(inQtySet)
      .sort((a, b) => a - b)
      .map((v) => {
        const str = v.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        return { label: str, value: str };
      });

    const outQtyRows = getFilteredByOthers("outQty");
    const outQtySet = new Set<number>();
    outQtyRows.forEach((r) => r.outQty != null && outQtySet.add(r.outQty));
    map["outQty"] = Array.from(outQtySet)
      .sort((a, b) => a - b)
      .map((v) => {
        const str = v.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        return { label: str, value: str };
      });

    const inTotalRows = getFilteredByOthers("inTotal");
    const inTotalSet = new Set<number>();
    inTotalRows.forEach((r) => r.inTotal != null && inTotalSet.add(r.inTotal));
    map["inTotal"] = Array.from(inTotalSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const outCogsRows = getFilteredByOthers("outCogs");
    const outCogsSet = new Set<number>();
    outCogsRows.forEach((r) => r.outCogs != null && outCogsSet.add(r.outCogs));
    map["outCogs"] = Array.from(outCogsSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const balanceQtyRows = getFilteredByOthers("balanceQty");
    const balanceQtySet = new Set<number>();
    balanceQtyRows.forEach(
      (r) => r.balanceQty != null && balanceQtySet.add(r.balanceQty),
    );
    map["balanceQty"] = Array.from(balanceQtySet)
      .sort((a, b) => a - b)
      .map((v) => {
        const str = v.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        return { label: str, value: str };
      });

    const balanceValueRows = getFilteredByOthers("balanceValue");
    const balanceValueSet = new Set<number>();
    balanceValueRows.forEach(
      (r) => r.balanceValue != null && balanceValueSet.add(r.balanceValue),
    );
    map["balanceValue"] = Array.from(balanceValueSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const outRevenueRows = getFilteredByOthers("outRevenue");
    const outRevenueSet = new Set<number>();
    outRevenueRows.forEach(
      (r) => r.outRevenue != null && outRevenueSet.add(r.outRevenue),
    );
    map["outRevenue"] = Array.from(outRevenueSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const outProfitRows = getFilteredByOthers("outProfit");
    const outProfitSet = new Set<number>();
    outProfitRows.forEach(
      (r) => r.outProfit != null && outProfitSet.add(r.outProfit),
    );
    map["outProfit"] = Array.from(outProfitSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const inUnitCostRows = getFilteredByOthers("inUnitCost");
    const inUnitCostSet = new Set<number>();
    inUnitCostRows.forEach(
      (r) => r.inUnitCost != null && inUnitCostSet.add(r.inUnitCost),
    );
    map["inUnitCost"] = Array.from(inUnitCostSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const outUnitCostRows = getFilteredByOthers("outUnitCost");
    const outUnitCostSet = new Set<number>();
    outUnitCostRows.forEach(
      (r) => r.outUnitCost != null && outUnitCostSet.add(r.outUnitCost),
    );
    map["outUnitCost"] = Array.from(outUnitCostSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const outSellPriceRows = getFilteredByOthers("outSellPrice");
    const outSellPriceSet = new Set<number>();
    outSellPriceRows.forEach(
      (r) => r.outSellPrice != null && outSellPriceSet.add(r.outSellPrice),
    );
    map["outSellPrice"] = Array.from(outSellPriceSet)
      .sort((a, b) => a - b)
      .map((v) => ({
        label: v.toLocaleString() + " ₫",
        value: v.toLocaleString() + " ₫",
      }));

    const outMarginRows = getFilteredByOthers("outMargin");
    const outMarginSet = new Set<number>();
    outMarginRows.forEach(
      (r) => r.outMargin != null && outMarginSet.add(r.outMargin),
    );
    map["outMargin"] = Array.from(outMarginSet)
      .sort((a, b) => a - b)
      .map((v) => ({ label: v.toFixed(1) + "%", value: v.toFixed(1) + "%" }));

    return map;
  }, [displayRows, tableState.columnSearch, tableState.columnFilters]);

  const filteredRows = useMemo(() => {
    const result = getFilteredByOthers("");

    // Sort
    if (tableState.sorts.length > 0) {
      const sortStr = tableState.sorts[0];
      const direction = sortStr.startsWith("-") ? "desc" : "asc";
      const column = sortStr.replace("-", "");
      result.sort((a, b) => {
        let valA: any = a[column as keyof typeof a];
        let valB: any = b[column as keyof typeof b];

        if (
          column === "inQty" ||
          column === "outQty" ||
          column === "balanceQty" ||
          column === "inTotal" ||
          column === "outCogs" ||
          column === "balanceValue" ||
          column === "outRevenue" ||
          column === "outProfit"
        ) {
          valA = Number(valA || 0);
          valB = Number(valB || 0);
        } else if (typeof valA === "string" && typeof valB === "string") {
          return direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    displayRows,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
  ]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const totals = useMemo<FifoFlatTableTotals>(() => {
    let latestRow = filteredRows[0];
    if (tableState.sorts.length > 0) {
      latestRow = [...filteredRows].sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      )[0];
    }

    return filteredRows.reduce(
      (acc, r) => {
        acc.inQty += r.inQty || 0;
        acc.inValue += r.inTotal || 0;
        acc.outQty += r.outQty || 0;
        acc.outValue += r.outCogs || 0;
        acc.outRevenue += r.outRevenue || 0;
        acc.outProfit += r.outProfit || 0;
        return acc;
      },
      {
        inQty: 0,
        inValue: 0,
        outQty: 0,
        outValue: 0,
        outRevenue: 0,
        outProfit: 0,
        balanceQty: latestRow?.balanceQty || 0,
        balanceValue: latestRow?.balanceValue || 0,
      },
    );
  }, [filteredRows, tableState.sorts]);

  const activeFilterCount = tableState.activeFilterCount;

  return (
    <>
      <DrawerSection
        title={t("vinfastParts:FIFO_LEDGER_SECTION", "Lịch sử xuất nhập kho")}
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
              className="h-8 gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              onClick={() => setExportOpen(true)}
            >
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              <span>{t("common:exportExcel", "Xuất Excel")}</span>
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="py-8 flex justify-center text-slate-500 text-sm">
            Loading...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <FifoFlatTable
              data={paginatedRows}
              onOpenInvoice={(id) => setInvoiceIdToOpen(id)}
              tableState={tableState}
              totals={totals}
              optionsMap={optionsMap}
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
        )}
      </DrawerSection>

      <ErpInvoiceStandaloneDrawer
        isOpen={!!invoiceIdToOpen}
        invoiceId={invoiceIdToOpen}
        onClose={() => setInvoiceIdToOpen(null)}
      />

      <VinfastPartsStockExportDrawer
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        buildBaseQuery={buildBaseQuery}
      />
    </>
  );
}
