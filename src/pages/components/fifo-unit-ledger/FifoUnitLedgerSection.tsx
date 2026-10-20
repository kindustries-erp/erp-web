import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DownloadCloud } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TablePagination } from "@/shared/components/TablePagination";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components";

import { useFifoUnitLedger } from "./useFifoUnitLedger";
import { VinfastPartsStockExportDrawer } from "../VinfastPartsStockExportDrawer";
import { FifoFlatTable } from "./FifoFlatTable";
import { buildFlatLedgerRows } from "./fifoTransform";
import { useFifoLedgerView } from "./useFifoLedgerView";

interface FifoUnitLedgerSectionProps {
  sku: string;
}

/** Mục "Lịch sử xuất nhập kho" trong drawer chi tiết phụ tùng. */
export function FifoUnitLedgerSection({ sku }: FifoUnitLedgerSectionProps) {
  const { t } = useTranslation(["vinfastParts", "reports", "common"]);
  const [invoiceIdToOpen, setInvoiceIdToOpen] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const { data, isLoading } = useFifoUnitLedger(sku, true);
  const rows = data || [];

  const displayRows = useMemo(() => buildFlatLedgerRows(rows), [rows]);

  const tableState = useTableColumnState("fifo-unit-ledger");
  const view = useFifoLedgerView(displayRows, tableState);

  const buildBaseQuery = () => ({
    columnFilters: JSON.stringify({ sku: [sku] }),
  });

  return (
    <>
      <DrawerSection
        title={t("vinfastParts:FIFO_LEDGER_SECTION", "Lịch sử xuất nhập kho")}
        titleExtra={
          <div className="flex items-center gap-2">
            {tableState.activeFilterCount > 0 && (
              <FilterButton
                activeCount={tableState.activeFilterCount}
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
            {t("common:loading", "Loading...")}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <FifoFlatTable
              data={view.paginatedRows}
              onOpenInvoice={(id) => setInvoiceIdToOpen(id)}
              tableState={tableState}
              totals={view.totals}
              optionsMap={view.optionsMap}
            />

            {view.filteredRows.length > 0 && (
              <TablePagination
                page={view.page}
                pageSize={view.pageSize}
                pageSizeOptions={[10, 20, 50, 100]}
                total={view.filteredRows.length}
                totalPages={Math.ceil(view.filteredRows.length / view.pageSize)}
                onPage={view.setPage}
                onPageSize={(s: number) => {
                  view.setPageSize(s);
                  view.setPage(1);
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
