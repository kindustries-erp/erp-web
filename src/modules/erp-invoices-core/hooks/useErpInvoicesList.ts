import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import {
  useErpInvoiceListStore,
  type Direction,
} from "./useErpInvoiceListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export function useErpInvoicesList(
  initialDirection: Direction | "ALL" = "IN",
  partnerTaxCode?: string,
) {
  const [direction, setDirection] = useState<Direction | "ALL">(
    initialDirection,
  );
  const [invoices, setInvoices] = useState<ErpInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const store = useErpInvoiceListStore();
  const state = store.states[direction === "ALL" ? "IN" : direction]; // Use IN state for ALL

  const tableState = useTableColumnState(`erp-invoices-table-${direction}`);

  const activeSort = tableState.sorts[0] || "";
  let sortBy = "";
  let sortOrder: "asc" | "desc" = "desc";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  } else {
    sortBy = "invoiceDate";
    sortOrder = "desc";
  }

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "DRAFT", label: "Nháp" },
      { value: "CONFIRMED", label: "Đã xác nhận" },
      { value: "CANCELLED", label: "Đã hủy" },
    ],
    [],
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const debounce = (fn: () => void) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 400);
  };

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpInvoicesCoreApi.list({
        direction: direction === "ALL" ? undefined : direction,
        partner_tax_code: partnerTaxCode,
        search: state.search || undefined,
        seller_name: state.seller_name || undefined,
        buyer_name: state.buyer_name || undefined,
        date_from: state.dateFrom ? `${state.dateFrom}T00:00:00` : undefined,
        date_to: state.dateTo ? `${state.dateTo}T23:59:59` : undefined,
        status: state.status || undefined,
        tag_id: state.tag_id || undefined,
        page: state.page,
        pageSize: state.pageSize,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
        column_search: JSON.stringify(tableState.columnSearch),
        column_filters: JSON.stringify(tableState.columnFilters),
      });
      setInvoices(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [
    direction,
    partnerTaxCode,
    state.search,
    state.seller_name,
    state.buyer_name,
    state.dateFrom,
    state.dateTo,
    state.status,
    state.tag_id,
    state.page,
    state.pageSize,
    sortBy,
    sortOrder,
    tableState.columnSearch,
    tableState.columnFilters,
  ]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const activeFilterCount = [
    !!state.period || !!state.dateFrom || !!state.dateTo,
    !!state.search,
    !!state.status,
    !!state.seller_name,
    !!state.buyer_name,
    !!state.tag_id,
  ].filter(Boolean).length;

  const safeDir = direction === "ALL" ? "IN" : direction;

  const filterPanel = useMemo(
    () => ({
      state: {
        period: state.period,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        channel: "",
        search: state.search,
        amountMin: "",
        amountMax: "",
        status: state.status,
        counterpartySource: "",
        custom: {
          seller_name: state.seller_name,
          buyer_name: state.buyer_name,
          tag_id: state.tag_id,
        },
      },
      inputs: {
        search: state.searchInput,
        amountMin: "",
        amountMax: "",
      },
      panelOpen: state.filterPanelOpen,
      openPanel: () => store.setFilterPanelOpen(safeDir, true),
      closePanel: () => store.setFilterPanelOpen(safeDir, false),
      togglePanel: () => store.setFilterPanelOpen(safeDir, (prev) => !prev),
      setPeriod: (v: string) => store.setPeriod(safeDir, v),
      setDateFrom: (v: string) => store.setDateFrom(safeDir, v),
      setDateTo: (v: string) => store.setDateTo(safeDir, v),
      setChannel: () => {},
      setSearchInput: (v: string) => {
        store.setSearchInput(safeDir, v);
        if (!v) {
          store.setSearch(safeDir, "");
          return;
        }
        debounce(() => {
          store.setSearch(safeDir, v);
        });
      },
      setAmountMinInput: () => {},
      setAmountMaxInput: () => {},
      setStatus: (v: string) => store.setStatus(safeDir, v),
      setCounterpartySource: () => {},
      setCustom: (key: string, v: string) => {
        if (key === "seller_name") store.setSellerName(safeDir, v);
        if (key === "buyer_name") store.setBuyerName(safeDir, v);
        if (key === "tag_id") store.setTagId(safeDir, v);
      },
      resetAll: () => {
        store.resetAllFilters(safeDir);
        tableState.resetFilters();
      },
      hasActiveFilter: activeFilterCount > 0,
      activeFilterCount,
    }),
    [state, store, safeDir, activeFilterCount, tableState],
  );

  return {
    direction,
    setDirection,
    page: state.page,
    setPage: (p: number) => store.setPage(safeDir, p),
    pageSize: state.pageSize,
    setPageSize: (s: number) => store.setPageSize(safeDir, s),
    invoices,
    total,
    totalPages,
    loading,
    sortBy,
    sortOrder,
    handleSort: (key: string) => {
      tableState.toggleSort(key);
      store.setPage(safeDir, 1);
    },
    filterPanel,
    loadInvoices,
    STATUS_OPTIONS,
    tableState,
  };
}
