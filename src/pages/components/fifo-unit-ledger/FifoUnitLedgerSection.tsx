import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TablePagination } from "@/shared/components/TablePagination";
import { money } from "@/shared/utils/format";

import { useFifoUnitLedger } from "./useFifoUnitLedger";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { FifoGroupedTable, FifoGroupedTableTotals } from "./FifoGroupedTable";
import { buildGroupedRows } from "./fifoTransform";

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

  const displayRows = useMemo(() => {
    return buildGroupedRows(rows);
  }, [rows]);

  const tableState = useTableColumnState("fifo-unit-ledger");

  const filterOptions = useMemo(() => {
    const inQtyOpts = new Set<number>();
    const outQtyOpts = new Set<number>();
    const inTotalOpts = new Set<number>();
    const outCogsOpts = new Set<number>();
    const lotBalanceQtyOpts = new Set<number>();
    const lotBalanceTotalOpts = new Set<number>();
    const outPriceOpts = new Set<number>();
    const outRevenueOpts = new Set<number>();
    const outProfitMarginOpts = new Set<number>();
    const inUnitCostOpts = new Set<number>();

    displayRows.forEach((r) => {
      if (r.inQty != null) inQtyOpts.add(r.inQty);
      if (r.inUnitCost != null) inUnitCostOpts.add(r.inUnitCost);
      if (r.outQty != null) outQtyOpts.add(r.outQty);
      if (r.inTotal != null) inTotalOpts.add(r.inTotal);
      if (r.outCogs != null) outCogsOpts.add(r.outCogs);
      if (r.lotBalanceQty != null) lotBalanceQtyOpts.add(r.lotBalanceQty);
      if (r.lotBalanceTotal != null) lotBalanceTotalOpts.add(r.lotBalanceTotal);
      if (r.outPrice != null) outPriceOpts.add(r.outPrice);
      if (r.outRevenue != null) outRevenueOpts.add(r.outRevenue);
      if (r.outProfitMargin != null) outProfitMarginOpts.add(r.outProfitMargin);
    });

    return {
      inQty: Array.from(inQtyOpts).map((v) => ({
        label: String(v),
        value: String(v),
      })),
      outQty: Array.from(outQtyOpts).map((v) => ({
        label: String(v),
        value: String(v),
      })),
      inTotal: Array.from(inTotalOpts).map((v) => ({
        label: money(v),
        value: String(v),
      })),
      outCogs: Array.from(outCogsOpts).map((v) => ({
        label: money(v),
        value: String(v),
      })),
      lotBalanceQty: Array.from(lotBalanceQtyOpts).map((v) => ({
        label: String(v),
        value: String(v),
      })),
      lotBalanceTotal: Array.from(lotBalanceTotalOpts).map((v) => ({
        label: money(v),
        value: String(v),
      })),
      outPrice: Array.from(outPriceOpts).map((v) => ({
        label: String(v),
        value: String(v),
      })),
      outRevenue: Array.from(outRevenueOpts).map((v) => ({
        label: String(v),
        value: String(v),
      })),
      outProfitMargin: Array.from(outProfitMarginOpts).map((v) => ({
        label: `${v.toFixed(2)}%`,
        value: String(v),
      })),
      inUnitCost: Array.from(inUnitCostOpts).map((v) => ({
        label: money(v),
        value: String(v),
      })),
    };
  }, [displayRows]);

  const filteredRows = useMemo(() => {
    let result = [...displayRows];

    // Text search
    if (tableState.columnSearch["inQty"]) {
      const q = tableState.columnSearch["inQty"].toLowerCase();
      result = result.filter(
        (r) => r.inQty != null && String(r.inQty).includes(q),
      );
    }
    if (tableState.columnSearch["outQty"]) {
      const q = tableState.columnSearch["outQty"].toLowerCase();
      result = result.filter(
        (r) => r.outQty != null && String(r.outQty).includes(q),
      );
    }
    if (tableState.columnSearch["inTotal"]) {
      const q = tableState.columnSearch["inTotal"].toLowerCase();
      result = result.filter(
        (r) => r.inTotal != null && String(r.inTotal).includes(q),
      );
    }
    if (tableState.columnSearch["outCogs"]) {
      const q = tableState.columnSearch["outCogs"].toLowerCase();
      result = result.filter(
        (r) => r.outCogs != null && String(r.outCogs).includes(q),
      );
    }
    if (tableState.columnSearch["lotBalanceQty"]) {
      const q = tableState.columnSearch["lotBalanceQty"].toLowerCase();
      result = result.filter(
        (r) => r.lotBalanceQty != null && String(r.lotBalanceQty).includes(q),
      );
    }
    if (tableState.columnSearch["lotBalanceTotal"]) {
      const q = tableState.columnSearch["lotBalanceTotal"].toLowerCase();
      result = result.filter(
        (r) =>
          r.lotBalanceTotal != null && String(r.lotBalanceTotal).includes(q),
      );
    }

    // Date range filter for inDate
    const inDateRange = tableState.columnSearch["inDate"];
    if (inDateRange) {
      const [from, to] = inDateRange.split("|");
      if (from || to) {
        result = result.filter((r) => {
          if (!r.inDate) return false;
          const rDate = new Date(r.inDate).getTime();
          if (from && rDate < new Date(from).getTime()) return false;
          // date from UI is start of day, so add 86400000 - 1 for end of day
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
        result = result.filter((r) => {
          if (!r.outDate) return false;
          const rDate = new Date(r.outDate).getTime();
          if (from && rDate < new Date(from).getTime()) return false;
          if (to && rDate > new Date(to).getTime() + 86400000 - 1) return false;
          return true;
        });
      }
    }

    // Checkbox filters
    if (tableState.columnFilters["inQty"]?.length) {
      result = result.filter(
        (r) =>
          r.inQty != null &&
          tableState.columnFilters["inQty"].includes(String(r.inQty)),
      );
    }
    if (tableState.columnFilters["outQty"]?.length) {
      result = result.filter(
        (r) =>
          r.outQty != null &&
          tableState.columnFilters["outQty"].includes(String(r.outQty)),
      );
    }
    if (tableState.columnFilters["inTotal"]?.length) {
      result = result.filter(
        (r) =>
          r.inTotal != null &&
          tableState.columnFilters["inTotal"].includes(String(r.inTotal)),
      );
    }
    if (tableState.columnFilters["outCogs"]?.length) {
      result = result.filter(
        (r) =>
          r.outCogs != null &&
          tableState.columnFilters["outCogs"].includes(String(r.outCogs)),
      );
    }
    if (tableState.columnFilters["lotBalanceQty"]?.length) {
      result = result.filter(
        (r) =>
          r.lotBalanceQty != null &&
          tableState.columnFilters["lotBalanceQty"].includes(
            String(r.lotBalanceQty),
          ),
      );
    }
    if (tableState.columnFilters["lotBalanceTotal"]?.length) {
      result = result.filter(
        (r) =>
          r.lotBalanceTotal != null &&
          tableState.columnFilters["lotBalanceTotal"].includes(
            String(r.lotBalanceTotal),
          ),
      );
    }
    if (tableState.columnFilters["outPrice"]?.length) {
      result = result.filter(
        (r) =>
          r.outPrice != null &&
          tableState.columnFilters["outPrice"].includes(String(r.outPrice)),
      );
    }
    if (tableState.columnFilters["outRevenue"]?.length) {
      result = result.filter(
        (r) =>
          r.outRevenue != null &&
          tableState.columnFilters["outRevenue"].includes(String(r.outRevenue)),
      );
    }
    if (tableState.columnFilters["outProfitMargin"]?.length) {
      result = result.filter(
        (r) =>
          r.outProfitMargin != null &&
          tableState.columnFilters["outProfitMargin"].includes(
            String(r.outProfitMargin),
          ),
      );
    }
    if (tableState.columnFilters["inUnitCost"]?.length) {
      result = result.filter(
        (r) =>
          r.inUnitCost != null &&
          tableState.columnFilters["inUnitCost"].includes(String(r.inUnitCost)),
      );
    }

    // Re-calculate isFirstOfGroup for the filtered view so that partial lots don't lose their IN data rendering
    const groupSeen = new Set<string>();
    result = result.map((r) => {
      if (!groupSeen.has(r.groupId)) {
        groupSeen.add(r.groupId);
        return { ...r, isFirstOfGroup: true };
      }
      return { ...r, isFirstOfGroup: false };
    });

    return result;
  }, [displayRows, tableState.columnSearch, tableState.columnFilters]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const totals = useMemo<FifoGroupedTableTotals>(() => {
    let inQty = 0;
    let outQty = 0;
    let inValue = 0;
    let outValue = 0;
    let stockQty = 0;
    let stockValue = 0;
    let outRevenue = 0;

    const groupSeen = new Set<string>();
    const lastRowOfGroup = new Map<string, any>();

    filteredRows.forEach((r) => {
      if (!groupSeen.has(r.groupId)) {
        groupSeen.add(r.groupId);
        inQty += r.inQty || 0;
        inValue += r.inTotal || 0;
      }
      outQty += r.outQty || 0;
      outValue += r.outCogs || 0;
      outRevenue += r.outRevenue || 0;

      // Keep replacing with the latest row of this group to get the final visible balance
      lastRowOfGroup.set(r.groupId, r);
    });

    lastRowOfGroup.forEach((r) => {
      stockQty += r.lotBalanceQty || 0;
      stockValue += r.lotBalanceTotal || 0;
    });

    return {
      inQty,
      outQty,
      inValue,
      outValue,
      stockQty,
      stockValue,
      outRevenue,
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
        {isLoading ? (
          <div className="py-8 flex justify-center text-slate-500 text-sm">
            Loading...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <FifoGroupedTable
              data={paginatedRows}
              onOpenInvoice={setInvoiceIdToOpen}
              tableState={tableState}
              filterOptions={filterOptions}
              totals={totals}
            />
            <TablePagination
              page={page}
              pageSize={pageSize}
              onPage={setPage}
              onPageSize={setPageSize}
              total={filteredRows.length}
              totalPages={Math.ceil(filteredRows.length / pageSize)}
            />
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
