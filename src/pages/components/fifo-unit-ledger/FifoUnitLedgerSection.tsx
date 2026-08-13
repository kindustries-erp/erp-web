import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TablePagination } from "@/shared/components/TablePagination";

import { useFifoUnitLedger } from "./useFifoUnitLedger";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
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

  const filteredRows = useMemo(() => {
    let result = [...displayRows];
    // Date range filter for transactionDate
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
    return result;
  }, [displayRows, tableState.columnSearch]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const totals = useMemo<FifoFlatTableTotals>(() => {
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
      },
    );
  }, [filteredRows]);

  const activeFilterCount = tableState.activeFilterCount;

  return (
    <>
      <DrawerSection
        title={t("vinfastParts:FIFO_LEDGER_SECTION", "Lịch sử xuất nhập kho")}
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
            />

            {filteredRows.length > 0 && (
              <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-sm text-slate-500">
                  {t("common:showingCount", "Hiển thị {{count}} kết quả", {
                    count: filteredRows.length,
                  })}
                </span>
                <TablePagination
                  page={page}
                  pageSize={pageSize}
                  total={filteredRows.length}
                  totalPages={Math.ceil(filteredRows.length / pageSize)}
                  onPage={setPage}
                  onPageSize={(s: number) => {
                    setPageSize(s);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </DrawerSection>

      <ErpInvoiceStandaloneDrawer
        isOpen={!!invoiceIdToOpen}
        invoiceId={invoiceIdToOpen}
        onClose={() => setInvoiceIdToOpen(null)}
      />
    </>
  );
}
