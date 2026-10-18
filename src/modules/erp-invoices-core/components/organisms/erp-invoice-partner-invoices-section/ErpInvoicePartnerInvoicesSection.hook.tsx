import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import { invoiceDebtsApi } from "@/modules/accounting/api/invoiceDebtsApi";
import { buildPartnerInvoiceColumns } from "./ErpInvoicePartnerInvoicesSection.columns";
import { buildPartnerInvoiceSummaryRow } from "./ErpInvoicePartnerInvoicesSection.summary";
import type { ErpInvoicePartnerInvoicesSectionProps } from "./ErpInvoicePartnerInvoicesSection.type";

export function useErpInvoicePartnerInvoices({
  taxCode,
  partnerName,
  partnerType,
  onPreviewInvoice,
}: ErpInvoicePartnerInvoicesSectionProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);
  const tableState = useTableColumnState(
    `partner-invoices-drawer-${partnerType}-${taxCode || partnerName || "all"}`,
  );

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const {
    data: invoices = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["invoice-partner-invoices", partnerType, taxCode, partnerName],
    queryFn: () => {
      if (!taxCode && !partnerName) return Promise.resolve([]);
      return invoiceDebtsApi.getPartnerInvoices(taxCode || "KHONG_MST", {
        partner_type: partnerType,
        partner_name: partnerName || undefined,
      });
    },
    enabled: Boolean(taxCode || partnerName),
    staleTime: DEFAULT_STALE_TIME,
  });

  useEffect(() => {
    setPage(1);
  }, [
    taxCode,
    partnerName,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  const filteredInvoices = useMemo(
    () => filterClientItems(invoices, tableState, { dateField: "invoiceDate" }),
    [invoices, tableState],
  );

  const total = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, page, pageSize]);

  const cumulativeItems = useMemo(
    () => filteredInvoices.slice(0, page * pageSize),
    [filteredInvoices, page, pageSize],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: invoices,
        defaultAlign: "center",
      }),
    [tableState, invoices],
  );

  const columns = useMemo(
    () => buildPartnerInvoiceColumns({ t, headerFilter, onPreviewInvoice }),
    [t, headerFilter, onPreviewInvoice],
  );

  const summaryRow = useMemo(
    () =>
      buildPartnerInvoiceSummaryRow({
        t,
        paginatedInvoices,
        cumulativeItems,
        filteredInvoices,
        totalItems: total,
        page,
        totalPages,
      }),
    [
      t,
      paginatedInvoices,
      cumulativeItems,
      filteredInvoices,
      total,
      page,
      totalPages,
    ],
  );

  const handleClearFilters = useCallback(() => {
    tableState.resetFilters();
    setPage(1);
  }, [tableState]);

  return {
    invoices,
    paginatedInvoices,
    filteredInvoices,
    isLoading,
    total,
    totalPages,
    page,
    pageSize,
    setPage,
    setPageSize,
    columns,
    summaryRow,
    tableState,
    handleClearFilters,
    refetch,
  };
}
