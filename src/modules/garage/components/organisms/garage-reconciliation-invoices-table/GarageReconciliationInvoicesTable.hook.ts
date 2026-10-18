import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { buildReconciliationInvoiceColumns } from "./GarageReconciliationInvoicesTable.columns";
import type { GarageReconciliationInvoicesTableProps } from "./GarageReconciliationInvoicesTable.type";

export function useGarageReconciliationInvoicesTable(
  props: GarageReconciliationInvoicesTableProps,
) {
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);

  const translate = useCallback(
    (key: string, defaultValue?: string): string =>
      t(key, defaultValue || key) as string,
    [t],
  );

  const isAllSelected = useMemo(() => {
    return (
      props.items.length > 0 &&
      props.items.every((inv: ErpInvoice) => !!props.selectedMap[inv.id])
    );
  }, [props.items, props.selectedMap]);

  const handlePageReset = useCallback(() => {
    props.onPageChange(1);
  }, [props.onPageChange]);

  const columns = useMemo(() => {
    return buildReconciliationInvoiceColumns({
      invoiceDirection: props.invoiceDirection,
      editMode: props.editMode,
      isAllSelected,
      selectedMap: props.selectedMap,
      tableState: props.tableState,
      dateFrom: props.dateFrom,
      dateTo: props.dateTo,
      t: translate,
      onSelectAll: props.onSelectAllInvoices,
      onToggle: props.onToggleInvoice,
      onDateFromChange: props.onDateFromChange,
      onDateToChange: props.onDateToChange,
      onPageReset: handlePageReset,
      onViewDetail: props.onViewInvoiceDetail,
      onPreviewPdf: props.onPreviewInvoicePdf,
    });
  }, [
    props.invoiceDirection,
    props.editMode,
    isAllSelected,
    props.selectedMap,
    props.tableState,
    props.dateFrom,
    props.dateTo,
    translate,
    props.onSelectAllInvoices,
    props.onToggleInvoice,
    props.onDateFromChange,
    props.onDateToChange,
    handlePageReset,
    props.onViewInvoiceDetail,
    props.onPreviewInvoicePdf,
  ]);

  return {
    columns,
    isAllSelected,
    t: translate,
  };
}
