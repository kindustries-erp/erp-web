import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/shared/components/DataTable";
import {
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable/createColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { cn } from "@/shared/utils";
import { getMonthlyDebtTableColumns } from "./PartnerMonthlyDebtTable.columns";
import { getMonthlyDebtTableSummaryRow } from "./PartnerMonthlyDebtTable.summary";
import type { PartnerMonthlyDebtTableProps } from "./PartnerMonthlyDebtTable.type";

export const PartnerMonthlyDebtTable = React.memo(
  function PartnerMonthlyDebtTable({
    rows,
    isCustomer = false,
    isLoading = false,
    className,
  }: PartnerMonthlyDebtTableProps) {
    const { t } = useTranslation(["erpInvoices", "debts", "common"]);
    const tableState = useTableColumnState("partner-monthly-debt-table");

    const headerFilter = useMemo(
      () =>
        createColumnHeaderFilter({
          listHook: tableState,
          items: rows,
          defaultAlign: "center",
        }),
      [tableState, rows],
    );

    const filteredRows = useMemo(
      () => filterClientItems(rows, tableState),
      [rows, tableState],
    );

    const totals = useMemo(() => {
      let invoiceCount = 0;
      let totalAmount = 0;
      let paidAmount = 0;
      let balanceAmount = 0;

      for (const r of filteredRows) {
        invoiceCount += r.invoiceCount;
        totalAmount += r.totalAmount;
        paidAmount += r.paidAmount;
        balanceAmount += r.balanceAmount;
      }
      const rate =
        totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

      return { invoiceCount, totalAmount, paidAmount, balanceAmount, rate };
    }, [filteredRows]);

    const columns = useMemo(
      () => getMonthlyDebtTableColumns(headerFilter, isCustomer, t),
      [headerFilter, isCustomer, t],
    );

    const summaryRow = useMemo(
      () =>
        getMonthlyDebtTableSummaryRow(
          filteredRows.length,
          totals,
          isCustomer,
          t,
        ),
      [filteredRows.length, totals, isCustomer, t],
    );

    return (
      <div className={cn("w-full", className)}>
        <DataTable
          items={filteredRows}
          columns={columns}
          getRowKey={(row) => row.id}
          variant="spreadsheet"
          loading={isLoading}
          summaryRow={summaryRow}
          enableColumnResizing={true}
          emptyLabel={t(
            "debts:drawer.noMonthlyTrendData",
            "Chưa có dữ liệu biến động dòng tiền theo tháng",
          )}
        />
      </div>
    );
  },
);
